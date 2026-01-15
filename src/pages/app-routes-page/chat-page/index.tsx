"use client";

import type React from "react";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/features/hooks.ts";
import { ChatActionBar } from "../components/chat-shared-components/ChatActionBar.tsx";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import { ChatBox, type ChatBoxRef } from "./components";
import { ChatCard } from "./components/chat-card";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import type { RoomResponse } from "@/types/chat/room";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import { getCurrentUserRoomsApi } from "@/services/chat";
import { SocketManager } from "@/services/ws/socketManager";
import type {
  MessageCreatedEventPayload,
  RoomUpdatedEventPayload,
  MessageRecalledEventPayload,
  RoomCreatedEventPayload,
  RoomMemberAddedEventPayload,
  RoomMemberRemovedEventPayload,
  RoomMemberRoleChangedEventPayload,
} from "@/services/ws/module/chatSocket";
import type { UserStatusPayload } from "@/types/common/userStatus.ts";
import { selectChatEvent, clearChatEvent } from "@/features/slices/chatSlice";

export default function MessagesPage() {
  const { userSession } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [isFetchingRooms, setIsFetchingRooms] = useState(false);

  const [roomsPagination, setRoomsPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    hasMore: true,
    isLoadingMore: false,
  });

  const fetchRooms = useCallback(
    async (page: number, size: number, append = false) => {
      try {
        if (!append) setIsFetchingRooms(true);
        else setRoomsPagination((prev) => ({ ...prev, isLoadingMore: true }));

        const res = (await getCurrentUserRoomsApi({ page, size })).data.data;

        setRooms((prev) => {
          if (append) {
            return [...prev, ...res.content];
          }
          return res.content;
        });

        setRoomsPagination({
          currentPage: res.page,
          totalPages: res.totalPages,
          hasMore: res.hasMore,
          isLoadingMore: false,
        });
      } catch (err) {
        console.error(getErrorMessage(err));
      } finally {
        setIsFetchingRooms(false);
        setRoomsPagination((prev) => ({ ...prev, isLoadingMore: false }));
      }
    },
    []
  );

  const refetchRooms = () => {
    fetchRooms(1, 20);
  };

  useEffect(() => {
    fetchRooms(1, 20);
  }, [fetchRooms]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold

    if (
      isAtBottom &&
      roomsPagination.hasMore &&
      !roomsPagination.isLoadingMore
    ) {
      fetchRooms(roomsPagination.currentPage + 1, 20, true);
    }
  };

  const [selectedChat, setSelectedChat] = useState<RoomResponse | null>(null);
  const selectedRoomIdRef = useRef<number | null>(null);

  const handleSetSelectedChat = (room: RoomResponse) => {
    setSelectedChat(room);
  };

  useEffect(() => {
    if (!selectedChat) {
      selectedRoomIdRef.current = null;
      SocketManager.leaveRoom();
      return;
    }

    selectedRoomIdRef.current = selectedChat.roomId;
    SocketManager.enterRoom(selectedChat.roomId);

    return () => {
      SocketManager.leaveRoom();
    };
  }, [selectedChat]);

  const chatBoxRef = useRef<ChatBoxRef>(null);

  const handleNewMessage = useCallback((event: MessageCreatedEventPayload) => {
    const message = event.messageResponse;

    setRooms((prev) => {
      const targetRoom = prev.find((r) => r.roomId === message.roomId);
      if (!targetRoom) return prev;

      const updatedRoom = {
        ...targetRoom,
        lastMessage: {
          messageId: message.id,
          senderId: message.senderId,
          preview: message.content,
          messageType: message.type === "SYSTEM" ? "TEXT" : message.type,
          createdAt: message.createdAt,
        },
      };
      const otherRooms = prev.filter((r) => r.roomId !== message.roomId);
      return [updatedRoom, ...otherRooms];
    });

    if (selectedRoomIdRef.current === message.roomId && chatBoxRef.current) {
      chatBoxRef.current.handleIncomingMessage(message);
    }
  }, []);

  const upsertRoom = useCallback((incoming: RoomResponse) => {
    setRooms((prev) => {
      const idx = prev.findIndex((r) => r.roomId === incoming.roomId);

      if (idx === -1) {
        return [incoming, ...prev];
      }

      const merged = { ...prev[idx], ...incoming };
      const filtered = prev.filter((r) => r.roomId !== incoming.roomId);
      return [merged, ...filtered];
    });

    setSelectedChat((prev) => {
      if (prev && prev.roomId === incoming.roomId) {
        return { ...prev, ...incoming };
      }
      return prev;
    });
  }, []);

  const handleRoomUpdated = useCallback(
    (event: RoomUpdatedEventPayload) => {
      upsertRoom(event.roomResponse);

      if (
        event.systemMessage &&
        selectedRoomIdRef.current === event.roomResponse.roomId &&
        chatBoxRef.current
      ) {
        chatBoxRef.current.handleIncomingMessage(event.systemMessage);
      }
    },
    [upsertRoom]
  );

  const handleRecallMessage = useCallback(
    (event: MessageRecalledEventPayload) => {
      if (chatBoxRef.current) {
        chatBoxRef.current.handleRecallMessage(
          event.messageRecalledResponse.id
        );
      }
    },
    []
  );

  const handleRoomCreated = useCallback(
    (event: RoomCreatedEventPayload) => {
      upsertRoom(event.roomResponse);
    },
    [upsertRoom]
  );

  const handleMemberAdded = useCallback(
    (event: RoomMemberAddedEventPayload) => {
      const isCurrentUserAdded = event.targetUserId === userSession?.id;

      if (isCurrentUserAdded) {
        upsertRoom(event.roomResponse);
      } else {
        upsertRoom(event.roomResponse);
      }

      if (
        event.systemMessage &&
        selectedRoomIdRef.current === event.roomResponse.roomId &&
        chatBoxRef.current
      ) {
        chatBoxRef.current.handleIncomingMessage(event.systemMessage);
      }
    },
    [upsertRoom, userSession?.id]
  );

  const handleMemberRemoved = useCallback(
    (event: RoomMemberRemovedEventPayload) => {
      console.log("[PingMe] Member removed event:", event);

      const isCurrentUserRemoved = event.targetUserId === userSession?.id;

      if (isCurrentUserRemoved) {
        setRooms((prev) =>
          prev.filter((r) => r.roomId !== event.roomResponse.roomId)
        );
        setSelectedChat((prev) =>
          prev?.roomId === event.roomResponse.roomId ? null : prev
        );
      } else {
        upsertRoom(event.roomResponse);

        if (
          event.systemMessage &&
          selectedRoomIdRef.current === event.roomResponse.roomId &&
          chatBoxRef.current
        ) {
          chatBoxRef.current.handleIncomingMessage(event.systemMessage);
        }
      }
    },
    [upsertRoom, userSession?.id]
  );

  const handleMemberRoleChanged = useCallback(
    (event: RoomMemberRoleChangedEventPayload) => {
      upsertRoom(event.roomResponse);

      if (
        event.systemMessage &&
        selectedRoomIdRef.current === event.roomResponse.roomId &&
        chatBoxRef.current
      ) {
        chatBoxRef.current.handleIncomingMessage(event.systemMessage);
      }
    },
    [upsertRoom]
  );

  const chatEvent = useAppSelector(selectChatEvent);

  useEffect(() => {
    if (!chatEvent) return;

    switch (chatEvent.type) {
      case "MESSAGE_CREATED":
        handleNewMessage(chatEvent.payload);
        break;
      case "ROOM_UPDATED":
        handleRoomUpdated(chatEvent.payload);
        break;
      case "MESSAGE_RECALLED":
        handleRecallMessage(chatEvent.payload);
        break;
      case "ROOM_CREATED":
        handleRoomCreated(chatEvent.payload);
        break;
      case "MEMBER_ADDED":
        handleMemberAdded(chatEvent.payload);
        break;
      case "MEMBER_REMOVED":
        handleMemberRemoved(chatEvent.payload);
        break;
      case "MEMBER_ROLE_CHANGED":
        handleMemberRoleChanged(chatEvent.payload);
        break;
    }

    dispatch(clearChatEvent());
  }, [
    chatEvent,
    dispatch,
    handleNewMessage,
    handleRecallMessage,
    handleRoomCreated,
    handleMemberAdded,
    handleMemberRemoved,
    handleMemberRoleChanged,
    handleRoomUpdated,
  ]);

  const [statusPayload, setStatusPayload] = useState<UserStatusPayload | null>(
    null
  );

  useEffect(() => {
    const handleUserStatusEvent = (e: Event) => {
      const event = (e as CustomEvent).detail as UserStatusPayload;
      setStatusPayload(event);
    };

    window.addEventListener("socket:user-status", handleUserStatusEvent);

    return () => {
      window.removeEventListener("socket:user-status", handleUserStatusEvent);
    };
  }, []);

  useEffect(() => {
    if (!statusPayload) return;

    setRooms((prevRooms) =>
      prevRooms.map((room) => ({
        ...room,
        participants: room.participants.map((participant) =>
          participant.userId === Number(statusPayload.userId)
            ? {
                ...participant,
                status: statusPayload.isOnline ? "ONLINE" : "OFFLINE",
              }
            : participant
        ),
      }))
    );
  }, [statusPayload]);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <ChatActionBar
          onFriendAdded={refetchRooms}
          setSelectedChat={handleSetSelectedChat}
        />

        <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
          {isFetchingRooms ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {rooms.map((room) => (
                <ChatCard
                  key={room.roomId}
                  room={room}
                  userSession={userSession}
                  isSelected={selectedChat?.roomId === room.roomId}
                  onClick={() => setSelectedChat(room)}
                />
              ))}
              {roomsPagination.isLoadingMore && (
                <div className="p-4 text-center">
                  <div className="text-sm text-gray-500">Đang tải thêm...</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedChat ? (
        <ChatBox ref={chatBoxRef} selectedChat={selectedChat} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            title="Chọn một cuộc trò chuyện"
            description="Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin"
          />
        </div>
      )}
    </div>
  );
}
