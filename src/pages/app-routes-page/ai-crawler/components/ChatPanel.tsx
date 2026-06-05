import { useState, useRef, useEffect } from "react";
import { Send, RotateCw, User, Bot, Lock } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { CrawlWidget } from "@/types/ai-crawler/crawlRoom";

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
  widget?: CrawlWidget;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (query: string) => void;
  onRecrawl: () => void;
  disabled: boolean;
  sending: boolean;
  recrawling: boolean;
  onSelectWidget: (widget: CrawlWidget) => void;
}

export default function ChatPanel({
  messages,
  onSend,
  onRecrawl,
  disabled,
  sending,
  recrawling,
  onSelectWidget,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const { t } = useLanguage("ai-crawler");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled || sending) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Bot className="w-4 h-4 text-purple-500" />
          {t("chat.title")}
        </h3>
        <button
          id="ai-crawler-recrawl-btn"
          onClick={onRecrawl}
          disabled={recrawling || disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
            rounded-lg border border-purple-200 text-purple-600
            hover:bg-purple-50 active:bg-purple-100
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200"
        >
          <RotateCw className={`w-3.5 h-3.5 ${recrawling ? "animate-spin" : ""}`} />
          {recrawling ? t("chat.recrawling") : t("chat.recrawl")}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 crawler-chat-scroll">
        {messages.length === 0 && !disabled && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            <p>{t("chat.emptyState")}</p>
          </div>
        )}

        {disabled && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <Lock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{t("chat.disabledHint")}</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`crawler-msg-enter flex gap-2.5 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-purple-600" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-purple-600 text-white rounded-br-md"
                  : "bg-gray-100 text-gray-800 rounded-bl-md"
              }`}
            >
              <p>{msg.content || (msg.widget ? t("chat.ai") + " generated a widget" : "")}</p>
              {msg.widget && (
                <button
                  onClick={() => onSelectWidget(msg.widget!)}
                  className="mt-2 text-xs underline opacity-80 hover:opacity-100 transition-opacity"
                >
                  👀 View Widget
                </button>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex gap-2.5 crawler-msg-enter">
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
            <div className="bg-gray-100 rounded-xl rounded-bl-md px-4 py-3">
              <span className="crawl-typing-dot" />
              <span className="crawl-typing-dot" />
              <span className="crawl-typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-100 p-3 flex items-end gap-2"
      >
        <textarea
          id="ai-crawler-chat-input"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? t("chat.disabledHint") : t("chat.placeholder")}
          disabled={disabled || sending}
          rows={1}
          className="crawler-textarea flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200
            focus:border-purple-400 focus:ring-2 focus:ring-purple-100
            outline-none transition-all text-sm bg-gray-50/50
            placeholder:text-gray-400
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          id="ai-crawler-send-btn"
          type="submit"
          disabled={disabled || sending || !input.trim()}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            bg-purple-600 text-white
            hover:bg-purple-700 active:bg-purple-800
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200
            ${input.trim() && !disabled && !sending ? "crawler-send-active" : ""}`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
