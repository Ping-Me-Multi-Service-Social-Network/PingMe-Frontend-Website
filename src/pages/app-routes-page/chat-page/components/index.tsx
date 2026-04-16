import { useState, useCallback, useRef } from "react";
import type { MessageResponse } from "@/types/chat/message";
import type { RoomResponse } from "@/types/chat/room";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import {
  sendMessageApi,
  sendFileMessageApi,
  sendWeatherMessage,
  sendMultipleImageMessageApi,
  editMessageApi,
} from "@/services/chat";
import { useAppSelector } from "@/features/hooks.ts";
import { ChatBoxInput } from "./chat-box/ChatBoxInput.tsx";
import { ChatBoxContent } from "./chat-box/ChatBoxContent.tsx";
import ChatBoxHeader from "./chat-box/ChatBoxHeader.tsx";
import ConversationSidebar from "./conversation-sidebar";
import { useTranslation } from "react-i18next";
import { useMessages } from "../hooks/useMessages";
import { motion, AnimatePresence } from "framer-motion";
import { Upload } from "lucide-react";

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
    removeMessageLocally,
  } = useMessages(selectedChat.roomId);

  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounter = useRef(0);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [replyMessage, setReplyMessage] = useState<MessageResponse | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageResponse | null>(null);

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
        if (editingMessage) {
          const response = await editMessageApi(editingMessage.id, { content: msgText.trim() });
          // Note: local state update could be done here or handled via websocket.
          // Since the slice has messageUpdated via websocket, we could wait for it.
          // But doing optimistic update is better:
          addMessage(response.data.data as MessageResponse); // addMessage actually overwrites or adds in useMessages? Wait, we can let websocket handle it.
          setEditingMessage(null);
          return;
        }

        const messageData = {
          content: msgText.trim(),
          clientMsgId: crypto.randomUUID(),
          type: "TEXT" as const,
          roomId: selectedChat.roomId,
          repliedMessageId: replyMessage?.id || null,
        };

        const response = await sendMessageApi(messageData);
        const sentMessage = response.data.data as MessageResponse;
        addMessage(sentMessage);
        setReplyMessage(null);
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
        repliedMessageId: replyMessage?.id || null,
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
      setReplyMessage(null);
    } catch (err) {
      toast.error(getErrorMessage(err, t("box.sendFileError")));
    }
  };

  const handleSendMultipleImages = async (files: File[]) => {
    try {
      const formData = new FormData();
      const messageRequest = {
        content: "image",
        clientMsgId: crypto.randomUUID(),
        type: "IMAGE",
        roomId: selectedChat.roomId,
        repliedMessageId: replyMessage?.id || null,
      };

      formData.append(
        "message",
        new Blob([JSON.stringify(messageRequest)], {
          type: "application/json",
        })
      );
      
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await sendMultipleImageMessageApi(formData);
      const sentMessage = response.data.data as MessageResponse;
      addMessage(sentMessage);
      setReplyMessage(null);
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

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      if (e.dataTransfer.items[0].kind === 'file') {
        setIsDragActive(true);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setDroppedFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div 
      className="chat-box overflow-hidden relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white p-8 rounded-2xl flex flex-col items-center gap-4 text-purple-600 shadow-2xl scale-110">
              <Upload className="w-16 h-16 animate-bounce" />
              <p className="text-xl font-bold">{t("bubbles.file.dropToUpload", "Thả file vào đây để gửi")}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
            onDeleteForMeClick={removeMessageLocally}
            onReplyClick={(msg) => { setReplyMessage(msg); setEditingMessage(null); }}
            onEditClick={(msg) => { setEditingMessage(msg); setReplyMessage(null); }}
          />
        </div>

        <ChatBoxInput
          selectedChat={selectedChat}
          onSendMessage={handleSendMessage}
          onSendFile={handleSendFile}
          onSendMultipleImages={handleSendMultipleImages}
          onSendWeather={handleSendWeather}
          disabled={isLoadingMessages}
          droppedFiles={droppedFiles}
          onDroppedFilesProcessed={() => setDroppedFiles([])}
          replyMessage={replyMessage}
          onCancelReply={() => setReplyMessage(null)}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
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
