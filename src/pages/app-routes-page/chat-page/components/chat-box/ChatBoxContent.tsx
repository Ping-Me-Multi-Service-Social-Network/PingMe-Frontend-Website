import type React from "react";
import { useState, useEffect, useRef, useLayoutEffect, memo } from "react";
import type { MessageResponse } from "@/types/chat/message";
import type { RoomResponse } from "@/types/chat/room";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import SentMessageBubble from "../message-bubbles/SentMessageBubble.tsx";
import ReceivedMessageBubble from "../message-bubbles/ReceivedMessageBubble.tsx";
import { getTheme } from "../../utils/chatThemes.ts";
import { useSelector } from "react-redux";
import { selectTypingUsers } from "@/features/websocket/slices/chatSlice";
import { selectUser } from "@/features/auth/authSlice";
import { useTranslation } from "react-i18next";

interface ChatBoxContentProps {
  selectedChat: RoomResponse;
  messages: MessageResponse[];
  isLoadingMessages: boolean;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  onLoadMore: (beforeId?: string) => void;
  isCurrentUserMessage: (senderId: number) => boolean;
}

export const ChatBoxContent = memo(({
  selectedChat,
  messages,
  isLoadingMessages,
  isLoadingMore,
  hasMoreMessages,
  onLoadMore,
  isCurrentUserMessage,
}: ChatBoxContentProps) => {
  const { t } = useTranslation("chat");
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [prevRoomId, setPrevRoomId] = useState(selectedChat.roomId);

  if (selectedChat.roomId !== prevRoomId) {
    setPrevRoomId(selectedChat.roomId);
    setShouldScrollToBottom(true);
  }

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const prevScrollHeightRef = useRef<number>(0);

  const theme = getTheme(selectedChat.theme);

  const currentUser = useSelector(selectUser);
  const typingUsers = useSelector(selectTypingUsers(selectedChat.roomId));

  const otherUsersTyping = typingUsers.filter((u) => {
    return u.userId !== currentUser?.id && u.isTyping;
  });

  useEffect(() => {
    if (messagesEndRef.current && shouldScrollToBottom && !isLoadingMore) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, shouldScrollToBottom, isLoadingMore]);


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
        title={t("messages.emptyTitle")}
        description={t("messages.emptyDesc")}
      />
    );
  }

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Background image layer */}
      {theme.backgroundImage && (
        <div
          className="absolute inset-0 opacity-40 z-0 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url(${theme.backgroundImage})`,
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Content layer */}
      <div
        ref={messagesContainerRef}
        className="chat-messages relative z-10 w-full"
        onScroll={handleScroll}
      >
        <div className="chat-messages__spacer" />
        {isLoadingMore && (
          <div className="flex justify-center py-2 shrink-0">
            <LoadingSpinner className="w-8 h-8 text-purple-600" />
          </div>
        )}
        <div className="chat-messages__list">
          {messages.map((message) => (
            <div key={message.id}>
              {message.type === "SYSTEM" ? (
                <div className="chat-system-msg">
                  <div className={`chat-system-msg__pill ${theme.content.systemMessageBg} ${theme.content.systemMessageText}`}>
                    {message.content}
                  </div>
                </div>
              ) : isCurrentUserMessage(message.senderId) ? (
                <SentMessageBubble
                  message={message}
                  theme={theme}
                />
              ) : (
                <ReceivedMessageBubble
                  message={message}
                  senderName={
                    selectedChat.participants.find(
                      (p) => p.userId === message.senderId,
                    )?.name || "Unknown"
                  }
                  senderAvatar={
                    selectedChat.participants.find(
                      (p) => p.userId === message.senderId,
                    )?.avatarUrl
                  }
                  roomType={selectedChat.roomType}
                  theme={theme}
                />
              )}
            </div>
          ))}
        </div>
        <div className="min-h-8 flex items-center pl-2">
          {otherUsersTyping.length > 0 && (
            <div className="chat-typing animate-in fade-in duration-200">
              <span className="chat-typing__text">
                {otherUsersTyping.length === 1
                  ? `${otherUsersTyping[0].name}`
                  : otherUsersTyping.length === 2
                    ? `${otherUsersTyping[0].name}, ${otherUsersTyping[1].name}`
                    : `${otherUsersTyping[0].name} ${t("messages.andOthers", {
                      count: otherUsersTyping.length - 1
                    })}`}
              </span>
              <div className="chat-typing__dots">
                <span className="chat-typing__dot" />
                <span className="chat-typing__dot" />
                <span className="chat-typing__dot" />
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});
