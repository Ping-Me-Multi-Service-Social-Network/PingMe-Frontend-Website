import type React from "react";
import { getTheme } from "../../utils/chatThemes.ts";
import type { RoomResponse } from "@/types/chat/room";
import type { MessageResponse } from "@/types/chat/message";
import { useAppSelector } from "@/features/hooks.ts";
import { useReducer, useRef, useEffect, useCallback } from "react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import { SocketManager } from "@/features/websocket";
import { useTranslation } from "react-i18next";
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder";

import {
  ChatInputToolbar,
  FilePreviewList,
  ChatInputArea,
  RecordingState,
  CreatePollModal,
} from "./chat-input-components";
import { X, Reply, Edit2 } from "lucide-react";

interface FilePreview {
  file: File;
  type: "IMAGE" | "VIDEO" | "FILE";
  previewUrl?: string;
}

interface ChatInputProps {
  selectedChat: RoomResponse;
  onSendMessage: (msg: string) => void;
  onSendFile: (file: File, type: "IMAGE" | "VIDEO" | "FILE") => Promise<void>;
  onSendMultipleImages: (files: File[]) => Promise<void>;
  onSendWeather: (lat: number, lon: number) => Promise<void>;
  onCreatePoll: (question: string, options: string[], allowMultiple: boolean) => Promise<void>;
  disabled?: boolean;
  droppedFiles?: File[];
  onDroppedFilesProcessed?: () => void;
  replyMessage?: MessageResponse | null;
  onCancelReply?: () => void;
  editingMessage?: MessageResponse | null;
  onCancelEdit?: () => void;
}

// State declaration for useReducer
interface ChatInputState {
  showEmojiPicker: boolean;
  selectedFiles: FilePreview[];
  isSending: boolean;
  newMessage: string;
  isTyping: boolean;
  showPollModal: boolean;
}

type ChatInputAction =
  | { type: "SET_EMOJI_PICKER"; payload: boolean }
  | { type: "TOGGLE_EMOJI_PICKER" }
  | { type: "SET_SELECTED_FILES"; payload: FilePreview[] }
  | { type: "ADD_SELECTED_FILES"; payload: FilePreview[] }
  | { type: "REMOVE_FILE"; payload: number }
  | { type: "CLEAR_FILES" }
  | { type: "SET_SENDING"; payload: boolean }
  | { type: "SET_MESSAGE"; payload: string }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "SET_POLL_MODAL"; payload: boolean };

const chatInputReducer = (
  state: ChatInputState,
  action: ChatInputAction,
): ChatInputState => {
  switch (action.type) {
    case "SET_EMOJI_PICKER":
      return { ...state, showEmojiPicker: action.payload };
    case "TOGGLE_EMOJI_PICKER":
      return { ...state, showEmojiPicker: !state.showEmojiPicker };
    case "SET_SELECTED_FILES":
      return { ...state, selectedFiles: action.payload };
    case "ADD_SELECTED_FILES":
      return { ...state, selectedFiles: [...state.selectedFiles, ...action.payload] };
    case "REMOVE_FILE": {
      const newFiles = [...state.selectedFiles];
      if (newFiles[action.payload].previewUrl) {
        URL.revokeObjectURL(newFiles[action.payload].previewUrl!);
      }
      newFiles.splice(action.payload, 1);
      return { ...state, selectedFiles: newFiles };
    }
    case "CLEAR_FILES": {
      state.selectedFiles.forEach((filePreview) => {
        if (filePreview.previewUrl) {
          URL.revokeObjectURL(filePreview.previewUrl);
        }
      });
      return { ...state, selectedFiles: [] };
    }
    case "SET_SENDING":
      return { ...state, isSending: action.payload };
    case "SET_MESSAGE":
      return { ...state, newMessage: action.payload };
    case "SET_TYPING":
      return { ...state, isTyping: action.payload };
    case "SET_POLL_MODAL":
      return { ...state, showPollModal: action.payload };
    default:
      return state;
  }
};

const initialState: ChatInputState = {
  showEmojiPicker: false,
  selectedFiles: [],
  isSending: false,
  newMessage: "",
  isTyping: false,
  showPollModal: false,
};

