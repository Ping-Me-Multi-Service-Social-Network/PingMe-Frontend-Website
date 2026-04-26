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
import { motion } from "framer-motion";
import { memo } from "react";

interface ChatCardProps {
  room: RoomResponse;
  userSession: CurrentUserSessionResponse | null;
  isSelected: boolean;
  onClick: (room: RoomResponse) => void;
  index?: number;
}

export const ChatCard = memo(function ChatCard({
  room,
  userSession,
  isSelected,
  onClick,
  index = 0,
}: ChatCardProps) {
  const unreadCount = 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.05, 0.5),
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onClick={() => onClick(room)}
      className={`chat-card ${isSelected ? "chat-card--selected" : ""}`}
    >
      <div className="chat-card__avatar relative">
        <Avatar
          className={`w-12 h-12 transition-shadow duration-300 ${isSelected ? "ring-[3px] ring-primary/30 ring-offset-2 ring-offset-background" : "hover:ring-2 hover:ring-primary/20"
            }`}
        >
          <AvatarImage
            src={getRoomAvatar(room, userSession) || "/placeholder.svg"}
          />
          <AvatarFallback className="chat-card__avatar-fallback bg-primary/10! text-primary!">
            {getRoomDisplayName(room, userSession).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {room.roomType === "DIRECT" &&
          getOtherParticipant(room, userSession)?.status === "ONLINE" && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="chat-card__online-dot absolute bottom-0 right-0 w-3.5! h-3.5! bg-emerald-500! border-[2.5px]! border-background! shadow-sm"
            />
          )}
      </div>

      <div className="chat-card__body overflow-hidden">
        <div className="chat-card__top-row flex items-center justify-between mb-0.5">
          <h3 className={`chat-card__name truncate m-0 transition-colors duration-200 ${isSelected ? "text-primary font-bold" : "text-foreground font-semibold"}`}>
            {getRoomDisplayName(room, userSession)}
          </h3>
          <span className={`chat-card__time shrink-0 transition-colors duration-200 ${isSelected ? "text-primary/70" : "text-muted-foreground"}`}>
            {room.lastMessage
              ? new Date(room.lastMessage.createdAt).toLocaleTimeString(
                "vi-VN",
                { hour: "2-digit", minute: "2-digit" }
              )
              : ""}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={`chat-card__preview transition-colors duration-200 ${isSelected ? "text-foreground/80" : "text-muted-foreground"}`}>
            {getLastMessagePreview(room, userSession)}
          </p>
          {unreadCount > 0 && (
            <Badge className="chat-card__badge bg-red-500 hover:bg-red-600 shrink-0 self-center">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
});
