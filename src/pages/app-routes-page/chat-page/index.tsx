import type React from "react";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppSelector } from "@/features/hooks.ts";
import { ChatActionBar } from "../components/chat-shared-components/ChatActionBar.tsx";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ChatBox } from "./components";
import { ChatCard } from "./components/chat-card";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import type { RoomResponse } from "@/types/chat/room";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import { getCurrentUserRoomsApi } from "@/services/chat";
import { useChatSocketHandler } from "@/features/websocket/hooks/useChatSocketHandler";
import { SocketManager } from "@/features/websocket";
import { useTranslation } from "react-i18next";
import { ChatIntroCarousel } from "./components/ChatIntroCarousel";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { getRoomDisplayName } from "./utils/getRoomInfo";
import {
  isEncryptedTextContent,
  decryptTextMessageContent,
} from "./utils/textMessageCrypto";
import "./chat.css";

// Trigger part 3
export default function MessagesPage() {
  const { userSession } = useAppSelector((state) => state.auth);
  const { t } = useTranslation("chat");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

        const response = await getCurrentUserRoomsApi({ page, size });
        const res = response.data?.data;
        const content = res?.content || [];

        setRooms((prev) => {
          if (append) {
            return [...prev, ...content];
          }
          return content;
        });

        // Async decrypt encrypted lastMessage previews for room list
        const encryptedRooms = content.filter(
          (r) =>
            r.lastMessage?.messageType === "TEXT" &&
            isEncryptedTextContent(r.lastMessage.preview),
        );
        if (encryptedRooms.length > 0) {
          Promise.all(
            encryptedRooms.map(async (r) => {
              try {
                const decrypted = await decryptTextMessageContent(r.lastMessage!.preview, r);
                return { roomId: r.roomId, preview: decrypted };
              } catch {
                return null;
              }
            }),
          ).then((results) => {
            const updates = new Map(
              results.filter(Boolean).map((r) => [r!.roomId, r!.preview]),
            );
            if (updates.size > 0) {
              setRooms((prev) =>
                prev.map((r) =>
                  updates.has(r.roomId) && r.lastMessage
                    ? { ...r, lastMessage: { ...r.lastMessage, preview: updates.get(r.roomId)! } }
                    : r,
                ),
              );
            }
          });
        }

        setRoomsPagination({
          currentPage: res?.page || 0,
          totalPages: res?.totalPages || 0,
          hasMore: res?.hasMore || false,
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
  const pendingRoomIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleRoomLeftOrDissolved = (e: CustomEvent<number>) => {
      const roomId = e.detail;
      setRooms((prev) => prev.filter((r) => r.roomId !== roomId));
      setSelectedChat((prev) => (prev?.roomId === roomId ? null : prev));
    };

    window.addEventListener("ROOM_LEFT_OR_DISSOLVED", handleRoomLeftOrDissolved as EventListener);
    return () => {
      window.removeEventListener("ROOM_LEFT_OR_DISSOLVED", handleRoomLeftOrDissolved as EventListener);
    };
  }, []);

  const handleSetSelectedChat = (room: RoomResponse) => {
    setSelectedChat(room);
  };

  useEffect(() => {
    const roomIdParam = searchParams.get("roomId");
    if (!roomIdParam) {
      pendingRoomIdRef.current = null;
      return;
    }

    const roomId = Number(roomIdParam);
    pendingRoomIdRef.current = Number.isFinite(roomId) ? roomId : null;
  }, [searchParams]);

  useEffect(() => {
    const targetRoomId = pendingRoomIdRef.current;
    if (!targetRoomId) return;

    const targetRoom = rooms.find((room) => room.roomId === targetRoomId);
    if (!targetRoom) return;

    if (selectedChat?.roomId !== targetRoom.roomId) {
      setSelectedChat(targetRoom);
    }

    pendingRoomIdRef.current = null;
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("roomId");
    navigate(
      {
        pathname: "/app/chat",
        search: nextSearchParams.toString() ? `?${nextSearchParams.toString()}` : "",
      },
      { replace: true },
    );
  }, [rooms, selectedChat?.roomId, navigate, searchParams]);

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

  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = rooms.filter((room) => {
    const displayName = getRoomDisplayName(room, userSession);
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="chat-shell">
      <div className="chat-sidebar">
        <div className="chat-sidebar__header">
          <ChatActionBar
            onFriendAdded={refetchRooms}
            setSelectedChat={handleSetSelectedChat}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className="chat-sidebar__list" onScroll={handleScroll}>
          {isFetchingRooms ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {filteredRooms.map((room, index) => (
                <ChatCard
                  key={room.roomId}
                  room={room}
                  userSession={userSession}
                  isSelected={selectedChat?.roomId === room.roomId}
                  onClick={setSelectedChat}
                  index={index}
                />
              ))}
              {filteredRooms.length === 0 && !isFetchingRooms && searchQuery && (
                <div className="p-8 text-center text-muted-foreground">
                  {t("sidebar.noResults", "Không tìm thấy kết quả")}
                </div>
              )}
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