export function ChatBoxInput({
  selectedChat,
  onSendMessage,
  onSendFile,
  onSendMultipleImages,
  onSendWeather,
  onCreatePoll,
  disabled = false,
  droppedFiles,
  onDroppedFilesProcessed,
  replyMessage,
  onCancelReply,
  editingMessage,
  onCancelEdit,
}: ChatInputProps) {
  const theme = getTheme(selectedChat.theme);
  const { t } = useTranslation("chat");
  const { userSession } = useAppSelector((state) => state.auth);

  const [state, dispatch] = useReducer(chatInputReducer, initialState);
  const {
    showEmojiPicker,
    selectedFiles,
    isSending,
    newMessage,
    isTyping,
    showPollModal,
  } = state;

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef(newMessage);

  // Voice recording via hook
  const {
    isRecording,
    recordingTime,
    isTranscribing,
    startRecording: startRec,
    stopRecording,
    cancelRecording,
    formatTime,
  } = useVoiceRecorder({
    onTranscribed: (text) => {
      dispatch({
        type: "SET_MESSAGE",
        payload: newMessage.trim() ? newMessage + " " + text : text,
      });
    },
  });

  const startRecording = useCallback(async () => {
    dispatch({ type: "SET_EMOJI_PICKER", payload: false });
    await startRec();
  }, [startRec]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside picker AND not on a toggle button
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.emoji-toggle-btn')
      ) {
        dispatch({ type: "SET_EMOJI_PICKER", payload: false });
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    latestMessageRef.current = newMessage;
  }, [newMessage]);

  useEffect(() => {
    if (editingMessage) {
      dispatch({ type: "SET_MESSAGE", payload: editingMessage.content });
      // clear files if editing? Actually, usually you just don't edit files but we can clear them.
      dispatch({ type: "CLEAR_FILES" });
    }
  }, [editingMessage]);

  const handleEmojiSelect = useCallback(
    (emojiData: EmojiClickData) => {
      dispatch({
        type: "SET_MESSAGE",
        payload: `${latestMessageRef.current}${emojiData.emoji}`,
      });
    },
    [],
  );

  const toggleEmojiPicker = () => {
    dispatch({ type: "TOGGLE_EMOJI_PICKER" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const newFiles: FilePreview[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          const fileType = getFileType(blob);
          const previewUrl = URL.createObjectURL(blob);
          newFiles.push({
            file: blob,
            type: fileType,
            previewUrl,
          });
        }
      }
    }

    if (newFiles.length > 0) {
      dispatch({ type: "ADD_SELECTED_FILES", payload: newFiles });
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      dispatch({ type: "SET_MESSAGE", payload: value });

      if (!isTyping && value.trim()) {
        dispatch({ type: "SET_TYPING", payload: true });
        SocketManager.sendTyping(selectedChat.roomId, true);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        dispatch({ type: "SET_TYPING", payload: false });
        SocketManager.sendTyping(selectedChat.roomId, false);
      }, 2000);
    },
    [selectedChat.roomId, isTyping],
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
      dispatch({ type: "SET_TYPING", payload: false });
      SocketManager.sendTyping(selectedChat.roomId, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    dispatch({ type: "SET_SENDING", payload: true });

    try {
      if (selectedFiles.length > 0) {
        const imageFiles = selectedFiles.filter((f) => f.type === "IMAGE").map((f) => f.file);
        const otherFiles = selectedFiles.filter((f) => f.type !== "IMAGE");

        if (imageFiles.length > 0) {
          await onSendMultipleImages(imageFiles);
        }

        for (const filePreview of otherFiles) {
          await onSendFile(filePreview.file, filePreview.type);
        }
        dispatch({ type: "CLEAR_FILES" });
      }

      if (newMessage.trim()) {
        onSendMessage(newMessage);
        dispatch({ type: "SET_MESSAGE", payload: "" });
      }

      dispatch({ type: "SET_EMOJI_PICKER", payload: false });
    } finally {
      dispatch({ type: "SET_SENDING", payload: false });
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

  useEffect(() => {
    if (droppedFiles && droppedFiles.length > 0) {
      const newFiles: FilePreview[] = [];
      droppedFiles.forEach((file) => {
        const fileType = getFileType(file);
        const previewUrl =
          fileType === "IMAGE" || fileType === "VIDEO"
            ? URL.createObjectURL(file)
            : undefined;

        newFiles.push({
          file,
          type: fileType,
          previewUrl,
        });
      });
      dispatch({ type: "ADD_SELECTED_FILES", payload: newFiles });
      onDroppedFilesProcessed?.();
    }
  }, [droppedFiles, onDroppedFilesProcessed]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: FilePreview[] = [];
      Array.from(files).forEach((file) => {
        const fileType = getFileType(file);
        const previewUrl =
          fileType === "IMAGE" || fileType === "VIDEO"
            ? URL.createObjectURL(file)
            : undefined;

        newFiles.push({
          file,
          type: fileType,
          previewUrl,
        });
      });
      dispatch({ type: "ADD_SELECTED_FILES", payload: newFiles });
      e.target.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: FilePreview[] = [];
      Array.from(files).forEach((file) => {
        const fileType = getFileType(file);
        const previewUrl =
          fileType === "IMAGE" || fileType === "VIDEO"
            ? URL.createObjectURL(file)
            : undefined;

        newFiles.push({
          file,
          type: fileType,
          previewUrl,
        });
      });
      dispatch({ type: "ADD_SELECTED_FILES", payload: newFiles });
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    dispatch({ type: "REMOVE_FILE", payload: index });
  };

  const handleWeatherClick = () => {
    if ("geolocation" in navigator) {
      toast.info(t("input.gettingLocation"));
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            dispatch({ type: "SET_SENDING", payload: true });
            await onSendWeather(latitude, longitude);
            toast.success(t("input.weatherSentSuccess"));
          } catch (error) {
            toast.error(getErrorMessage(error, t("input.weatherSentError")));
          } finally {
            dispatch({ type: "SET_SENDING", payload: false });
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error(t("input.locationError"));
        },
      );
    } else {
      toast.error(t("input.locationNotSupported"));
    }
  };

  const handlePollClick = () => {
    dispatch({ type: "SET_POLL_MODAL", payload: true });
  };

  const handleCreatePoll = async (question: string, options: string[], allowMultiple: boolean) => {
    try {
      dispatch({ type: "SET_SENDING", payload: true });
      await onCreatePoll(question, options, allowMultiple);
      dispatch({ type: "SET_POLL_MODAL", payload: false });
    } catch (error) {
      toast.error(getErrorMessage(error, t("input.createPollError", "Failed to create poll")));
    } finally {
      dispatch({ type: "SET_SENDING", payload: false });
    }
  };

  return (
    <div className="chat-box-input flex flex-col bg-white border-t border-gray-100">
      <ChatInputToolbar
        disabled={disabled}
        isSending={isSending}
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        onImageClick={handleImageClick}
        onFileClick={handleFileClick}
        onWeatherClick={handleWeatherClick}
        onPollClick={handlePollClick}
        onRecordingClick={startRecording}
        onToggleEmojiPicker={toggleEmojiPicker}
        imageInputRef={imageInputRef}
        fileInputRef={fileInputRef}
        handleImageChange={handleImageChange}
        handleFileChange={handleFileChange}
      />

      <FilePreviewList
        theme={theme}
        selectedFiles={selectedFiles}
        isSending={isSending}
        onRemoveFile={removeFile}
      />

      {replyMessage && (
        <div className="bg-gray-50 border-t border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold flex items-center text-primary">
              <Reply className="w-3 h-3 mr-1" />
              {t("input.replyTo", "Replying to")} {replyMessage.senderId === userSession?.id ? t("bubbles.messages.you", "You") : selectedChat.participants.find(p => p.userId === replyMessage.senderId)?.name || "User"}
            </span>
            <span className="text-sm text-gray-600 truncate mt-0.5">
              {!replyMessage.isActive ? t("bubbles.messages.recalled") :
                replyMessage.type === "TEXT" ? replyMessage.content :
                  replyMessage.type === "IMAGE" ? t("bubbles.messages.image", "Image") :
                    replyMessage.type === "VIDEO" ? t("bubbles.messages.video", "Video") :
                      replyMessage.type === "FILE" ? t("bubbles.messages.file", "File") :
                        replyMessage.type === "WEATHER" ? t("bubbles.messages.weather", "Weather") :
                          replyMessage.type === "POLL" ? `[${t("input.createPollTitle", "Poll")}] ${replyMessage.poll?.question || ''}` :
                            "Message"}
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-200 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {editingMessage && (
        <div className="bg-purple-50 border-t border-b border-purple-200 px-4 py-2 flex items-center justify-between">
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold flex items-center text-purple-600">
              <Edit2 className="w-3 h-3 mr-1" />
              {t("bubbles.messages.editBtn", "Edit message")}
            </span>
            <span className="text-sm text-gray-600 truncate mt-0.5">
              {editingMessage.content}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "SET_MESSAGE", payload: "" });
              onCancelEdit?.();
            }}
            className="p-1 rounded-full text-purple-500 hover:bg-purple-200 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="p-4 relative">
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-full left-4 mb-2 z-50 shadow-2xl rounded-lg overflow-hidden"
          >
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
              className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full shrink-0"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
            <span
              className="text-sm text-purple-600 font-medium"
              style={{ animation: "pulse 1.8s ease-in-out infinite" }}
            >
              {t("input.transcribing")}
            </span>
          </div>
        )}

        {/* ===== RECORDING STATE ===== */}
        {isRecording && !isTranscribing && (
          <RecordingState
            recordingTime={recordingTime}
            formatTime={formatTime}
            onCancel={cancelRecording}
            onStop={stopRecording}
          />
        )}

        {/* ===== NORMAL INPUT STATE ===== */}
        {!isRecording && !isTranscribing && (
          <ChatInputArea
            newMessage={newMessage}
            hasFiles={selectedFiles.length > 0}
            disabled={disabled}
            isSending={isSending}
            onInputChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onToggleEmojiPicker={toggleEmojiPicker}
            onSend={handleSend}
            targetName={selectedChat?.name || ""}
          />
        )}
      </div>

      <CreatePollModal
        isOpen={showPollModal}
        onClose={() => dispatch({ type: "SET_POLL_MODAL", payload: false })}
        onSubmit={handleCreatePoll}
      />

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
