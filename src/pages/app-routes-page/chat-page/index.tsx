import type React from "react";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppSelector } from "@/features/hooks.ts";
import { ChatActionBar } from "../components/chat-shared-components/ChatActionBar.tsx";

import { ChatBox } from "./components";
import { ChatCard } from "./components/chat-card";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import type { RoomResponse } from "@/types/chat/room";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import { getCurrentUserRoomsApi } from "@/services/chat";
import { useChatSocketHandler } from "@/features/websocket/hooks/useChatSocketHandler";
import { SocketManager } from "@/features/websocket/socketManager";
import { useTranslation } from "react-i18next";
import { ChatIntroCarousel } from "./components/ChatIntroCarousel";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import "./chat.css";

// Trigger part 3
export default function MessagesPage() {
  const { userSession } = useAppSelector((state) => state.auth);
  const { t } = useTranslation("chat");

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
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

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

  useChatSocketHandler({
    setRooms,
    setSelectedChat,
    selectedChat,
    selectedRoomIdRef,
    userSession,
  });

  useNotificationSound({ currentUserId: userSession?.id });

  useEffect(() => {
    return SocketManager.on("USER_STATUS", (statusPayload) => {
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
    });
  }, []);

  return (
    <div className="chat-shell">
      <div className="chat-sidebar">
        <div className="chat-sidebar__header">
          <ChatActionBar
            onFriendAdded={refetchRooms}
            setSelectedChat={handleSetSelectedChat}
          />
        </div>

        <div className="chat-sidebar__list" onScroll={handleScroll}>
          {isFetchingRooms ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {rooms.map((room, index) => (
                <ChatCard
                  key={room.roomId}
                  room={room}
                  userSession={userSession}
                  isSelected={selectedChat?.roomId === room.roomId}
                  onClick={setSelectedChat}
                  index={index}
                />
              ))}
              {roomsPagination.isLoadingMore && (
                <div className="p-4 text-center">
                  <div
                    className="text-sm"
                    style={{ color: "oklch(0.5 0.02 292)" }}
                  >
                    {t("layout.loadingMore")}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedChat ? (
        <ChatBox selectedChat={selectedChat} />
      ) : (
        <ChatIntroCarousel />
      )}
    </div>
  );
}
