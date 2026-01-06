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
  const [newGroupName, setNewGroupName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  const handleRename = async () => {
    if (!newGroupName.trim()) {
      toast.error("Tên nhóm không được để trống");
      return;
    }

    if (newGroupName.trim() === currentName) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await renameGroup(roomId, newGroupName.trim());
      toast.success("Đổi tên nhóm thành công");
      onClose();
    } catch (error) {
      toast.error("Đổi tên nhóm thất bại");
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
          <DialogTitle>Đổi tên nhóm</DialogTitle>
          <DialogDescription>Nhập tên mới cho nhóm của bạn</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Tên nhóm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) handleRename();
            }}
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleRename}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameGroupModal;
