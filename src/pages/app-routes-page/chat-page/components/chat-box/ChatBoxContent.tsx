import type React from "react";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import type { MessageResponse } from "@/types/chat/message";
import type { RoomResponse } from "@/types/chat/room";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import SentMessageBubble from "../message-bubbles/SentMessageBubble.tsx";
import ReceivedMessageBubble from "../message-bubbles/ReceivedMessageBubble.tsx";
import { getTheme } from "../../utils/chatThemes.ts";
import { useSelector } from "react-redux";
import { selectTypingUsers } from "@/features/slices/chatSlice";
import { selectUser } from "@/features/slices/authSlice";

interface ChatBoxContentProps {
  selectedChat: RoomResponse;
  messages: MessageResponse[];
  isLoadingMessages: boolean;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  onLoadMore: (beforeId?: string) => void;
  isCurrentUserMessage: (senderId: number) => boolean;
  onMessageRecalled: (messageId: string) => void;
}

export const ChatBoxContent = ({
  selectedChat,
  messages,
  isLoadingMessages,
  isLoadingMore,
  hasMoreMessages,
  onLoadMore,
  isCurrentUserMessage,
  onMessageRecalled,
}: ChatBoxContentProps) => {
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const prevScrollHeightRef = useRef<number>(0);

  const theme = getTheme(selectedChat.theme);

  const currentUser = useSelector(selectUser);
  const typingUsers = useSelector(selectTypingUsers(selectedChat.roomId));

  console.log("[v0] Current user:", currentUser);
  console.log("[v0] All typing users:", typingUsers);

  const otherUsersTyping = typingUsers.filter((u) => {
    const isNotCurrentUser = u.userId !== currentUser?.id;
    const isTyping = u.isTyping;
    console.log("[v0] Typing user check:", {
      userId: u.userId,
      currentUserId: currentUser?.id,
      isNotCurrentUser,
      isTyping,
    });
    return isNotCurrentUser && isTyping;
  });

  console.log("[v0] Other users typing:", otherUsersTyping);

  useEffect(() => {
    if (messagesEndRef.current && shouldScrollToBottom && !isLoadingMore) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, shouldScrollToBottom, isLoadingMore]);

  useEffect(() => {
    setShouldScrollToBottom(true);
  }, [selectedChat.roomId]);

  useLayoutEffect(() => {
    if (messagesContainerRef.current && prevScrollHeightRef.current > 0) {
      const container = messagesContainerRef.current;
      const newScrollHeight = container.scrollHeight;

      const heightDifference = newScrollHeight - prevScrollHeightRef.current;

      if (heightDifference > 0) {
        container.scrollTop = heightDifference;
      }

      prevScrollHeightRef.current = 0;
    }
  }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;

    if (scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
      setShouldScrollToBottom(false);

      if (messagesContainerRef.current) {
        prevScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
      }

      const beforeId = messages.length > 0 ? messages[0].id : undefined;
      onLoadMore(beforeId);
    }
  };

  if (isLoadingMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner className="w-12 h-12 text-purple-600" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        title="Chưa có tin nhắn"
        description="Hãy bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên!"
      />
    );
  }

  return (
    <div className="relative h-full overflow-hidden">
      {/* Background image layer */}
      {theme.backgroundImage && (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${theme.backgroundImage})`,
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Content layer */}
      <div
        ref={messagesContainerRef}
        className="relative z-10 h-full overflow-y-auto px-4 space-y-4"
        onScroll={handleScroll}
      >
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <LoadingSpinner className="w-8 h-8 text-purple-600" />
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id}>
            {message.type === "SYSTEM" ? (
              <div className="flex justify-center my-2">
                <div
                  className={`px-3 py-1 ${theme.content.systemMessageBg} ${theme.content.systemMessageText} text-sm rounded-full`}
                >
                  {message.content}
                </div>
              </div>
            ) : isCurrentUserMessage(message.senderId) ? (
              <SentMessageBubble
                message={message}
                onMessageRecalled={onMessageRecalled}
                theme={theme}
              />
            ) : (
              <ReceivedMessageBubble
                message={message}
                senderName={
                  selectedChat.participants.find(
                    (p) => p.userId === message.senderId
                  )?.name || "Unknown"
                }
                senderAvatar={
                  selectedChat.participants.find(
                    (p) => p.userId === message.senderId
                  )?.avatarUrl
                }
                roomType={selectedChat.roomType}
                theme={theme}
              />
            )}
          </div>
        ))}

        <div className="min-h-8 flex items-center pl-2">
          {otherUsersTyping.length > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full animate-in fade-in duration-200">
              <span className="text-sm text-muted-foreground italic">
                {otherUsersTyping.length === 1
                  ? `${otherUsersTyping[0].name}`
                  : otherUsersTyping.length === 2
                  ? `${otherUsersTyping[0].name}, ${otherUsersTyping[1].name}`
                  : `${otherUsersTyping[0].name} và ${
                      otherUsersTyping.length - 1
                    } người khác`}
              </span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
