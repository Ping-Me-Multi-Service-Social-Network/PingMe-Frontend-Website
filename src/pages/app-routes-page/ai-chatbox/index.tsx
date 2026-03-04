import { useState, useEffect, useCallback } from "react";
import { aiChatBoxService } from "@/services/ai/ai-chat-box";
import type { AIChatRoomInformation } from "@/types/ai/aiChatRoomInformation";
import type { TitleUpdate } from "@/types/ai/titleUpdate";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import "./ai-chatbox.css";

const ROOMS_PAGE_SIZE = 5;

export default function AIChatBoxPage() {
  const [rooms, setRooms] = useState<AIChatRoomInformation[]>([]);

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [roomsPage, setRoomsPage] = useState(0);
  const [hasMoreRooms, setHasMoreRooms] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // ---- Load initial rooms ----
  useEffect(() => {
    let cancelled = false;

    const loadRooms = async () => {
      setLoadingRooms(true);
      try {
        const res = await aiChatBoxService.getUserChatRooms(0, ROOMS_PAGE_SIZE);
        if (cancelled) return;
        const slice = res.data.data;
        setRooms(slice.content);
        setHasMoreRooms(!slice.last);
        setRoomsPage(0);
      } catch (err) {
        console.error("[AIChatBoxPage] Error loading rooms:", err);
      } finally {
        if (!cancelled) {
          setLoadingRooms(false);
        }
      }
    };

    loadRooms();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Load more rooms ----
  const handleLoadMore = useCallback(async () => {
    if (loadingRooms) return;
    setLoadingRooms(true);

    const nextPage = roomsPage + 1;
    try {
      const res = await aiChatBoxService.getUserChatRooms(
        nextPage,
        ROOMS_PAGE_SIZE,
      );
      const slice = res.data.data;
      setRooms((prev) => [...prev, ...slice.content]);
      setHasMoreRooms(!slice.last);
      setRoomsPage(nextPage);
    } catch (err) {
      console.error("[AIChatBoxPage] Error loading more rooms:", err);
    } finally {
      setLoadingRooms(false);
    }
  }, [loadingRooms, roomsPage]);

  // ---- New chat ----
  const handleNewChat = useCallback(() => {
    setActiveRoomId(null);
  }, []);

  // ---- Select room ----
  const handleSelectRoom = useCallback((roomId: string) => {
    setActiveRoomId(roomId);
  }, []);

  // ---- Room created (from ChatArea) ----
  const handleRoomCreated = useCallback((room: AIChatRoomInformation) => {
    setRooms((prev) => [room, ...prev]);
    setActiveRoomId(room.id);
  }, []);

  // ---- Bump room to top (after AI response in existing room) ----
  const handleRoomBumpToTop = useCallback((roomId: string) => {
    setRooms((prev) => {
      const idx = prev.findIndex((r) => r.id === roomId);
      if (idx <= 0) return prev; // already at top or not found
      const room = { ...prev[idx], updatedAt: new Date().toISOString() };
      const rest = prev.filter((_, i) => i !== idx);
      return [room, ...rest];
    });
  }, []);

  // ---- WebSocket: title update ----
  useEffect(() => {
    const handler = (e: Event) => {
      const { chatRoomId, title } = (e as CustomEvent<TitleUpdate>).detail;
      setRooms((prev) =>
        prev.map((r) => (r.id === chatRoomId ? { ...r, title } : r)),
      );
    };

    window.addEventListener("socket:update-ai-chat-room-title", handler);
    return () => {
      window.removeEventListener("socket:update-ai-chat-room-title", handler);
    };
  }, []);

  // ---- Delete room ----
  const handleDeleteRoom = useCallback(async (roomId: string) => {
    try {
      await aiChatBoxService.deleteChatRoom(roomId);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      if (activeRoomId === roomId) {
        setActiveRoomId(null);
      }
    } catch (err) {
      console.error("[AIChatBoxPage] Error deleting room:", err);
    }
  }, [activeRoomId]);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar
        rooms={rooms}
        activeRoomId={activeRoomId}
        onSelectRoom={handleSelectRoom}
        onNewChat={handleNewChat}
        onLoadMore={handleLoadMore}
        onDeleteRoom={handleDeleteRoom}
        hasMore={hasMoreRooms}
        loading={loadingRooms}
      />
      <ChatArea
        activeRoomId={activeRoomId}
        activeRoomTitle={rooms.find((r) => r.id === activeRoomId)?.title || undefined}
        onRoomCreated={handleRoomCreated}
        onRoomBumpToTop={handleRoomBumpToTop}
      />
    </div>
  );
}
