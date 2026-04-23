import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { renameGroup } from "@/services/chat";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface RenameGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
  currentName: string;
}

const RenameGroupModal = ({
  isOpen,
  onClose,
  roomId,
  currentName,
}: RenameGroupModalProps) => {
  const { t } = useTranslation("chat");
  const [newGroupName, setNewGroupName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  const handleRename = async () => {
    if (!newGroupName.trim()) {
      toast.error(t("modals.renameGroup.emptyError"));
      return;
    }

    if (newGroupName.trim() === currentName) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await renameGroup(roomId, newGroupName.trim());
      toast.success(t("modals.renameGroup.success"));
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || t("modals.renameGroup.error"));
      console.error("Error renaming group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("modals.renameGroup.title")}</DialogTitle>
          <DialogDescription>{t("modals.renameGroup.desc")}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder={t("modals.renameGroup.placeholder")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) handleRename();
            }}
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t("modals.renameGroup.cancel")}
          </Button>
          <Button
            onClick={handleRename}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? t("modals.renameGroup.saving") : t("modals.renameGroup.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameGroupModal;
