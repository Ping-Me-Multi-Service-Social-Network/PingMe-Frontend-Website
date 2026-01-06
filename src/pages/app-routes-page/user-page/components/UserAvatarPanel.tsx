import type React from "react";

import { useAppDispatch, useAppSelector } from "@/features/hooks.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { UserAvatarFallback } from "@/components/custom/UserAvatarFallback.tsx";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import { updateCurrentUserAvatarApi } from "@/services/authentication";
import { Camera, Upload, Loader2, X, ImageIcon } from "lucide-react";
import { getCurrentUserSession } from "@/features/slices/authThunk.ts";

const UserAvatarPanel = () => {
  const { userSession } = useAppSelector((state) => state.auth);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn (tối đa 5MB)");
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsModalOpen(true);
      setUploadProgress(0);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setUploadProgress(0);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    try {
      setIsUpdating(true);
      setUploadProgress(10);

      const data = new FormData();
      data.append("avatar", selectedFile);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await updateCurrentUserAvatarApi(data);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setAvatarVersion(Date.now());

      setTimeout(() => {
        toast.success("Cập nhật avatar thành công!");
        dispatch(getCurrentUserSession());
        handleModalClose();
      }, 500);
    } catch (err) {
      toast.error(getErrorMessage(err, "Cập nhật thất bại"));
      setUploadProgress(0);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-64 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg_office.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/80 to-purple-600/90"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white pt-8">
          <div className="relative mb-6 group">
            <div
              className="relative cursor-pointer"
              onClick={handleAvatarClick}
            >
              <Avatar className="h-24 w-24 ring-4 ring-white/30 shadow-xl transition-all duration-200 group-hover:ring-white/50">
                <AvatarImage
                  src={
                    userSession?.avatarUrl
                      ? `${userSession.avatarUrl}?v=${avatarVersion}`
                      : undefined
                  }
                  alt={userSession?.name || "User"}
                  className="object-cover"
                />
                <UserAvatarFallback
                  name={userSession?.name}
                  size={96}
                  className="text-lg"
                />
              </Avatar>

              {/* Simple Camera Overlay */}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Camera Button */}
            <Button
              size="sm"
              className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-white text-purple-600 hover:bg-gray-100 shadow-lg"
              onClick={handleAvatarClick}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>

          {/* User Info */}
          <h1 className="text-2xl font-bold drop-shadow-lg mb-2">
            {userSession?.name || "Người dùng"}
          </h1>
          <p className="text-purple-100 text-sm font-medium">
            {userSession?.email || "user@example.com"}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[400px] bg-white/95 backdrop-blur-sm border-purple-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-purple-600" />
              Cập nhật Avatar
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Xem trước ảnh đại diện mới của bạn
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {/* Preview Avatar */}
            <div className="flex justify-center mb-6">
              <Avatar className="w-32 h-32 border-4 border-purple-100 shadow-lg">
                <AvatarImage
                  src={previewUrl || undefined}
                  className="object-cover"
                />
                <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl">
                  <Upload className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
            </div>

            {/* File Info */}
            {selectedFile && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-lg text-center text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            )}

            {/* Progress */}
            {isUpdating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Đang tải lên...</span>
                  <span className="text-purple-600 font-medium">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleModalClose}
              disabled={isUpdating}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
            >
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleAvatarUpload}
              disabled={isUpdating || !selectedFile}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Cập nhật Avatar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserAvatarPanel;
