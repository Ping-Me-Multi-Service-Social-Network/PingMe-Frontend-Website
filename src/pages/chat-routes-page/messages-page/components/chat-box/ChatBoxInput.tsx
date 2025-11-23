import type React from "react";
import { getTheme } from "../../utils/chatThemes";
import type { RoomResponse } from "@/types/chat/room";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Smile,
  ImagePlus,
  Paperclip,
  Send,
  X,
  FileText,
  Video,
  CloudSun,
} from "lucide-react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler";

interface FilePreview {
  file: File;
  type: "IMAGE" | "VIDEO" | "FILE";
  previewUrl?: string;
}

interface ChatInputProps {
  selectedChat: RoomResponse;
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  onSendFile: (file: File, type: "IMAGE" | "VIDEO" | "FILE") => Promise<void>;
  onSendWeather: (lat: number, lon: number) => Promise<void>;
  disabled?: boolean;
}

export function ChatBoxInput({
  selectedChat,
  newMessage,
  setNewMessage,
  onSendMessage,
  onSendFile,
  onSendWeather,
  disabled = false,
}: ChatInputProps) {
  const theme = getTheme(selectedChat.theme);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [isSending, setIsSending] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    setNewMessage(newMessage + emojiData.emoji);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || isSending) {
      return;
    }

    setIsSending(true);

    try {
      if (selectedFiles.length > 0) {
        for (const filePreview of selectedFiles) {
          await onSendFile(filePreview.file, filePreview.type);
        }
        clearFiles();
      }

      if (newMessage.trim()) {
        onSendMessage();
      }

      setShowEmojiPicker(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const getFileType = (file: File): "IMAGE" | "VIDEO" | "FILE" => {
    if (file.type.startsWith("image/")) {
      return "IMAGE";
    } else if (file.type.startsWith("video/")) {
      return "VIDEO";
    }
    return "FILE";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const fileType = getFileType(file);
        const previewUrl =
          fileType === "IMAGE" || fileType === "VIDEO"
            ? URL.createObjectURL(file)
            : undefined;

        setSelectedFiles((prev) => [
          ...prev,
          {
            file,
            type: fileType,
            previewUrl,
          },
        ]);
      });
      e.target.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const fileType = getFileType(file);
        const previewUrl =
          fileType === "IMAGE" || fileType === "VIDEO"
            ? URL.createObjectURL(file)
            : undefined;

        setSelectedFiles((prev) => [
          ...prev,
          {
            file,
            type: fileType,
            previewUrl,
          },
        ]);
      });
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index].previewUrl) {
        URL.revokeObjectURL(newFiles[index].previewUrl!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const clearFiles = () => {
    selectedFiles.forEach((filePreview) => {
      if (filePreview.previewUrl) {
        URL.revokeObjectURL(filePreview.previewUrl);
      }
    });
    setSelectedFiles([]);
  };

  const handleWeatherClick = () => {
    if ("geolocation" in navigator) {
      toast.info("Đang lấy vị trí của bạn...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            setIsSending(true);
            await onSendWeather(latitude, longitude);
            toast.success("Đã gửi thông tin thời tiết");
          } catch (error) {
            toast.error(
              getErrorMessage(error, "Không thể gửi thông tin thời tiết")
            );
          } finally {
            setIsSending(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error(
            "Không thể lấy vị trí của bạn. Vui lòng cho phép truy cập vị trí."
          );
        }
      );
    } else {
      toast.error("Trình duyệt không hỗ trợ định vị");
    }
  };

  return (
    <div className="border-t bg-white">
      <div
        className={`flex items-center space-x-1 p-3 border-b ${theme.input.background}`}
      >
        <Button
          variant="ghost"
          size="lg"
          className={`${theme.input.iconColor} ${theme.input.iconHoverColor} ${theme.input.iconHoverBg} transition-all duration-200 rounded-lg`}
          onClick={handleImageClick}
          disabled={disabled || isSending}
        >
          <ImagePlus className="w-24 h-24" />
        </Button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleImageChange}
        />

        <Button
          variant="ghost"
          size="sm"
          className={`${theme.input.iconColor} ${theme.input.iconHoverColor} ${theme.input.iconHoverBg} transition-all duration-200 rounded-lg`}
          onClick={handleFileClick}
          disabled={disabled || isSending}
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          variant="ghost"
          size="sm"
          className={`${theme.input.iconColor} ${theme.input.iconHoverColor} ${theme.input.iconHoverBg} transition-all duration-200 rounded-lg`}
          onClick={handleWeatherClick}
          disabled={disabled || isSending}
          title="Gửi thông tin thời tiết"
        >
          <CloudSun className="w-5 h-5" />
        </Button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="p-3 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((filePreview, index) => (
              <div key={index} className="relative group">
                {filePreview.type === "IMAGE" && filePreview.previewUrl ? (
                  <div
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${theme.input.attachmentBorder}`}
                  >
                    <img
                      src={filePreview.previewUrl || "/placeholder.svg"}
                      alt={filePreview.file.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isSending}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : filePreview.type === "VIDEO" && filePreview.previewUrl ? (
                  <div
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${theme.input.attachmentBorder}`}
                  >
                    <video
                      src={filePreview.previewUrl}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      disabled={isSending}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`relative w-20 h-20 rounded-lg border-2 ${theme.input.attachmentBorder} bg-white flex flex-col items-center justify-center p-2`}
                  >
                    <FileText className="w-6 h-6 text-purple-600 mb-1" />
                    <span className="text-xs text-gray-600 truncate w-full text-center">
                      {filePreview.file.name.length > 10
                        ? filePreview.file.name.substring(0, 10) + "..."
                        : filePreview.file.name}
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isSending}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 relative">
        {showEmojiPicker && (
          <div className="absolute bottom-full left-4 mb-2 z-50 shadow-2xl rounded-lg overflow-hidden">
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              autoFocusSearch={false}
              width={350}
              height={400}
              previewConfig={{
                showPreview: false,
              }}
              skinTonesDisabled
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className={`w-full ${theme.input.borderColor} rounded-lg h-12 pl-4 pr-24 transition-all duration-200`}
              onKeyPress={handleKeyPress}
              disabled={disabled || isSending}
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              <span
                className={`text-xs ${
                  newMessage.length > 1000
                    ? "text-red-500 font-semibold"
                    : "text-gray-500"
                }`}
              >
                {newMessage.length}/1000
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleEmojiPicker}
                className={`text-gray-500 ${theme.input.iconHoverColor} ${theme.input.iconHoverBg} transition-all duration-200 rounded-lg p-2 h-8 w-8`}
                disabled={isSending}
              >
                <Smile className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSend}
            disabled={
              (!newMessage.trim() && selectedFiles.length === 0) ||
              disabled ||
              isSending
            }
            className={`${theme.input.buttonBg} ${theme.input.buttonHover} ${theme.input.buttonText} h-12 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
