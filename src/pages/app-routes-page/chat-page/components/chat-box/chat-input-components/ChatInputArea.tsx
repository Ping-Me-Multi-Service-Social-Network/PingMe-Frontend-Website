import type React from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Smile, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChatInputAreaProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  theme: any;
  newMessage: string;
  hasFiles: boolean;
  disabled: boolean;
  isSending: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onToggleEmojiPicker: () => void;
  onSend: () => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}

export function ChatInputArea({
  theme,
  newMessage,
  hasFiles,
  disabled,
  isSending,
  onInputChange,
  onKeyPress,
  onToggleEmojiPicker,
  onSend,
  onPaste,
}: ChatInputAreaProps) {
  const { t } = useTranslation("chat");

  return (
    <div className="chat-input-row">
      <div className="chat-input-field">
        <Input
          value={newMessage}
          onChange={onInputChange}
          placeholder={t("input.placeholder")}
          className={`w-full ${theme.input.borderColor} rounded-lg h-12 pl-4 pr-24 transition-all duration-200`}
          onKeyPress={onKeyPress}
          onPaste={onPaste}
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
            onClick={onToggleEmojiPicker}
            className={`text-gray-500 ${theme.input.iconHoverColor} ${theme.input.iconHoverBg} transition-all duration-200 rounded-lg p-2 h-8 w-8`}
            disabled={isSending}
          >
            <Smile className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <button
        onClick={onSend}
        disabled={(!newMessage.trim() && !hasFiles) || disabled || isSending}
        className="chat-send-btn"
        style={theme.input.sendBtnStyle}
      >
        <Send />
      </button>
    </div>
  );
}
