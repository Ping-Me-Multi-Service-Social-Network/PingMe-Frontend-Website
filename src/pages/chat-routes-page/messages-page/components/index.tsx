import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import type {
  MessageResponse,
  HistoryMessageResponse,
} from "@/types/chat/message";
import type { RoomResponse } from "@/types/chat/room";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import {
  getHistoryMessagesApi,
  sendMessageApi,
  sendFileMessageApi,
  sendWeatherMessage,
} from "@/services/chat";
import { useAppSelector } from "@/features/hooks.ts";
import { ChatBoxInput } from "./chat-box/ChatBoxInput.tsx";
import { ChatBoxContent } from "./chat-box/ChatBoxContent.tsx";
import ChatBoxHeader from "./chat-box/ChatBoxHeader.tsx";
import ConversationSidebar from "./conversation-sidebar";

interface ChatBoxProps {
  selectedChat: RoomResponse;
}

export interface ChatBoxRef {
  handleIncomingMessage: (message: MessageResponse) => void;
  handleRecallMessage: (messageId: number) => void;
}

export const ChatBox = forwardRef<ChatBoxRef, ChatBoxProps>(
  ({ selectedChat }, ref) => {
    const { userSession } = useAppSelector((state) => state.auth);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const isCurrentUserMessage = useCallback(
      (senderId: number) => {
        if (!userSession) return false;
        const senderParticipant = selectedChat.participants.find(
          (p) => p.userId === senderId
        );
        return senderParticipant?.name === userSession.name;
      },
      [selectedChat.participants, userSession]
    );

    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState<MessageResponse[]>([]);

    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const fetchMessages = useCallback(
      async (beforeMessageId?: number, size = 20, append = false) => {
        try {
          if (!append) setIsLoadingMessages(true);
          else setIsLoadingMore(true);

          const response = await getHistoryMessagesApi(
            selectedChat.roomId,
            beforeMessageId,
            size
          );

          const historyResponse: HistoryMessageResponse = response.data.data;
          const newMessages = historyResponse.messageResponses;
          const hasMore = historyResponse.hasMore;

          const sortedMessages = newMessages.sort((a, b) => a.id - b.id);

          if (append) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((msg) => msg.id));
              const uniqueNewMessages = sortedMessages.filter(
                (msg) => !existingIds.has(msg.id)
              );
              // Chỉ thêm messages mới vào đầu (load more = messages cũ hơn)
              return [...uniqueNewMessages, ...prev];
            });
          } else {
            setMessages(sortedMessages);
          }

          setHasMoreMessages(hasMore);
        } catch (err) {
          toast.error(getErrorMessage(err, "Không thể lấy lịch sử tin nhắn"));
        } finally {
          setIsLoadingMessages(false);
          setIsLoadingMore(false);
        }
      },
      [selectedChat.roomId]
    );

    useEffect(() => {
      if (selectedChat.roomId) {
        setMessages([]);
        setHasMoreMessages(true);
        fetchMessages(undefined, 20);
      }
    }, [selectedChat.roomId, fetchMessages]);

    const handleLoadMore = useCallback(
      (beforeMessageId?: number) => {
        fetchMessages(beforeMessageId, 20, true);
      },
      [fetchMessages]
    );

    const handleSendMessage = async () => {
      if (newMessage.trim()) {
        try {
          const messageData = {
            content: newMessage.trim(),
            clientMsgId: crypto.randomUUID(),
            type: "TEXT" as const,
            roomId: selectedChat.roomId,
          };

          const response = await sendMessageApi(messageData);
          const sentMessage = response.data.data;

          setMessages((prev) => [...prev, sentMessage]);
          setNewMessage("");
        } catch (err) {
          toast.error(getErrorMessage(err));
        }
      }
    };

    const handleSendFile = async (
      file: File,
      type: "IMAGE" | "VIDEO" | "FILE"
    ) => {
      try {
        const formData = new FormData();

        const messageRequest = {
          content: type.toLowerCase(),
          clientMsgId: crypto.randomUUID(),
          type: type,
          roomId: selectedChat.roomId,
        };

        formData.append(
          "message",
          new Blob([JSON.stringify(messageRequest)], {
            type: "application/json",
          })
        );
        formData.append("file", file);

        const response = await sendFileMessageApi(formData);
        const sentMessage = response.data.data;

        setMessages((prev) => [...prev, sentMessage]);
      } catch (err) {
        toast.error(getErrorMessage(err, "Không thể gửi file"));
      }
    };

    const handleSendWeather = async (latitude: number, longitude: number) => {
      try {
        const weatherRequest = {
          roomId: selectedChat.roomId,
          lat: latitude,
          lon: longitude,
          clientMsgId: crypto.randomUUID(),
        };

        const response = await sendWeatherMessage(weatherRequest);
        const sentMessage = response.data.data;

        setMessages((prev) => [...prev, sentMessage]);
      } catch (err) {
        toast.error(getErrorMessage(err, "Không thể gửi thông tin thời tiết"));
      }
    };

    const handleIncomingMessage = useCallback(
      (message: MessageResponse) => {
        if (message.roomId !== selectedChat.roomId) {
          console.warn(
            "[ChatBox] Phòng tin nhắn không hợp lệ:",
            message.roomId,
            "vs",
            selectedChat.roomId
          );
          return;
        }

        if (message.type !== "SYSTEM") {
          const senderExists = selectedChat.participants.some(
            (p) => p.userId === message.senderId
          );
          if (!senderExists) {
            console.warn(
              "[ChatBox] Người gửi tin nhắn không tồn tại trong phòng này:",
              message.senderId
            );
            return;
          }

          if (userSession && isCurrentUserMessage(message.senderId)) return;
        }
        // SYSTEM messages bỏ qua tất cả các check trên

        setMessages((prev) => {
          const existingIds = new Set(prev.map((msg) => msg.id));
          const existingClientIds = new Set(prev.map((msg) => msg.clientMsgId));

          if (
            existingIds.has(message.id) ||
            existingClientIds.has(message.clientMsgId)
          ) {
            return prev;
          }

          return [...prev, message];
        });
      },
      [
        isCurrentUserMessage,
        selectedChat.participants,
        selectedChat.roomId,
        userSession,
      ]
    );

    const handleRecallMessage = useCallback((messageId: number) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isActive: false } : msg
        )
      );
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        handleIncomingMessage,
        handleRecallMessage,
      }),
      [handleIncomingMessage, handleRecallMessage]
    );

    return (
      <div className="flex-1 flex bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex-1 flex flex-col">
          <ChatBoxHeader
            selectedChat={selectedChat}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          <div className="flex-1 overflow-hidden relative">
            <ChatBoxContent
              selectedChat={selectedChat}
              messages={messages}
              isLoadingMessages={isLoadingMessages}
              isLoadingMore={isLoadingMore}
              hasMoreMessages={hasMoreMessages}
              onLoadMore={handleLoadMore}
              isCurrentUserMessage={isCurrentUserMessage}
              onMessageRecalled={handleRecallMessage}
            />
          </div>

          <ChatBoxInput
            selectedChat={selectedChat}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={handleSendMessage}
            onSendFile={handleSendFile}
            onSendWeather={handleSendWeather}
            disabled={isLoadingMessages}
          />
        </div>
        <ConversationSidebar
          selectedChat={selectedChat}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
    );
  }
);

ChatBox.displayName = "ChatBox";
