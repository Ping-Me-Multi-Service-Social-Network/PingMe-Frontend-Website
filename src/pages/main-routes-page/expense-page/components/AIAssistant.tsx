import type React from "react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatWithAI, getAIChatHistory } from "@/services/transaction";
import type { AIChatHistoryResponse } from "@/types/transaction";
import LoadingSpinner from "@/components/custom/LoadingSpinner";

const MESSAGES_PER_PAGE = 20;

export default function AIAssistant() {
  const [messages, setMessages] = useState<AIChatHistoryResponse[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory(0);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current && shouldScrollToBottom && !isLoadingMore) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, shouldScrollToBottom, isLoadingMore]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = container;

    if (scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
      const currentScrollHeight = container.scrollHeight;
      const currentScrollTop = container.scrollTop;

      setShouldScrollToBottom(false);
      loadChatHistory(currentPage + 1);

      setTimeout(() => {
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          const heightDifference = newScrollHeight - currentScrollHeight;
          container.scrollTop = currentScrollTop + heightDifference;
        });
      }, 100);
    }

    if (scrollHeight - scrollTop - clientHeight < 50) {
      setShouldScrollToBottom(true);
    } else {
      setShouldScrollToBottom(false);
    }
  };

  const loadChatHistory = async (page: number) => {
    if (page === 0) setHistoryLoading(true);
    else setIsLoadingMore(true);

    try {
      const response = await getAIChatHistory(page, MESSAGES_PER_PAGE);
      if (response.data.data?.content) {
        const newMessages = response.data.data.content.reverse();

        if (page === 0) setMessages(newMessages);
        else setMessages((prev) => [...newMessages, ...prev]);

        setHasMoreMessages(newMessages.length === MESSAGES_PER_PAGE);
        setCurrentPage(page);
      }
    } catch (error) {
      toast.error("Lỗi khi tải lịch sử chat");
      console.error(error);
    } finally {
      setHistoryLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setShouldScrollToBottom(true);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "USER",
        content: userMessage,
        createdAt: new Date().toISOString(),
      },
    ]);

    setLoading(true);
    try {
      const response = await chatWithAI({ prompt: userMessage });
      if (response.data.data?.answer) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "AI",
            content: response.data.data.answer,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      toast.error("Lỗi khi gửi tin nhắn");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="shrink-0">
        <CardTitle>AI Trợ Lý Chi Tiêu</CardTitle>
        <CardDescription>Nhắn tin với AI để quản lý chi tiêu</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col gap-4">
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 border rounded-lg p-4 overflow-y-auto space-y-4 relative"
        >
          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <LoadingSpinner className="w-6 h-6 text-primary" />
            </div>
          )}

          {historyLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner className="w-8 h-8 text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground pt-4">
              Bắt đầu cuộc trò chuyện với AI
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "USER" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === "USER"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  <span className="text-xs opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString("vi-VN")}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="sticky bottom-0 bg-background pt-2">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder="Nhắn gì đó..."
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
            >
              Gửi
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
