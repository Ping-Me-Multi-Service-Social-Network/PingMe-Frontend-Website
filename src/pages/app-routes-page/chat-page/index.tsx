import type React from "react";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppSelector } from "@/features/hooks.ts";
import { ChatActionBar } from "../components/chat-shared-components/ChatActionBar.tsx";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import { ChatBox, type ChatBoxRef } from "./components";
import { ChatCard } from "./components/chat-card";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import type { RoomResponse } from "@/types/chat/room";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import { getCurrentUserRoomsApi } from "@/services/chat";
import { useChatSocketHandler } from "@/features/websocket/hooks/useChatSocketHandler";
import { selectUserStatusEvent } from "@/features/websocket/slices/socketSlice";

export default function MessagesPage() {
  const { userSession } = useAppSelector((state) => state.auth);

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
    [],
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

  const chatBoxRef = useRef<ChatBoxRef>(null);
  useChatSocketHandler({
    setRooms,
    setSelectedChat,
    selectedChat,
    selectedRoomIdRef,
    chatBoxRef,
    userSession,
  });

  const userStatusEvent = useAppSelector(selectUserStatusEvent);

  useEffect(() => {
    const statusPayload = userStatusEvent.payload;
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
            : participant,
        ),
      })),
    );
  }, [userStatusEvent.id, userStatusEvent.payload]);

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
