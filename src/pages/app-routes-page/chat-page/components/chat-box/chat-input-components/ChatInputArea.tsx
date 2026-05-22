import type React from "react";
import { Button } from "@/components/ui/button.tsx";
import { Smile, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChatInputAreaProps {
  newMessage: string;
  hasFiles: boolean;
  disabled: boolean;
  canSendMessage: boolean;
  isSending: boolean;
  targetName?: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onToggleEmojiPicker: () => void;
  onSend: () => void;
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
}

const MAX_CHARS = 1000;

export function ChatInputArea({
  newMessage,
  hasFiles,
  disabled,
  canSendMessage,
  isSending,
  targetName,
  onKeyDown,
  onInputChange,
  onToggleEmojiPicker,
  onSend,
  onPaste,
  onBlur,
}: ChatInputAreaProps) {
  const { t } = useTranslation("chat");
  const charCount = newMessage.length;
  const isNearLimit = charCount > MAX_CHARS * 0.9;
  const isAtLimit = charCount >= MAX_CHARS;

  const placeholderText = targetName
    ? t("input.placeholderTarget", { targetName })
    : t("input.placeholder");

  let counterColorClass = "text-gray-400";
  if (isAtLimit) {
    counterColorClass = "text-red-500";
  } else if (isNearLimit) {
    counterColorClass = "text-orange-500";
  }

  const isSendDisabled = disabled || isSending || !canSendMessage || (charCount === 0 && !hasFiles);

  return (
    <div className="flex flex-col w-full bg-white">
      <div className="flex items-end gap-2 pl-4 pr-2 pb-1">
        <div className="flex-1 relative min-h-[42px] flex items-center border border-gray-200 rounded-lg focus-within:border-primary/50 transition-colors bg-white">
          <textarea
            value={newMessage}
            onChange={onInputChange}
            placeholder={placeholderText}
            className="w-full bg-transparent border-none !border-none focus:ring-0 focus:outline-none outline-none focus-visible:ring-0 resize-none py-2 pl-3 pr-14 text-[15px] max-h-[120px] overflow-y-auto"
            rows={1}
            maxLength={MAX_CHARS}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            onBlur={onBlur}
            disabled={disabled || isSending || !canSendMessage}
            style={{ minHeight: "40px", border: "none", outline: "none", boxShadow: "none", fontFamily: "'Inter', sans-serif" }}
          />

          <div className="absolute bottom-1 right-2 pointer-events-none">
            <span className={`text-[10px] font-medium transition-colors ${counterColorClass}`}>
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleEmojiPicker}
            className="h-9 w-9 text-muted-foreground hover:text-primary emoji-toggle-btn"
            disabled={isSending || !canSendMessage}
          >
            <Smile className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onSend}
            disabled={isSendDisabled}
            className="h-9 w-9 text-primary hover:text-primary/80 transition-colors"
          >
            <Send className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
