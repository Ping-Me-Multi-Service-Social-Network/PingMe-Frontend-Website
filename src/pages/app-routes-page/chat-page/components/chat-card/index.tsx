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
      className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-gradient-to-r from-purple-50 to-purple-100 shadow-md"
          : "hover:bg-gray-50 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar
            className={`w-12 h-12 transition-all duration-200 ${
              isSelected ? "ring-2 ring-purple-300 ring-offset-2" : ""
            }`}
          >
            <AvatarImage
              src={getRoomAvatar(room, userSession) || "/placeholder.svg"}
            />
            <AvatarFallback
              className={`${
                isSelected
                  ? "bg-purple-200 text-purple-700"
                  : "bg-purple-100 text-purple-600"
              }`}
            >
              {getRoomDisplayName(room, userSession).charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* 👇 Hiển thị chấm online nếu direct room và người kia online */}
          {room.roomType === "DIRECT" &&
            getOtherParticipant(room, userSession)?.status === "ONLINE" && (
              <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span>
            )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3
              className={`text-sm font-medium truncate transition-colors duration-200 ${
                isSelected ? "text-purple-900" : "text-gray-900"
              }`}
            >
              {getRoomDisplayName(room, userSession)}
            </h3>
            <span
              className={`text-xs transition-colors duration-200 ${
                isSelected ? "text-purple-600" : "text-gray-500"
              }`}
            >
              {room.lastMessage
                ? new Date(room.lastMessage.createdAt).toLocaleTimeString(
                    "vi-VN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : ""}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p
              className={`text-sm truncate max-w-[200px] transition-colors duration-200 ${
                isSelected ? "text-purple-700" : "text-gray-600"
              }`}
            >
              {getLastMessagePreview(room, userSession)}
            </p>
            {unreadCount > 0 && (
              <Badge
                className={`text-white text-xs px-2 py-1 rounded-full transition-all duration-200 ${
                  isSelected
                    ? "bg-purple-700 shadow-lg animate-pulse"
                    : "bg-purple-600"
                }`}
              >
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
