import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { UserAvatarFallback } from "@/components/custom/UserAvatarFallback";
import { Crown } from "lucide-react";

// =================================================================
// ListenerAvatarRow - Hiển thị một người đang nghe chung
// =================================================================

interface ListenerAvatarRowProps {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  isHost?: boolean;
  isSelf?: boolean;
}

export function ListenerAvatarRow({
  userId: _userId,
  name,
  avatarUrl,
  isHost = false,
  isSelf = false,
}: ListenerAvatarRowProps) {
  return (
    <div
      className="flex items-center gap-3 py-2 px-1 rounded-lg transition-colors hover:bg-white/5"
    >
      {/* Avatar với ring màu tím nếu là Host */}
      <div className="relative shrink-0">
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl ?? undefined} alt={name} />
          <UserAvatarFallback name={name} size="sm" />
        </Avatar>
        {/* Crown icon nhỏ nếu là Host */}
        {isHost && (
          <span
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
            title="Host"
          >
            <Crown className="w-2 h-2 text-white" />
          </span>
        )}
      </div>

      {/* Tên */}
      <span
        className="text-sm font-medium truncate"
        style={{ color: isHost ? "#c4b5fd" : isSelf ? "#a1a1aa" : "#d4d4d8" }}
      >
        {name}
        {isSelf && (
          <span className="ml-1 text-xs text-zinc-600 font-normal">(bạn)</span>
        )}
      </span>

      {/* Sóng âm nhỏ bên phải để ra vẻ "đang nghe" */}
      <div className="ml-auto flex items-end gap-px shrink-0">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-0.5 rounded-full"
            style={{
              height: `${6 + (i % 2) * 4}px`,
              background: isHost
                ? "linear-gradient(to top,#7c3aed,#a855f7)"
                : "rgba(139,92,246,0.4)",
              animation: `music-bar ${0.6 + i * 0.15}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
