import type React from "react";
import { getTheme } from "../../utils/chatThemes.ts";
import type { RoomResponse } from "@/types/chat/room";

import { useState, useRef, useEffect, useCallback } from "react";
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
  Mic,
  Square,
} from "lucide-react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import { SocketManager } from "@/features/websocket/socketManager";
import { audioTranscribeService } from "@/services/ai/audio-transcribe";

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

const MAX_RECORD_DURATION = 90; // 1 phút 30 giây

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
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Auto-stop at MAX_RECORD_DURATION
  useEffect(() => {
    if (isRecording && recordingTime >= MAX_RECORD_DURATION) {
      stopRecording();
    }
  }, [recordingTime, isRecording]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ---- Voice Recording Logic ----
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      setShowEmojiPicker(false);

      recordTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      toast.error("Không thể truy cập microphone. Vui lòng cấp quyền và thử lại.");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return;

    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    setIsRecording(false);

    await new Promise<void>((resolve) => {
      const recorder = mediaRecorderRef.current!;
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    chunksRef.current = [];

    if (blob.size === 0) {
      toast.error("Không ghi được âm thanh. Vui lòng thử lại.");
      return;
    }

    const file = new File([blob], `recording-${Date.now()}.webm`, { type: "audio/webm" });

    setIsTranscribing(true);
    try {
      const res = await audioTranscribeService.transcribeAudio(file);
      const transcribedText = res.data.data.content;
      if (transcribedText && transcribedText.trim()) {
        setNewMessage(
          newMessage.trim()
            ? newMessage + " " + transcribedText.trim()
            : transcribedText.trim()
        );
      }
    } catch {
      toast.error("Không thể chuyển đổi giọng nói. Vui lòng thử lại.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const cancelRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    chunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
  };

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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setNewMessage(value);

      console.log("[v0] Input changed:", {
        value,
        valueLength: value.length,
        isTyping,
        roomId: selectedChat.roomId,
      });

      if (!isTyping && value.trim()) {
        setIsTyping(true);
        console.log("[v0] Starting typing - sending isTyping=true");
        SocketManager.sendTyping(selectedChat.roomId, true);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        console.log("[v0] Typing timeout - sending isTyping=false");
        setIsTyping(false);
        SocketManager.sendTyping(selectedChat.roomId, false);
      }, 2000);
    },
    [selectedChat.roomId, isTyping, setNewMessage]
  );

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        SocketManager.sendTyping(selectedChat.roomId, false);
      }
    };
  }, [selectedChat.roomId, isTyping]);

  const handleSend = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || isSending) {
      return;
    }

    if (isTyping) {
      console.log("[v0] Sending message - stopping typing");
      setIsTyping(false);
      SocketManager.sendTyping(selectedChat.roomId, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
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
      {/* Toolbar: Image, File, Weather, Mic */}
      <div
        className={`flex items-center space-x-1 p-3 border-b ${theme.input.background}`}
      >
        <Button
          variant="ghost"
          size="lg"
          className={`${theme.input.iconColor} ${theme.input.iconHoverColor} ${theme.input.iconHoverBg} transition-all duration-200 rounded-lg`}
          onClick={handleImageClick}
          disabled={disabled || isSending || isRecording || isTranscribing}
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
          disabled={disabled || isSending || isRecording || isTranscribing}
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
          disabled={disabled || isSending || isRecording || isTranscribing}
          title="Gửi thông tin thời tiết"
        >
          <CloudSun className="w-5 h-5" />
        </Button>

        {/* Mic button in toolbar */}
        <Button
          variant="ghost"
          size="sm"
          className={`${theme.input.iconColor} ${theme.input.iconHoverColor} ${theme.input.iconHoverBg} transition-all duration-200 rounded-lg`}
          onClick={startRecording}
          disabled={disabled || isSending || isRecording || isTranscribing}
          title="Ghi âm giọng nói"
        >
          <Mic className="w-5 h-5" />
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

        {/* ===== TRANSCRIBING STATE ===== */}
        {isTranscribing && (
          <div className="flex items-center gap-3 h-12 px-4 border border-purple-200 rounded-lg bg-purple-50">
            <div
              className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full flex-shrink-0"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
            <span
              className="text-sm text-purple-600 font-medium"
              style={{ animation: "pulse 1.8s ease-in-out infinite" }}
            >
              Đang chuyển đổi giọng nói thành văn bản...
            </span>
          </div>
        )}

        {/* ===== RECORDING STATE ===== */}
        {isRecording && !isTranscribing && (
          <div className="flex items-center gap-2 h-12">
            {/* Cancel button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelRecording}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg h-10 px-3"
              title="Hủy ghi âm"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Recording indicator bar */}
            <div className="flex-1 flex items-center gap-3 h-12 px-4 border border-red-200 rounded-lg bg-red-50">
              {/* Pulsing red dot */}
              <div
                className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0"
                style={{ animation: "pulse 1.2s ease-in-out infinite" }}
              />
              <span className="text-sm font-medium text-red-500">Đang ghi âm</span>
              <span
                className="text-sm text-gray-500"
                style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.5px" }}
              >
                {formatTime(recordingTime)}
              </span>

              {/* Waveform bars */}
              <div className="flex items-center gap-0.5 ml-auto h-6">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-sm bg-red-400"
                    style={{
                      animation: `waveBar 0.9s ease-in-out ${i * 0.08}s infinite alternate`,
                      height: "4px",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Stop button */}
            <Button
              onClick={stopRecording}
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white h-10 px-4 rounded-lg shadow-md hover:shadow-lg"
              title="Dừng ghi âm"
            >
              <Square className="w-4 h-4 fill-current" />
            </Button>
          </div>
        )}

        {/* ===== NORMAL INPUT STATE ===== */}
        {!isRecording && !isTranscribing && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={newMessage}
                onChange={handleInputChange}
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
        )}
      </div>

      {/* Inline keyframes for recording animations */}
      <style>{`
        @keyframes waveBar {
          0% { height: 4px; opacity: 0.4; }
          100% { height: 18px; opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
