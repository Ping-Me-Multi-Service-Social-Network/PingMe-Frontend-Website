import type React from "react";
import { 
  Smile, 
  ImagePlus, 
  Paperclip, 
  CloudSun,
  Vote,
  Mic,
  StickyNote,
  Bell
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";

interface ChatInputToolbarProps {
  disabled: boolean;
  canCreateNote: boolean;
  canCreatePoll: boolean;
  isSending: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  onImageClick: () => void;
  onFileClick: () => void;
  onWeatherClick: () => void;
  onNoteClick: () => void;
  onReminderClick: () => void;
  onPollClick: () => void;
  onRecordingClick: () => void;
  onToggleEmojiPicker: () => void;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ChatInputToolbar({
  disabled,
  canCreateNote,
  canCreatePoll,
  isSending,
  isRecording,
  isTranscribing,
  onImageClick,
  onFileClick,
  onWeatherClick,
  onNoteClick,
  onReminderClick,
  onPollClick,
  onRecordingClick,
  onToggleEmojiPicker,
  imageInputRef,
  fileInputRef,
  handleImageChange,
  handleFileChange,
}: ChatInputToolbarProps) {
  const { t } = useTranslation("chat");

  const btnClass = "h-8 w-8 text-[#001233] hover:bg-muted/50 rounded-md transition-colors emoji-toggle-btn";
  const iconSize = "w-5 h-5"; // Khoảng 20px

  return (
    <div className="flex items-center gap-1 px-4 py-1 bg-white">
      <Button 
        variant="ghost" 
        size="icon" 
        className={btnClass} 
        title="Sticker"
        onClick={onToggleEmojiPicker}
      >
        <Smile className={iconSize} strokeWidth={1.5} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={btnClass}
        onClick={onImageClick}
        disabled={disabled || isSending || isRecording || isTranscribing}
        title={t("input.sendImageTitle")}
      >
        <ImagePlus className={iconSize} strokeWidth={1.5} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={btnClass}
        onClick={onFileClick}
        disabled={disabled || isSending || isRecording || isTranscribing}
        title={t("input.sendFileTitle")}
      >
        <Paperclip className={iconSize} strokeWidth={1.5} />
      </Button>

      <Button 
        variant="ghost" 
        size="icon" 
        className={btnClass} 
        title={t("input.sendWeatherTitle", "Thời tiết")}
        onClick={onWeatherClick}
        disabled={disabled || isSending || isRecording || isTranscribing}
      >
        <CloudSun className={iconSize} strokeWidth={1.5} />
      </Button>

      <Button 
        variant="ghost" 
        size="icon" 
        className={btnClass} 
        title={t("input.createPollTitle", "Bình chọn")}
        onClick={onPollClick}
        disabled={disabled || isSending || isRecording || isTranscribing || !canCreatePoll}
      >
        <Vote className={iconSize} strokeWidth={1.5} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={btnClass}
        title={t("input.createNote", "Tạo ghi chú")}
        onClick={onNoteClick}
        disabled={disabled || isSending || isRecording || isTranscribing || !canCreateNote}
      >
        <StickyNote className={iconSize} strokeWidth={1.5} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={btnClass}
        title={t("input.createReminder", "Tạo nhắc hẹn")}
        onClick={onReminderClick}
        disabled={disabled || isSending || isRecording || isTranscribing || !canCreateNote}
      >
        <Bell className={iconSize} strokeWidth={1.5} />
      </Button>

      <Button 
        variant="ghost" 
        size="icon" 
        className={btnClass} 
        title="Ghi âm"
        onClick={onRecordingClick}
        disabled={disabled || isSending || isRecording || isTranscribing}
      >
        <Mic className={iconSize} strokeWidth={1.5} />
      </Button>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleImageChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}


