import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { dissolveGroupApi } from "@/services/chat";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/features/hooks";
import { setCurrentRoom } from "@/features/websocket/state/chatSlice";

interface DissolveGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
}

const DissolveGroupModal = ({ isOpen, onClose, roomId }: DissolveGroupModalProps) => {
  const { t } = useTranslation("chat");
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleDissolve = async () => {
    setIsLoading(true);
    try {
      await dissolveGroupApi(roomId);
      toast.success(t("modals.dissolveGroup.success", "Đã giải tán nhóm"));
      window.dispatchEvent(new CustomEvent("ROOM_LEFT_OR_DISSOLVED", { detail: roomId }));
      dispatch(setCurrentRoom(null));
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || t("modals.dissolveGroup.error", "Không thể giải tán nhóm"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">{t("modals.dissolveGroup.title", "Giải tán nhóm")}</DialogTitle>
          <DialogDescription>
            {t("modals.dissolveGroup.desc", "Bạn có chắc muốn giải tán nhóm này? Tất cả thành viên sẽ không còn truy cập được cuộc trò chuyện.")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t("modals.dissolveGroup.cancel", "Hủy")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDissolve}
            disabled={isLoading}
          >
            {isLoading ? t("modals.dissolveGroup.processing", "Đang xử lý...") : t("modals.dissolveGroup.confirm", "Giải tán")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DissolveGroupModal;
