import type React from "react";
import { useAppDispatch, useAppSelector } from "@/features/hooks.ts";
import { updateUserAvatarUrl } from "@/features/auth/authSlice.ts";
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
import { Camera, Upload, Loader2, X, ImageIcon } from "lucide-react";
import { getCurrentUserSession } from "@/features/auth/authThunk.ts";
import { updateCurrentUserAvatarApi } from "@/services/user/currentUserProfileApi.ts";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const UserAvatarPanel = () => {
  const { t } = useTranslation("profile");
  const { userSession } = useAppSelector((state) => state.auth);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("avatar.validation.notImage"));
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("avatar.validation.tooLarge"));
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
  const handleAvatarKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleAvatarClick();
    }
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
      toast.error(t("avatar.validation.noFile"));
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

      const res = await updateCurrentUserAvatarApi(data);

      clearInterval(progressInterval);
      setUploadProgress(100);

      const newAvatarUrl = res.data.data.avatarUrl;
      const cacheBustedUrl = newAvatarUrl ? `${newAvatarUrl}?v=${Date.now()}` : "";
      if (cacheBustedUrl) {
        dispatch(updateUserAvatarUrl(cacheBustedUrl));
      }

      setTimeout(() => {
        toast.success(t("avatar.updateSuccess"));
        dispatch(getCurrentUserSession());
        handleModalClose();
      }, 500);
    } catch (err) {
      toast.error(getErrorMessage(err, t("avatar.updateFail")));
      setUploadProgress(0);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80 h-[280px] relative overflow-hidden flex items-center justify-center">
        {/* Background Patterns using motion */}
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-overlay opacity-50 dark:opacity-20"
          style={{ backgroundImage: "url('/bg_office.jpg')" }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-primary/80 via-primary/60 to-background/95"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white pt-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.1,
            }}
            id="profile-avatar-panel"
            className="relative mb-6 group"
          >
            <div
              className="relative cursor-pointer"
              onClick={handleAvatarClick}
              onKeyDown={handleAvatarKeyDown}
              role="button"
              tabIndex={0}
            >
              <Avatar className="h-28 w-28 ring-4 ring-white/20 shadow-2xl transition-all duration-300 group-hover:ring-white/40 group-hover:scale-105">
                <AvatarImage
                  src={userSession?.avatarUrl || undefined}
                  alt={userSession?.name || t("avatar.defaultName")}
                  className="object-cover"
                />
                <UserAvatarFallback
                  name={userSession?.name}
                  size={112}
                  className="text-2xl"
                />
              </Avatar>

              {/* Simple Camera Overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Camera Floating Button */}
            <Button
              size="icon"
              className="absolute -bottom-1 -right-1 rounded-full w-9 h-9 p-0 bg-background text-primary hover:bg-muted hover:text-primary/80 shadow-xl border border-border transition-transform group-hover:scale-110"
              onClick={handleAvatarClick}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* User Info */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.2,
            }}
            className="text-center"
          >
            <h1
              id="profile-user-name"
              className="text-white text-3xl font-bold tracking-tight drop-shadow-md mb-1.5"
            >
              {userSession?.name || t("avatar.defaultName")}
            </h1>
            <p
              id="profile-user-email"
              className="text-muted-foreground text-sm font-medium bg-background/50 px-3 py-1 rounded-full backdrop-blur-md inline-flex border border-border/50"
            >
              {userSession?.email || t("avatar.defaultEmail")}
            </p>
          </motion.div>
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
      <AnimatePresence>
        {isModalOpen && (
          <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
            <DialogContent className="sm:max-w-[400px] bg-card/95 backdrop-blur-xl border-border">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-foreground flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-primary" />
                  {t("avatar.modalTitle")}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {t("avatar.modalDesc")}
                </DialogDescription>
              </DialogHeader>

              <div className="py-6">
                {/* Preview Avatar */}
                <div className="flex justify-center mb-6">
                  <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-xl">
                    <AvatarImage
                      src={previewUrl || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      <Upload className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* File Info */}
                {selectedFile && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-muted rounded-lg p-3 mb-4 text-sm font-medium text-center text-muted-foreground border border-border"
                  >
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </motion.div>
                )}

                {/* Progress */}
                {isUpdating && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("avatar.uploading")}
                      </span>
                      <span className="text-primary font-bold">
                        {uploadProgress}%
                      </span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </motion.div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleModalClose}
                  disabled={isUpdating}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t("common.cancel")}
                </Button>
                <Button
                  type="button"
                  onClick={handleAvatarUpload}
                  disabled={isUpdating || !selectedFile}
                  className="shadow-md"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("common.updating")}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {t("avatar.btnUpdate")}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserAvatarPanel;
