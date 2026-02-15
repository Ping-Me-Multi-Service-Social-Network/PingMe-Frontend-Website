import type { AIChatRoomInformation } from "@/types/ai/aiChatRoomInformation";

interface SidebarProps {
  rooms: AIChatRoomInformation[];
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onNewChat: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

export default function Sidebar({
  rooms,
  activeRoomId,
  onSelectRoom,
  onNewChat,
  onLoadMore,
  hasMore,
  loading,
}: SidebarProps) {
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return d.toLocaleDateString("vi-VN");
  };

  return (
    <div className="w-72 h-full bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
              <path d="M9 14h6" />
              <path d="M12 14v8" />
              <path d="M8 22h8" />
              <circle cx="9" cy="6" r="1" fill="white" />
              <circle cx="15" cy="6" r="1" fill="white" />
            </svg>
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            PingAI
          </h2>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg hover:from-violet-600 hover:to-purple-700 transition-all active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Cuộc trò chuyện mới
        </button>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto ai-sidebar-scroll px-2 py-2">
        {rooms.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-40">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-xs">Chưa có cuộc trò chuyện</p>
          </div>
        )}

        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => onSelectRoom(room.id)}
            className={`room-item w-full text-left px-3 py-2.5 rounded-xl mb-1 group ${
              activeRoomId === room.id
                ? "bg-violet-50 border border-violet-200"
                : "hover:bg-gray-50 border border-transparent"
            }`}
          >
            <p
              className={`text-sm font-medium truncate ${
                activeRoomId === room.id ? "text-violet-700" : "text-gray-700"
              }`}
            >
              {room.title || "Cuộc trò chuyện mới..."}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {formatTime(room.updatedAt)}
            </p>
          </button>
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
                  Đang tải...
                </>
              ) : (
                "Tải thêm"
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
    </div>
  );
}
