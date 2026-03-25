import { useState, useCallback } from "react";
import type { MessageResponse } from "@/types/chat/message";
import type { RoomResponse } from "@/types/chat/room";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import {
  sendMessageApi,
  sendFileMessageApi,
  sendWeatherMessage,
} from "@/services/chat";
import { useAppSelector } from "@/features/hooks.ts";
import { ChatBoxInput } from "./chat-box/ChatBoxInput.tsx";
import { ChatBoxContent } from "./chat-box/ChatBoxContent.tsx";
import ChatBoxHeader from "./chat-box/ChatBoxHeader.tsx";
import ConversationSidebar from "./conversation-sidebar";
import { useTranslation } from "react-i18next";
import { useMessages } from "../hooks/useMessages";
import { motion, AnimatePresence } from "framer-motion";

interface ChatBoxProps {
  selectedChat: RoomResponse;
}

export function ChatBox({ selectedChat }: ChatBoxProps) {
  const { userSession } = useAppSelector((state) => state.auth);
  const { t } = useTranslation("chat");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const {
    messages,
    isLoadingMessages,
    isLoadingMore,
    hasMoreMessages,
    handleLoadMore,
    addMessage,
  } = useMessages(selectedChat.roomId);

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

  // ---- Send Handlers ----

  const handleSendMessage = async (msgText: string) => {
    if (msgText.trim()) {
      try {
        const messageData = {
          content: msgText.trim(),
          clientMsgId: crypto.randomUUID(),
          type: "TEXT" as const,
          roomId: selectedChat.roomId,
        };

        const response = await sendMessageApi(messageData);
        const sentMessage = response.data.data as MessageResponse;
        addMessage(sentMessage);
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
      const sentMessage = response.data.data as MessageResponse;
      addMessage(sentMessage);
    } catch (err) {
      toast.error(getErrorMessage(err, t("box.sendFileError")));
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
      const sentMessage = response.data.data as MessageResponse;
      addMessage(sentMessage);
    } catch (err) {
      toast.error(getErrorMessage(err, t("box.sendWeatherError")));
    }
  };

  return (
    <div className="chat-box overflow-hidden">
      <motion.div 
        layout
        className="chat-box__main shrink-0 w-full min-h-0"
        animate={{ width: isSidebarOpen ? "calc(100% - 20rem)" : "100%" }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
      >
        <ChatBoxHeader
          selectedChat={selectedChat}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
          <ChatBoxContent
            selectedChat={selectedChat}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            isLoadingMore={isLoadingMore}
            hasMoreMessages={hasMoreMessages}
            onLoadMore={handleLoadMore}
            isCurrentUserMessage={isCurrentUserMessage}
          />
        </div>

        <ChatBoxInput
          selectedChat={selectedChat}
          onSendMessage={handleSendMessage}
          onSendFile={handleSendFile}
          onSendWeather={handleSendWeather}
          disabled={isLoadingMessages}
        />
      </motion.div>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "20rem", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="h-full border-l shrink-0 flex flex-col overflow-hidden"
          >
            <ConversationSidebar
              selectedChat={selectedChat}
              isOpen={true}
              onClose={() => setIsSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
