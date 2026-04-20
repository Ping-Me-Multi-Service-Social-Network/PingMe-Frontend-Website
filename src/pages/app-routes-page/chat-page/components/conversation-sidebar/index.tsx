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
  Camera,
} from "lucide-react";
import { useState } from "react";
import MemberList from "./member-list.tsx";
import RenameGroupModal from "./rename-group-modal.tsx";
import { CallButton } from "@/components/call/CallButton";
import ThemeSelectionModal from "./theme-selection-modal.tsx";
import UpdateGroupImageModal from "./update-group-image-modal.tsx";
import { getTheme } from "../../utils/chatThemes.ts";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

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
  const { t } = useTranslation("chat");

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
      <div className={`conv-sidebar ${theme.sidebar.background}`}>
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
      className={`conv-sidebar ${theme.sidebar.background} ${theme.sidebar.borderColor}`}
    >
      {/* Header */}
      <div
        className={`conv-sidebar__header ${theme.sidebar.headerBg} ${theme.sidebar.borderColor}`}
      >
        <h3 className={theme.sidebar.headerText}>{t("sidebar.title")}</h3>
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
          className={`conv-sidebar__profile ${theme.sidebar.cardBg} ${theme.sidebar.borderColor}`}
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
            <div className="relative w-full max-w-xs group text-center">
              <h4
                className={`conv-sidebar__profile-name truncate px-10 ${theme.sidebar.textPrimary}`}
              >
                {selectedChat.name}
              </h4>
            </div>
          ) : (
            <h4
              className={`conv-sidebar__profile-name ${theme.sidebar.textPrimary}`}
            >
              {otherParticipant?.name}
            </h4>
          )}

          <div className="conv-sidebar__quick-actions">
            {selectedChat.roomType === "DIRECT" && (
              <div className="conv-sidebar__quick-action">
                <Button
                  variant="outline"
                  size="icon"
                  disabled
                  className={`h-12 w-12 rounded-full bg-transparent opacity-50 cursor-not-allowed ${theme.sidebar.buttonBorder}`}
                  title={t("sidebar.profile")}
                >
                  <User className={`h-5 w-5 ${theme.sidebar.iconColor}`} />
                </Button>
                <span className={`text-xs ${theme.sidebar.textSecondary}`}>
                  {t("sidebar.profile")}
                </span>
              </div>
            )}

            {selectedChat.roomType === "DIRECT" && otherParticipant ? (
              <CallButton
                variant="sidebar"
                theme={theme}
                targetUserId={otherParticipant.userId}
                roomId={selectedChat.roomId}
                isTargetOnline={otherParticipant.status === "ONLINE"}
                targetName={otherParticipant.name}
                audioLabel={t("sidebar.voiceCall")}
                videoLabel={t("sidebar.videoCall")}
              />
            ) : selectedChat.roomType === "GROUP" && (
              <CallButton
                variant="sidebar"
                theme={theme}
                roomId={selectedChat.roomId}
                audioLabel={t("sidebar.voiceCall")}
                videoLabel={t("sidebar.videoCall")}
              />
            )}
          </div>
        </div>

        <motion.div 
          className="conv-sidebar__menu"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}>
            <Button
              variant="outline"
              className={`w-full justify-start gap-3 h-14 bg-transparent ${theme.sidebar.buttonBorder} ${theme.sidebar.buttonHoverBg}`}
              onClick={() => setCurrentView("members")}
            >
              <Users className={`h-5 w-5 ${theme.sidebar.iconColor}`} />
              <span className={`font-medium ${theme.sidebar.textPrimary}`}>
                {t("sidebar.members")}
              </span>
            </Button>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}>
            <Button
              variant="outline"
              disabled
              className={`w-full justify-start gap-3 h-14 bg-transparent opacity-50 cursor-not-allowed ${theme.sidebar.buttonBorder}`}
            >
              <FileImage className={`h-5 w-5 ${theme.sidebar.iconColor}`} />
              <span className={`font-medium ${theme.sidebar.textSecondary}`}>
                {t("sidebar.media")}
              </span>
            </Button>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}>
            <Button
              variant="outline"
              className={`w-full justify-start gap-3 h-14 bg-transparent ${theme.sidebar.buttonBorder} ${theme.sidebar.buttonHoverBg}`}
              onClick={() => setIsThemeModalOpen(true)}
            >
              <Palette className={`h-5 w-5 ${theme.sidebar.iconColor}`} />
              <span className={`font-medium ${theme.sidebar.textPrimary}`}>
                {t("sidebar.theme")}
              </span>
            </Button>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}>
            <Button
              variant="outline"
              disabled
              className={`w-full justify-start gap-3 h-14 bg-transparent opacity-50 cursor-not-allowed ${theme.sidebar.buttonBorder}`}
            >
              <UserCog className={`h-5 w-5 ${theme.sidebar.iconColor}`} />
              <span className={`font-medium ${theme.sidebar.textSecondary}`}>
                {t("sidebar.nickname")}
              </span>
            </Button>
          </motion.div>
        </motion.div>
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
