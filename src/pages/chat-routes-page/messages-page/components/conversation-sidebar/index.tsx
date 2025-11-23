import { useAppSelector } from "@/features/hooks.ts";
import type { RoomResponse } from "@/types/chat/room";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  X,
  Users,
  FileImage,
  Palette,
  UserCog,
  User,
  Phone,
  Video,
  Pencil,
  Camera,
} from "lucide-react";
import { useState } from "react";
import MemberList from "./member-list";
import RenameGroupModal from "./rename-group-modal";
import ThemeSelectionModal from "./theme-selection-modal";
import UpdateGroupImageModal from "./update-group-image-modal";
import { getTheme } from "../../utils/chatThemes";

interface ConversationSidebarProps {
  selectedChat: RoomResponse;
  isOpen: boolean;
  onClose: () => void;
}

const ConversationSidebar = ({
  selectedChat,
  isOpen,
  onClose,
}: ConversationSidebarProps) => {
  const { userSession } = useAppSelector((state) => state.auth);
  const [currentView, setCurrentView] = useState<"main" | "members">("main");
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isUpdateImageModalOpen, setIsUpdateImageModalOpen] = useState(false);

  const theme = getTheme(selectedChat.theme);

  const getOtherParticipant = () => {
    if (selectedChat.roomType === "DIRECT" && userSession) {
      return selectedChat.participants.find((p) => p.name !== userSession.name);
    }
    return null;
  };

  const otherParticipant = getOtherParticipant();

  if (!isOpen) return null;

  if (currentView === "members") {
    return (
      <div
        className={`w-80 border-l flex flex-col h-full ${theme.sidebar.background}`}
      >
        <MemberList
          participants={selectedChat.participants}
          roomType={selectedChat.roomType}
          roomId={selectedChat.roomId}
          onBack={() => setCurrentView("main")}
        />
      </div>
    );
  }

  return (
    <div
      className={`w-80 border-l flex flex-col h-full ${theme.sidebar.background} ${theme.sidebar.borderColor}`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b flex items-center justify-between ${theme.sidebar.headerBg} ${theme.sidebar.borderColor}`}
      >
        <h3 className={`font-semibold ${theme.sidebar.headerText}`}>
          Thông tin hội thoại
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={theme.header.iconHoverBg}
        >
          <X className={`h-5 w-5 ${theme.header.iconColor}`} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* User/Room Info */}
        <div
          className={`p-6 border-b flex flex-col items-center ${theme.sidebar.cardBg} ${theme.sidebar.borderColor}`}
        >
          <div className="relative group">
            <Avatar
              className={`w-20 h-20 mb-3 ring-2 ${theme.header.avatarRing}`}
            >
              <AvatarImage
                src={
                  selectedChat.roomType === "GROUP"
                    ? selectedChat.roomImgUrl || "/placeholder.svg"
                    : otherParticipant?.avatarUrl || "/placeholder.svg"
                }
                alt={
                  selectedChat.roomType === "DIRECT"
                    ? otherParticipant?.name
                    : selectedChat.name || ""
                }
              />
              <AvatarFallback
                className={`text-2xl font-semibold ${theme.sidebar.cardBg} ${theme.sidebar.textPrimary}`}
              >
                {selectedChat.roomType === "DIRECT"
                  ? otherParticipant?.name?.charAt(0).toUpperCase()
                  : selectedChat.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {selectedChat.roomType === "GROUP" && (
              <Button
                size="icon"
                variant="ghost"
                className={`absolute bottom-2 right-0 h-8 w-8 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity ${theme.header.iconHoverBg}`}
                onClick={() => setIsUpdateImageModalOpen(true)}
              >
                <Camera className={`h-4 w-4 ${theme.header.iconColor}`} />
              </Button>
            )}
          </div>

          {selectedChat.roomType === "GROUP" ? (
            <div className="relative w-full max-w-xs group">
              <h4
                className={`font-semibold text-lg text-center truncate px-10 ${theme.sidebar.textPrimary}`}
              >
                {selectedChat.name}
              </h4>
              <Button
                size="icon"
                variant="ghost"
                className={`h-8 w-8 absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${theme.header.iconHoverBg}`}
                onClick={() => setIsRenameModalOpen(true)}
              >
                <Pencil className={`h-4 w-4 ${theme.header.iconColor}`} />
              </Button>
            </div>
          ) : (
            <h4
              className={`font-semibold text-lg ${theme.sidebar.textPrimary}`}
            >
              {otherParticipant?.name}
            </h4>
          )}

          <div className="flex items-center justify-center gap-6 mt-4">
            {selectedChat.roomType === "DIRECT" && (
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled
                  className={`h-12 w-12 rounded-full bg-transparent opacity-50 cursor-not-allowed ${theme.sidebar.buttonBorder}`}
                  title="Trang cá nhân"
                >
                  <User className={`h-5 w-5 ${theme.sidebar.iconColor}`} />
                </Button>
                <span className={`text-xs ${theme.sidebar.textSecondary}`}>
                  Trang cá nhân
                </span>
              </div>
            )}

            <div className="flex flex-col items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled
                className={`h-12 w-12 rounded-full bg-transparent opacity-50 cursor-not-allowed ${theme.sidebar.buttonBorder}`}
                title="Gọi thoại"
              >
                <Phone className={`h-5 w-5 ${theme.sidebar.iconColor}`} />
              </Button>
              <span className={`text-xs ${theme.sidebar.textSecondary}`}>
                Gọi thoại
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled
                className={`h-12 w-12 rounded-full bg-transparent opacity-50 cursor-not-allowed ${theme.sidebar.buttonBorder}`}
                title="Gọi video"
              >
                <Video className={`h-5 w-5 ${theme.sidebar.iconColor}`} />
              </Button>
              <span className={`text-xs ${theme.sidebar.textSecondary}`}>
                Gọi video
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <Button
            variant="outline"
            className={`w-full justify-start gap-3 h-14 bg-transparent ${theme.sidebar.buttonBorder} ${theme.sidebar.buttonHoverBg}`}
            onClick={() => setCurrentView("members")}
          >
            <Users className={`h-5 w-5 ${theme.sidebar.iconColor}`} />
            <span className={`font-medium ${theme.sidebar.textPrimary}`}>
              Thành viên phòng chat
            </span>
          </Button>

          <Button
            variant="outline"
            disabled
            className={`w-full justify-start gap-3 h-14 bg-transparent opacity-50 cursor-not-allowed ${theme.sidebar.buttonBorder}`}
          >
            <FileImage className={`h-5 w-5 ${theme.sidebar.iconColor}`} />
            <span className={`font-medium ${theme.sidebar.textSecondary}`}>
              File phương tiện & File
            </span>
          </Button>

          <Button
            variant="outline"
            className={`w-full justify-start gap-3 h-14 bg-transparent ${theme.sidebar.buttonBorder} ${theme.sidebar.buttonHoverBg}`}
            onClick={() => setIsThemeModalOpen(true)}
          >
            <Palette className={`h-5 w-5 ${theme.sidebar.iconColor}`} />
            <span className={`font-medium ${theme.sidebar.textPrimary}`}>
              Chủ đề
            </span>
          </Button>

          <Button
            variant="outline"
            disabled
            className={`w-full justify-start gap-3 h-14 bg-transparent opacity-50 cursor-not-allowed ${theme.sidebar.buttonBorder}`}
          >
            <UserCog className={`h-5 w-5 ${theme.sidebar.iconColor}`} />
            <span className={`font-medium ${theme.sidebar.textSecondary}`}>
              Biệt danh
            </span>
          </Button>
        </div>
      </div>

      {/* Rename Group Modal */}
      <RenameGroupModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        roomId={selectedChat.roomId}
        currentName={selectedChat.name || ""}
      />

      {/* Theme Selection Modal */}
      <ThemeSelectionModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        roomId={selectedChat.roomId}
        currentTheme={selectedChat.theme}
      />

      {/* Update Group Image Modal */}
      <UpdateGroupImageModal
        isOpen={isUpdateImageModalOpen}
        onClose={() => setIsUpdateImageModalOpen(false)}
        roomId={selectedChat.roomId}
        currentImageUrl={selectedChat.roomImgUrl}
        groupName={selectedChat.name || ""}
      />
    </div>
  );
};

export default ConversationSidebar;
