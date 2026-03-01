import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Upload, Trash2 } from "lucide-react";
import { updateGroupImage } from "@/services/chat";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface UpdateGroupImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
  currentImageUrl: string | null;
  groupName: string;
}

const UpdateGroupImageModal = ({
  isOpen,
  onClose,
  roomId,
  currentImageUrl,
  groupName,
}: UpdateGroupImageModalProps) => {
  const { t } = useTranslation("chat");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error(t("modals.updateImage.invalidType"));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("modals.updateImage.sizeLimit"));
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await updateGroupImage(roomId, selectedFile);
      toast.success(selectedFile ? t("modals.updateImage.updateSuccess") : t("modals.updateImage.removeSuccess"));
      onClose();
    } catch (error) {
      toast.error(t("modals.updateImage.updateError"));
      console.error("Failed to update group image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(currentImageUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("modals.updateImage.title")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="w-32 h-32">
            <AvatarImage src={previewUrl || undefined} alt={groupName} />
            <AvatarFallback className="text-3xl">
              {groupName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                document.getElementById("group-image-input")?.click()
              }
            >
              <Upload className="h-4 w-4 mr-2" />
              Chọn ảnh
            </Button>
            {previewUrl && (
              <Button variant="outline" onClick={handleRemoveImage}>
                <Trash2 className="h-4 w-4 mr-2" />
                {t("modals.updateImage.removeImage")}
              </Button>
            )}
          </div>

          <input
            id="group-image-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {t("modals.updateImage.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? t("modals.updateImage.processing") : t("modals.updateImage.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateGroupImageModal;
