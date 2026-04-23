import type React from "react";
import { ImagePlus, Paperclip, CloudSun, Mic, BarChart2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChatInputToolbarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  theme: any;
  disabled: boolean;
  isSending: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  onImageClick: () => void;
  onFileClick: () => void;
  onWeatherClick: () => void;
  onRecordingClick: () => void;
  onPollClick: () => void;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ChatInputToolbar({
  theme,
  disabled,
  isSending,
  isRecording,
  isTranscribing,
  onImageClick,
  onFileClick,
  onWeatherClick,
  onRecordingClick,
  onPollClick,
  imageInputRef,
  fileInputRef,
  handleImageChange,
  handleFileChange,
}: ChatInputToolbarProps) {
  const { t } = useTranslation("chat");

  return (
    <div className="chat-input-toolbar" style={theme.input.toolbarBgStyle}>
      <button
        className="chat-input-toolbar__btn"
        onClick={onImageClick}
        disabled={disabled || isSending || isRecording || isTranscribing}
      >
        <ImagePlus />
      </button>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleImageChange}
      />

      <button
        className="chat-input-toolbar__btn"
        onClick={onFileClick}
        disabled={disabled || isSending || isRecording || isTranscribing}
      >
        <Paperclip />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        className="chat-input-toolbar__btn"
        onClick={onWeatherClick}
        disabled={disabled || isSending || isRecording || isTranscribing}
        title={t("input.sendWeatherTitle")}
      >
        <CloudSun />
      </button>

      <button
        className="chat-input-toolbar__btn"
        onClick={onPollClick}
        disabled={disabled || isSending || isRecording || isTranscribing}
        title={t("input.createPollTitle", "Create Poll")}
      >
        <BarChart2 />
      </button>

      {/* Mic button in toolbar */}
      <button
        className="chat-input-toolbar__btn"
        onClick={onRecordingClick}
        disabled={disabled || isSending || isRecording || isTranscribing}
        title={t("input.micTitle")}
      >
        <Mic />
      </button>
    </div>
  );
}
