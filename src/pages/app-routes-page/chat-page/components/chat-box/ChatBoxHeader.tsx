import { useAppSelector } from "@/features/hooks.ts";
import type { RoomResponse } from "@/types/chat/room";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar.tsx";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { getTheme } from "../../utils/chatThemes.ts";
import { CallButton } from "@/pages/app-routes-page/chat-page/components/call/CallButton.tsx";

interface ChatBoxHeaderProps {
  selectedChat: RoomResponse;
  onToggleSidebar: () => void;
}

const ChatBoxHeader = ({
  selectedChat,
  onToggleSidebar,
}: ChatBoxHeaderProps) => {
  const { userSession } = useAppSelector((state) => state.auth);

  const theme = getTheme(selectedChat.theme);

  const getOtherParticipant = () => {
    if (selectedChat.roomType === "DIRECT" && userSession) {
      return selectedChat.participants.find((p) => p.name !== userSession.name);
    }
    return null;
  };

  const otherParticipant = getOtherParticipant();

  const avatarUrl =
    selectedChat.roomType === "GROUP"
      ? selectedChat.roomImgUrl
      : otherParticipant?.avatarUrl;

  const displayName =
    selectedChat.roomType === "DIRECT"
      ? otherParticipant?.name
      : selectedChat.name;

  return (
    <div
      className={`flex items-center justify-between p-4 border-b ${theme.header.background}`}
    >
      <div className="flex items-center space-x-3">
        <Avatar className={`w-10 h-10 ring-2 ${theme.header.avatarRing}`}>
          <AvatarImage src={avatarUrl || "/placeholder.svg"} />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white font-semibold">
            {displayName?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className={`font-semibold ${theme.header.textColor}`}>
            {displayName}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {selectedChat.roomType === "DIRECT" && otherParticipant && (
          <CallButton
            targetUserId={otherParticipant.userId}
            roomId={selectedChat.roomId}
            isTargetOnline={otherParticipant.status === "ONLINE"}
            targetName={otherParticipant.name}
          />
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className={theme.header.iconHoverBg}
        >
          <Info className={`h-5 w-5 ${theme.header.iconColor}`} />
        </Button>
      </div>
    </div>
  );
};

export default ChatBoxHeader;
