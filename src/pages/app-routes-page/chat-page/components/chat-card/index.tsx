import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import type { RoomResponse } from "@/types/chat/room";
import type { CurrentUserSessionResponse } from "@/types/authentication";
import {
  getLastMessagePreview,
  getOtherParticipant,
  getRoomAvatar,
  getRoomDisplayName,
} from "@/pages/app-routes-page/chat-page/utils/getRoomInfo.ts";

interface ChatCardProps {
  room: RoomResponse;
  userSession: CurrentUserSessionResponse | null;
  isSelected: boolean;
  onClick: () => void;
}

export function ChatCard({
  room,
  userSession,
  isSelected,
  onClick,
}: ChatCardProps) {
  const unreadCount = 0;

  return (
    <div
      onClick={onClick}
      className={`chat-card ${isSelected ? "chat-card--selected" : ""}`}
    >
      <div className="chat-card__avatar">
        <Avatar
          className={`w-12 h-12 transition-all duration-200 ${
            isSelected ? "ring-2 ring-purple-300 ring-offset-2" : ""
          }`}
        >
          <AvatarImage
            src={getRoomAvatar(room, userSession) || "/placeholder.svg"}
          />
          <AvatarFallback className="chat-card__avatar-fallback">
            {getRoomDisplayName(room, userSession).charAt(0)}
          </AvatarFallback>
        </Avatar>

        {room.roomType === "DIRECT" &&
          getOtherParticipant(room, userSession)?.status === "ONLINE" && (
            <span className="chat-card__online-dot" />
          )}
      </div>

      <div className="chat-card__body">
        <div className="chat-card__top-row">
          <h3 className="chat-card__name">
            {getRoomDisplayName(room, userSession)}
          </h3>
          <span className="chat-card__time">
            {room.lastMessage
              ? new Date(room.lastMessage.createdAt).toLocaleTimeString(
                  "vi-VN",
                  { hour: "2-digit", minute: "2-digit" }
                )
              : ""}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="chat-card__preview">
            {getLastMessagePreview(room, userSession)}
          </p>
          {unreadCount > 0 && (
            <Badge className="chat-card__badge">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
