import { useState, useRef, useEffect } from "react";
import type { AIChatRoomInformation } from "@/types/ai/aiChatRoomInformation";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  rooms: AIChatRoomInformation[];
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onNewChat: () => void;
  onLoadMore: () => void;
  onDeleteRoom: (roomId: string) => void;
  hasMore: boolean;
  loading: boolean;
}

export default function Sidebar({
  rooms,
  activeRoomId,
  onSelectRoom,
  onNewChat,
  onLoadMore,
  onDeleteRoom,
  hasMore,
  loading,
}: SidebarProps) {
  const { t } = useTranslation("ai");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpenId]);

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("sidebar.time.justNow");
    if (diffMins < 60) return t("sidebar.time.minutesAgo", { count: diffMins });
    if (diffHours < 24) return t("sidebar.time.hoursAgo", { count: diffHours });
    if (diffDays < 7) return t("sidebar.time.daysAgo", { count: diffDays });
    return d.toLocaleDateString(t("sidebar.time.locale") === "en" ? "en-US" : "vi-VN");
  };

  const handleMenuToggle = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === roomId ? null : roomId);
  };

  const handleDeleteClick = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    setMenuOpenId(null);
    setConfirmDeleteId(roomId);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      onDeleteRoom(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  return (
    <div className="w-72 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
              <path d="M9 14h6" />
              <path d="M12 14v8" />
              <path d="M8 22h8" />
              <circle cx="9" cy="6" r="1" fill="white" />
              <circle cx="15" cy="6" r="1" fill="white" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-violet-700">
            {t("sidebar.pingAI")}
          </h2>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg hover:bg-violet-700 transition-all active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t("sidebar.newChat")}
        </button>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto ai-sidebar-scroll px-2 py-2">
        {rooms.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-40">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-xs">{t("sidebar.noChat")}</p>
          </div>
        )}

        {rooms.map((room) => (
          <div key={room.id} className="relative mb-1">
            <button
              onClick={() => onSelectRoom(room.id)}
              className={`room-item w-full text-left px-3 py-2.5 rounded-xl group flex items-center ${
                activeRoomId === room.id
                  ? "bg-violet-50 border border-violet-200"
                  : "hover:bg-gray-50 border border-transparent"
              }`}
            >
              <div className="flex-1 min-w-0 pr-2">
                <p
                  className={`text-sm font-medium truncate ${
                    activeRoomId === room.id ? "text-violet-700" : "text-gray-700"
                  }`}
                >
                  {room.title || t("sidebar.newChatPlaceholder")}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {formatTime(room.updatedAt)}
                </p>
              </div>

              {/* Three-dot menu button */}
              <div
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleMenuToggle(e, room.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    handleMenuToggle(e as any, room.id);
                  }
                }}
              >
                <div className="p-1 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Dropdown menu */}
            {menuOpenId === room.id && (
              <div
                ref={menuRef}
                className="absolute right-2 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]"
                style={{ animation: "msg-slide-in 0.15s ease-out" }}
              >
                <button
                  onClick={(e) => handleDeleteClick(e, room.id)}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                  {t("sidebar.deleteChat")}
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Load more */}
        {hasMore && (
          <div className="px-2 py-3">
            <button
              onClick={onLoadMore}
              disabled={loading}
              className="w-full py-2 text-xs text-violet-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="ai-spinner" />
                  {t("sidebar.loading")}
                </>
              ) : (
                t("sidebar.loadMore")
              )}
            </button>
          </div>
        )}

        {loading && rooms.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="ai-spinner" />
          </div>
        )}
      </div>

      {/* ===== Confirmation Modal ===== */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={handleCancelDelete}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleCancelDelete();
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
              }
            }}
            style={{ animation: "msg-slide-in 0.2s ease-out" }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
              {t("sidebar.deleteConfirmTitle")}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              {t("sidebar.deleteConfirmDesc")}
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {t("sidebar.cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                {t("sidebar.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
