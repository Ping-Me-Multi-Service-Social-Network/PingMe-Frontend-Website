"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Trash2 } from "lucide-react";
import { updateGroupImage } from "@/services/chat";
import { toast } from "sonner";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file hình ảnh");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
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
      toast.success(selectedFile ? "Đã cập nhật ảnh nhóm" : "Đã xóa ảnh nhóm");
      onClose();
    } catch (error) {
      toast.error("Không thể cập nhật ảnh nhóm");
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
          <DialogTitle>Cập nhật ảnh nhóm</DialogTitle>
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
                Xóa ảnh
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
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateGroupImageModal;
