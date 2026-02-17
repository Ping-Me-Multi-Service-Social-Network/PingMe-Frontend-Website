import { useState, useEffect, useRef, useCallback } from "react";
import { aiChatBoxService } from "@/services/ai/ai-chat-box";
import type { AIMessage } from "@/types/ai/aiMessage";
import type { AIChatRoomInformation } from "@/types/ai/aiChatRoomInformation";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatAreaProps {
  activeRoomId: string | null;
  onRoomCreated: (room: AIChatRoomInformation) => void;
  onRoomBumpToTop: (roomId: string) => void;
}

const MESSAGE_PAGE_SIZE = 20;

export default function ChatArea({
  activeRoomId,
  onRoomCreated,
  onRoomBumpToTop,
}: ChatAreaProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagePage, setMessagePage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const justCreatedRoomRef = useRef<string | null>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "instant",
      });
    }, 50);
  }, []);

  // Load messages for active room
  useEffect(() => {
    if (activeRoomId === null) {
      setMessages([]);
      setMessagePage(0);
      setHasMoreMessages(false);
      setCurrentRoomId(null);
      return;
    }

    // Skip API reload if this room was just created from the welcome screen
    // (we already have the messages in state)
    if (justCreatedRoomRef.current === activeRoomId) {
      justCreatedRoomRef.current = null;
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      setLoadingMessages(true);
      setMessages([]);
      setMessagePage(0);
      setCurrentRoomId(activeRoomId);

      try {
        const res = await aiChatBoxService.getChatHistory(
          activeRoomId,
          0,
          MESSAGE_PAGE_SIZE,
        );
        if (cancelled) return;
        const slice = res.data.data;
        // API returns newest first, we need oldest first for display
        setMessages(slice.content.reverse());
        setHasMoreMessages(!slice.last);
        setMessagePage(0);
        scrollToBottom(false);
      } catch (err) {
        console.error("[ChatArea] Error loading messages:", err);
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    };

    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [activeRoomId, scrollToBottom]);

  // Load older messages on scroll to top
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasMoreMessages || loadingOlder || !currentRoomId)
      return;

    if (container.scrollTop < 80) {
      setLoadingOlder(true);
      prevScrollHeightRef.current = container.scrollHeight;

      const nextPage = messagePage + 1;
      aiChatBoxService
        .getChatHistory(currentRoomId, nextPage, MESSAGE_PAGE_SIZE)
        .then((res) => {
          const slice = res.data.data;
          const older = slice.content.reverse();
          setMessages((prev) => [...older, ...prev]);
          setHasMoreMessages(!slice.last);
          setMessagePage(nextPage);

          // Maintain scroll position after prepending
          requestAnimationFrame(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop =
                newScrollHeight - prevScrollHeightRef.current;
            }
          });
        })
        .catch((err) => {
          console.error("[ChatArea] Error loading older messages:", err);
        })
        .finally(() => {
          setLoadingOlder(false);
        });
    }
  }, [hasMoreMessages, loadingOlder, currentRoomId, messagePage]);

  // Send message
  const handleSend = useCallback(
    async (prompt: string, files: File[]) => {
      if (sending) return;
      setSending(true);

      // Optimistic: add user message
      const tempUserMsg: AIMessage = {
        id: `temp-${Date.now()}`,
        chatRoomId: currentRoomId || "",
        userId: 0,
        type: "SENT",
        content: prompt,
        attachments: files.map((f) => ({
          url: URL.createObjectURL(f),
          fileType: f.type,
        })),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempUserMsg]);
      scrollToBottom();

      try {
        const res = await aiChatBoxService.chatWithAI(
          prompt,
          currentRoomId || undefined,
          files.length > 0 ? files : undefined,
        );

        const data = res.data.data;

        // AI response message
        const aiMsg: AIMessage = {
          id: `ai-${Date.now()}`,
          chatRoomId: data.chatRoomId,
          userId: 0,
          type: "RECEIVED",
          content: data.content,
          attachments: [],
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMsg]);
        scrollToBottom();

        // If new room was created
        if (!currentRoomId || data.isNewRoom) {
          const newRoom: AIChatRoomInformation = {
            id: data.chatRoomId,
            userId: 0,
            title: "Đang tạo tiêu đề...",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setCurrentRoomId(data.chatRoomId);
          // Mark this room as just-created so the useEffect skips reloading
          justCreatedRoomRef.current = data.chatRoomId;
          onRoomCreated(newRoom);
        } else {
          // Existing room — bump to top
          onRoomBumpToTop(data.chatRoomId);
        }
      } catch (err) {
        console.error("[ChatArea] Error sending message:", err);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      } finally {
        setSending(false);
      }
    },
    [currentRoomId, sending, scrollToBottom, onRoomCreated, onRoomBumpToTop],
  );

  // ---- Welcome Screen (no active room) ----
  if (
    activeRoomId === null &&
    currentRoomId === null &&
    messages.length === 0 &&
    !sending
  ) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        {/* Welcome content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-2xl bg-violet-600 flex items-center justify-center mb-6 shadow-xl">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
              <path d="M9 14h6" />
              <path d="M12 14v8" />
              <path d="M8 22h8" />
              <circle cx="9" cy="6" r="1" fill="white" />
              <circle cx="15" cy="6" r="1" fill="white" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Xin chào! Tôi là PingAI
          </h1>
          <p className="text-gray-500 text-center max-w-md mb-8 leading-relaxed">
            Tôi có thể giúp bạn trả lời câu hỏi, phân tích hình ảnh, và hỗ trợ
            nhiều tác vụ khác. Hãy bắt đầu cuộc trò chuyện!
          </p>

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-2 justify-center mb-8 max-w-lg">
            {[
              "Giải thích khái niệm AI đơn giản",
              "Phân tích hình ảnh cho tôi",
              "Giúp tôi viết email",
              "Tóm tắt nội dung",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSend(suggestion, [])}
                disabled={sending}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input at bottom */}
        <div className="px-4 pb-4 pt-2 max-w-3xl mx-auto w-full">
          <ChatInput onSend={handleSend} disabled={sending} />
          {sending && (
            <div className="flex justify-center mt-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
                <span className="ml-1">PingAI đang suy nghĩ...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- Active Chat Room ----
  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Messages */}
      <ScrollArea
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 px-4 py-2"
      >
        <div className="flex flex-col min-h-full">
          <div className="flex-1 invisible" />{" "}
          {/* Spacer to push content down */}
          {/* Loading older messages */}
          {loadingOlder && (
            <div className="flex justify-center py-3 shrink-0">
              <div className="ai-spinner" />
            </div>
          )}
          {/* Loading initial messages */}
          {loadingMessages && (
            <div className="flex flex-col items-center justify-center h-full">
              <div
                className="ai-spinner mb-3"
                style={{ width: 32, height: 32 }}
              />
              <p className="text-sm text-gray-400">Đang tải tin nhắn...</p>
            </div>
          )}
          {/* Messages list */}
          {!loadingMessages && (
            <div className="max-w-5xl mx-auto space-y-2 mt-auto w-full">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  animate={
                    idx >= messages.length - 2 && msg.id.startsWith("ai-")
                  }
                />
              ))}
            </div>
          )}
          {/* Typing indicator when sending */}
          {sending && (
            <div className="max-w-5xl mx-auto mt-4 w-full">
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0 shadow-md">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                    <path d="M9 14h6" />
                    <path d="M12 14v8" />
                    <path d="M8 22h8" />
                    <circle cx="9" cy="6" r="1" fill="white" />
                    <circle cx="15" cy="6" r="1" fill="white" />
                  </svg>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <ChatInput onSend={handleSend} disabled={sending} />
        </div>
      </div>
    </div>
  );
}
