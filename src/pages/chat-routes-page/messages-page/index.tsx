import type React from "react";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppSelector } from "@/features/hooks.ts";
import { SharedTopBar } from "../components/SharedTopbar.tsx";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import { ChatBox, type ChatBoxRef } from "./components";
import { ChatCard } from "./components/chat-card";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import type { RoomResponse } from "@/types/chat/room";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import { getCurrentUserRoomsApi } from "@/services/chat";
import {
  connectChatWS,
  disconnectChatWS,
  enterRoom,
  leaveRoom,
  type MessageCreatedEventPayload,
  type RoomUpdatedEventPayload,
  type MessageRecalledEventPayload,
  type RoomCreatedEventPayload,
  type RoomMemberAddedEventPayload,
  type RoomMemberRemovedEventPayload,
  type RoomMemberRoleChangedEventPayload,
} from "@/services/ws/chatSocket";
import type { UserStatusPayload } from "@/types/common/userStatus";
import {
  connectUserStatusSocket,
  disconnectUserStatusSocket,
} from "@/services/ws/userStatusSocket.ts";

export default function MessagesPage() {
  const { userSession } = useAppSelector((state) => state.auth);

  // =======================================================================
  // Lấy danh sách các ChatBoxes
  // =======================================================================
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

  // =======================================================================
  // Xử lý scroll để load thêm phòng
  // Khi scroll đến 100% chiều cao container sẽ load thêm
  // =======================================================================
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

  // =======================================================================
  // Xử lý chọn chat box để hiển thị
  // Xử lý khi thay đổi phòng chat được chọn
  //  - Cập nhật selectedRoomIdRef cho WebSocket tracking
  //  - Enter/leave room để nhận tin nhắn đúng phòng
  // =======================================================================
  const [selectedChat, setSelectedChat] = useState<RoomResponse | null>(null);
  const selectedRoomIdRef = useRef<number | null>(null);

  const handleSetSelectedChat = (room: RoomResponse) => {
    setSelectedChat(room);
  };

  useEffect(() => {
    if (!selectedChat) {
      selectedRoomIdRef.current = null;
      leaveRoom();
      return;
    }

    selectedRoomIdRef.current = selectedChat.roomId;
    enterRoom(selectedChat.roomId);

    return () => {
      leaveRoom();
    };
  }, [selectedChat]);

  // =======================================================================
  // Hàm xử lý sự kiện liên quan đến MESSAGE_CREATED từ WebSocket
  // =======================================================================
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

    // Add message to chat box if viewing this room
    if (selectedRoomIdRef.current === message.roomId && chatBoxRef.current) {
      chatBoxRef.current.handleIncomingMessage(message);
    }
  }, []);

  // =======================================================================
  // Hàm xử lý sự kiện liên quan đến ROOM_UPDATED từ WebSocket
  // =======================================================================
  const upsertRoom = useCallback((incoming: RoomResponse) => {
    setRooms((prev) => {
      const idx = prev.findIndex((r) => r.roomId === incoming.roomId);

      if (idx === -1) {
        // Room mới, thêm vào đầu
        return [incoming, ...prev];
      }

      // Update và đưa lên đầu (reorder)
      const merged = { ...prev[idx], ...incoming };
      const filtered = prev.filter((r) => r.roomId !== incoming.roomId);
      return [merged, ...filtered];
    });

    // Sync selectedChat với incoming data by roomId (not reference)
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

      // Add system message to chat if it exists and we're viewing this room
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

  // =======================================================================
  // Hàm xử lý sự kiện liên quan đến MESSAGE_RECALLED từ WebSocket
  // =======================================================================
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

  // =======================================================================
  // Hàm xử lý sự kiện liên quan đến ROOM_CREATED từ WebSocket
  // =======================================================================
  const handleRoomCreated = useCallback(
    (event: RoomCreatedEventPayload) => {
      upsertRoom(event.roomResponse);
    },
    [upsertRoom]
  );

  // =======================================================================
  // Hàm xử lý sự kiện liên quan đến MEMBER_ADDED từ WebSocket
  // =======================================================================
  const handleMemberAdded = useCallback(
    (event: RoomMemberAddedEventPayload) => {
      const isCurrentUserAdded = event.targetUserId === userSession?.id;

      if (isCurrentUserAdded) {
        upsertRoom(event.roomResponse);
      } else {
        upsertRoom(event.roomResponse);
      }

      // Add system message to chat if it exists and we're viewing this room
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

  // =======================================================================
  // Hàm xử lý sự kiện liên quan đến MEMBER_REMOVED từ WebSocket
  // =======================================================================
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

        // Add system message to chat if it exists and we're viewing this room
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

  // =======================================================================
  // Hàm xử lý sự kiện liên quan đến MEMBER_ROLE_CHANGED từ WebSocket
  // =======================================================================
  const handleMemberRoleChanged = useCallback(
    (event: RoomMemberRoleChangedEventPayload) => {
      upsertRoom(event.roomResponse);

      // Add system message to chat if it exists and we're viewing this room
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

  // =======================================================================
  // Setup WebSocket connection và event handlers
  // Chạy một lần khi component mount
  // =======================================================================

  // Websocket cho cập nhật tin nhắn, phòng chat
  useEffect(() => {
    connectChatWS({
      baseUrl: `${import.meta.env.VITE_BACKEND_BASE_URL}`,
      onDisconnect: (reason) => {
        console.warn("[ChatWS] disconnected:", reason);
      },
      onMessageCreated: (ev: MessageCreatedEventPayload) => {
        handleNewMessage(ev);
      },
      onRoomUpdated: handleRoomUpdated,
      onMessageRecalled: (ev: MessageRecalledEventPayload) => {
        handleRecallMessage(ev);
      },
      onRoomCreated: handleRoomCreated,
      onMemberAdded: handleMemberAdded,
      onMemberRemoved: handleMemberRemoved,
      onMemberRoleChanged: handleMemberRoleChanged,
    });

    return () => {
      disconnectChatWS();
    };
  }, [
    handleNewMessage,
    handleRecallMessage,
    handleRoomCreated,
    handleMemberAdded,
    handleMemberRemoved,
    handleMemberRoleChanged,
    handleRoomUpdated,
  ]);

  // Websocket cho hiển thị trạng thái trực tuyến người dùng
  const [statusPayload, setStatusPayload] = useState<UserStatusPayload | null>(
    null
  );

  useEffect(() => {
    connectUserStatusSocket({
      baseUrl: `${import.meta.env.VITE_BACKEND_BASE_URL}`,
      onStatus: ({ userId, name, isOnline }) => {
        setStatusPayload({ userId, name, isOnline });
      },
    });

    return () => {
      disconnectUserStatusSocket();
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

  // =======================================================================

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <SharedTopBar
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
