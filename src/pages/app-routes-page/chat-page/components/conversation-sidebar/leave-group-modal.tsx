import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { leaveGroupApi } from "@/services/chat";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/features/hooks";
import { setCurrentRoom } from "@/features/websocket/state/chatSlice";
import type { RoomResponse } from "@/types/chat/room";
import { getMyRoomRole } from "../../utils/groupPermissions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LeaveGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChat: RoomResponse;
}

const LeaveGroupModal = ({ isOpen, onClose, selectedChat }: LeaveGroupModalProps) => {
  const { t } = useTranslation("chat");
  const dispatch = useAppDispatch();
  const { userSession } = useAppSelector((state) => state.auth);
  const currentUserId = userSession?.id || 0;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNewOwnerId, setSelectedNewOwnerId] = useState<number | null>(null);

  const eligibleMembers = useMemo(() => {
    return selectedChat.participants.filter((p) => p.userId !== currentUserId);
  }, [selectedChat.participants, currentUserId]);

  const role = getMyRoomRole(selectedChat, currentUserId);
  const isOwner = role === "OWNER";
  const isOwnerAlone = isOwner && eligibleMembers.length === 0;

  const handleLeave = async () => {
    if (isOwner && eligibleMembers.length > 0 && !selectedNewOwnerId) {
      toast.error(t("modals.leaveGroup.requireNewOwner", "Vui lòng chọn trưởng nhóm mới"));
      return;
    }

    setIsLoading(true);
    try {
      await leaveGroupApi(selectedChat.roomId, {
        newOwnerId: isOwner && eligibleMembers.length > 0 ? selectedNewOwnerId : null,
      });
      if (isOwner && eligibleMembers.length > 0) {
        toast.success(t("modals.leaveGroup.transferSuccess", "Đã chuyển trưởng nhóm và thoát nhóm"));
      } else if (isOwnerAlone) {
        toast.success(t("modals.leaveGroup.ownerAloneDissolve", "Nhóm không còn thành viên, đã tự giải tán"));
      } else {
        toast.success(t("modals.leaveGroup.success", "Đã thoát nhóm"));
      }
      window.dispatchEvent(new CustomEvent("ROOM_LEFT_OR_DISSOLVED", { detail: selectedChat.roomId }));
      dispatch(setCurrentRoom(null));
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || t("modals.leaveGroup.error", "Không thể thoát nhóm"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      setSelectedNewOwnerId(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">{t("modals.leaveGroup.title", "Thoát nhóm")}</DialogTitle>
          <DialogDescription>
            {isOwner && eligibleMembers.length > 0
              ? t("modals.leaveGroup.descOwner", "Bạn là trưởng nhóm. Vui lòng chọn trưởng nhóm mới trước khi thoát nhóm.")
              : isOwnerAlone
                ? t("modals.leaveGroup.descOwnerAlone", "Bạn là thành viên cuối cùng. Khi rời nhóm, nhóm sẽ tự giải tán.")
              : t("modals.leaveGroup.desc", "Bạn có chắc muốn thoát khỏi nhóm này?")}
          </DialogDescription>
        </DialogHeader>

        {isOwner && eligibleMembers.length > 0 && (
          <div className="py-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-700">
              {t("modals.leaveGroup.selectNewOwner", "Chọn trưởng nhóm mới")}
            </h4>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {eligibleMembers.map((member) => (
                <div
                  key={member.userId}
                  onClick={() => setSelectedNewOwnerId(member.userId)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-colors ${
                    selectedNewOwnerId === member.userId
                      ? "border-red-600 bg-red-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatarUrl || undefined} />
                    <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{member.role.toLowerCase()}</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border flex items-center justify-center">
                    {selectedNewOwnerId === member.userId && (
                      <div className="w-3 h-3 bg-red-600 rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            {selectedNewOwnerId && (
              <p className="text-sm text-amber-600 mt-2 bg-amber-50 p-2 rounded-md">
                {t("modals.leaveGroup.transferWarning", "Bạn sẽ rời nhóm. Người được chọn sẽ trở thành trưởng nhóm mới.")}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t("modals.leaveGroup.cancel", "Hủy")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleLeave}
            disabled={
              isLoading || (isOwner && eligibleMembers.length > 0 && !selectedNewOwnerId)
            }
          >
            {isLoading ? t("modals.leaveGroup.processing", "Đang xử lý...") : t("modals.leaveGroup.confirm", "Thoát nhóm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveGroupModal;
