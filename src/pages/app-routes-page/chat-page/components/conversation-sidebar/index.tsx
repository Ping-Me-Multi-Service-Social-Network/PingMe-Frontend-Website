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
  Palette,
  Camera,
  Pin,
} from "lucide-react";
import { useState } from "react";
import MemberList from "./member-list.tsx";
import SidebarPinnedMessages from "./sidebar-pinned-messages.tsx";
import RenameGroupModal from "./rename-group-modal.tsx";
import { CallButton } from "@/components/call/CallButton";
import ThemeSelectionModal from "./theme-selection-modal.tsx";
import UpdateGroupImageModal from "./update-group-image-modal.tsx";
import { getTheme } from "../../utils/chatThemes.ts";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Edit2, LogOut, Trash2 } from "lucide-react";
import {
  canRenameGroup,
  canChangeGroupAvatar,
  canChangeTheme,
  canLeaveGroup,
  canDissolveGroup,
} from "../../utils/groupPermissions.ts";
import LeaveGroupModal from "./leave-group-modal.tsx";
import DissolveGroupModal from "./dissolve-group-modal.tsx";

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
  const [currentView, setCurrentView] = useState<"main" | "members" | "pinned">("main");
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isUpdateImageModalOpen, setIsUpdateImageModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isDissolveModalOpen, setIsDissolveModalOpen] = useState(false);
  const { t } = useTranslation("chat");
  const currentUserId = userSession?.id || 0;

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
          room={selectedChat}
          onBack={() => setCurrentView("main")}
        />
      </div>
    );
  }

  if (currentView === "pinned") {
    return (
      <div className={`conv-sidebar ${theme.sidebar.background}`}>
        <SidebarPinnedMessages
          participants={selectedChat.participants}
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
            {selectedChat.roomType === "GROUP" && canChangeGroupAvatar(selectedChat, currentUserId) && (
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
            <div className="relative w-full max-w-xs group text-center flex items-center justify-center">
              <h4
                className={`conv-sidebar__profile-name truncate max-w-[80%] ${theme.sidebar.textPrimary}`}
              >
                {selectedChat.name}
              </h4>
              {canRenameGroup(selectedChat, currentUserId) && (
                <Button
                  size="icon"
                  variant="ghost"
                  className={`h-6 w-6 ml-1 opacity-0 group-hover:opacity-100 transition-opacity ${theme.header.iconHoverBg}`}
                  onClick={() => setIsRenameModalOpen(true)}
                >
                  <Edit2 className={`h-3.5 w-3.5 ${theme.header.iconColor}`} />
                </Button>
              )}
            </div>
          ) : (
            <h4
              className={`conv-sidebar__profile-name ${theme.sidebar.textPrimary}`}
            >
              {otherParticipant?.name}
            </h4>
          )}

          <div className="conv-sidebar__quick-actions">
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
              className={`w-full justify-start gap-3 h-14 bg-transparent ${theme.sidebar.buttonBorder} ${theme.sidebar.buttonHoverBg}`}
              onClick={() => setCurrentView("pinned")}
            >
              <Pin className={`h-5 w-5 ${theme.sidebar.iconColor}`} />
              <span className={`font-medium ${theme.sidebar.textPrimary}`}>
                {t("sidebar.pinnedMessages", "Pinned Messages")}
              </span>
            </Button>
          </motion.div>

          {canChangeTheme(selectedChat, currentUserId) && (
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
          )}

          {/* Danger Zone */}
          {selectedChat.roomType === "GROUP" && (
            <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }} className="pt-6">
              <div className={`text-xs font-semibold uppercase tracking-wider mb-3 px-2 ${theme.sidebar.textSecondary}`}>
                Danger Zone
              </div>
              <div className="space-y-2">
                {canLeaveGroup(selectedChat, currentUserId) && (
                  <Button
                    variant="outline"
                    className={`w-full justify-start gap-3 h-12 bg-transparent text-red-500 hover:text-red-600 hover:bg-red-50/10 ${theme.sidebar.buttonBorder}`}
                    onClick={() => setIsLeaveModalOpen(true)}
                  >
                    <LogOut className="h-5 w-5 text-red-500" />
                    <span className="font-medium">
                      {t("modals.leaveGroup.title", "Thoát nhóm")}
                    </span>
                  </Button>
                )}

                {canDissolveGroup(selectedChat, currentUserId) && (
                  <Button
                    variant="destructive"
                    className="w-full justify-start gap-3 h-12 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setIsDissolveModalOpen(true)}
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="font-medium">
                      {t("modals.dissolveGroup.title", "Giải tán nhóm")}
                    </span>
                  </Button>
                )}
              </div>
            </motion.div>
          )}

        </motion.div>
      </div>

      {selectedChat.roomType === "GROUP" && (
        <>
          <RenameGroupModal
            isOpen={isRenameModalOpen}
            onClose={() => setIsRenameModalOpen(false)}
            roomId={selectedChat.roomId}
            currentName={selectedChat.name || ""}
          />
          <UpdateGroupImageModal
            isOpen={isUpdateImageModalOpen}
            onClose={() => setIsUpdateImageModalOpen(false)}
            roomId={selectedChat.roomId}
            currentImageUrl={selectedChat.roomImgUrl}
            groupName={selectedChat.name || ""}
          />
          <LeaveGroupModal
            isOpen={isLeaveModalOpen}
            onClose={() => setIsLeaveModalOpen(false)}
            selectedChat={selectedChat}
          />
          <DissolveGroupModal
            isOpen={isDissolveModalOpen}
            onClose={() => setIsDissolveModalOpen(false)}
            roomId={selectedChat.roomId}
          />
        </>
      )}

      {/* Theme Selection Modal */}
      <ThemeSelectionModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        roomId={selectedChat.roomId}
        currentTheme={selectedChat.theme}
      />
    </div>
  );
};

export default ConversationSidebar;
