import type React from "react";
import { 
  Smile, 
  ImagePlus, 
  Paperclip, 
  Contact, 
  Scan, 
  Type, 
  Zap, 
  CreditCard, 
  MoreHorizontal,
  Mic
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";

interface ChatInputToolbarProps {
  disabled: boolean;
  isSending: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  onImageClick: () => void;
  onFileClick: () => void;
  onWeatherClick: () => void;
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
  isSending,
  isRecording,
  isTranscribing,
  onImageClick,
  onFileClick,
  onWeatherClick,
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

      <Button variant="ghost" size="icon" className={btnClass} title="Danh thiếp">
        <Contact className={iconSize} strokeWidth={1.5} />
      </Button>

      <Button variant="ghost" size="icon" className={btnClass} title="Chụp màn hình">
        <Scan className={iconSize} strokeWidth={1.5} />
      </Button>

      <Button variant="ghost" size="icon" className={btnClass} title="Định dạng văn bản">
        <Type className={iconSize} strokeWidth={1.5} />
      </Button>

      <Button 
        variant="ghost" 
        size="icon" 
        className={btnClass} 
        title="Tin nhắn nhanh (Thời tiết)"
        onClick={onWeatherClick}
        disabled={disabled || isSending || isRecording || isTranscribing}
      >
        <Zap className={iconSize} strokeWidth={1.5} />
      </Button>

      <Button 
        variant="ghost" 
        size="icon" 
        className={btnClass} 
        title="Bình chọn"
        onClick={onPollClick}
        disabled={disabled || isSending || isRecording || isTranscribing}
      >
        <CreditCard className={iconSize} strokeWidth={1.5} />
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

      <Button variant="ghost" size="icon" className={btnClass}>
        <MoreHorizontal className={iconSize} strokeWidth={1.5} />
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
