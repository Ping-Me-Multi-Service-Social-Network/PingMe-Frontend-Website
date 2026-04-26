import type React from "react";
import { Button } from "@/components/ui/button.tsx";
import { Smile, Send, ThumbsUp } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChatInputAreaProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  theme: any;
  newMessage: string;
  hasFiles: boolean;
  disabled: boolean;
  isSending: boolean;
  targetName?: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onToggleEmojiPicker: () => void;
  onSend: () => void;
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
}

export function ChatInputArea({
  newMessage,
  hasFiles,
  disabled,
  isSending,
  targetName,
  onKeyDown,
  onInputChange,
  onToggleEmojiPicker,
  onSend,
  onPaste,
}: ChatInputAreaProps) {
  const { t } = useTranslation("chat");

  return (
    <div className="flex flex-col w-full bg-white">
      <div className="flex items-end gap-1 pl-4 pr-2 pb-1">
        <div className="flex-1 relative min-h-[40px] flex items-center">
          <textarea
            value={newMessage}
            onChange={onInputChange}
            placeholder={targetName ? `Nhập @, tin nhắn tới ${targetName}` : t("input.placeholder")}
            className="w-full bg-transparent border-none focus:ring-0 resize-none py-2 text-[15px] max-h-[120px] overflow-y-auto"
            rows={1}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            disabled={disabled || isSending}
            style={{ minHeight: '40px', fontFamily: "'Inter', sans-serif" }}
          />

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleEmojiPicker}
              className="h-8 w-8 text-muted-foreground hover:text-primary emoji-toggle-btn"
              disabled={isSending}
            >
              <Smile className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onSend}
              disabled={disabled || isSending}
              className={`h-8 w-8 transition-colors ${newMessage.trim() || hasFiles ? "text-primary hover:text-primary/80" : "text-[#ff9800] hover:text-[#ff9800]/80"}`}
            >
              {newMessage.trim() || hasFiles ? (
                <Send className="w-6 h-6" />
              ) : (
                <ThumbsUp className="w-6 h-6 fill-[#ff9800]" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
