import { useState, useCallback, useEffect, useRef } from "react";
import type { GroupMessageSummaryResponse, MessageResponse } from "@/types/chat/message";
import type { RoomResponse } from "@/types/chat/room";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import {
  sendMessageApi,
  sendFileMessageApi,
  sendWeatherMessage,
  sendMultipleImageMessageApi,
  editMessageApi,
  createPollMessageApi,
  getGroupMessageSummaryApi,
} from "@/services/chat";
import { useAppSelector } from "@/features/hooks.ts";
import { ChatBoxInput } from "./chat-box/ChatBoxInput.tsx";
import { ChatBoxContent } from "./chat-box/ChatBoxContent.tsx";
import ChatBoxHeader from "./chat-box/ChatBoxHeader.tsx";
import ChatPinnedMessages from "./chat-box/ChatPinnedMessages.tsx";
import ConversationSidebar from "./conversation-sidebar";
import { useTranslation } from "react-i18next";
import { useMessages } from "../hooks/useMessages";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Upload, X } from "lucide-react";

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
  const [groupSummary, setGroupSummary] = useState<GroupMessageSummaryResponse | null>(null);
  const [groupSummaryRoomId, setGroupSummaryRoomId] = useState<number | null>(null);
  const [isLoadingGroupSummary, setIsLoadingGroupSummary] = useState(false);
  const [dismissedSummaryRoomId, setDismissedSummaryRoomId] = useState<number | null>(null);

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

  const handleCreatePoll = async (question: string, options: string[], allowMultiple: boolean) => {
    try {
      const pollRequest = {
        roomId: selectedChat.roomId,
        clientMsgId: crypto.randomUUID(),
        question,
        options,
        allowMultiple,
        repliedMessageId: replyMessage?.id || null,
      };

      const response = await createPollMessageApi(pollRequest);
      const sentMessage = response.data.data as MessageResponse;
      addMessage(sentMessage);
      setReplyMessage(null);
    } catch (err) {
      toast.error(getErrorMessage(err, t("box.createPollError", "Failed to create poll")));
      throw err; // Re-throw to handle in UI
    }
  };

  useEffect(() => {
    let active = true;

    if (selectedChat.roomType !== "GROUP") {
      return () => {
        active = false;
      };
    }

    queueMicrotask(() => {
      if (!active) return;
      setIsLoadingGroupSummary(true);
      setDismissedSummaryRoomId(null);
    });

    getGroupMessageSummaryApi(selectedChat.roomId)
      .then((response) => {
        if (!active) return;
        setGroupSummary(response.data?.data ?? null);
        setGroupSummaryRoomId(selectedChat.roomId);
      })
      .catch(() => {
        if (!active) return;
        setGroupSummary(null);
        setGroupSummaryRoomId(selectedChat.roomId);
      })
      .finally(() => {
        if (!active) return;
        setIsLoadingGroupSummary(false);
      });

    return () => {
      active = false;
    };
  }, [selectedChat.roomId, selectedChat.roomType]);

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
        animate={{ width: isSidebarOpen ? "calc(100% - 18rem)" : "100%" }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
      >
        <ChatBoxHeader
          selectedChat={selectedChat}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {selectedChat.roomType === "GROUP" &&
          groupSummaryRoomId === selectedChat.roomId &&
          dismissedSummaryRoomId !== selectedChat.roomId &&
          (isLoadingGroupSummary || groupSummary?.summary) && (
          <div className="mx-4 mt-3 mb-1 rounded-xl border border-fuchsia-200 bg-fuchsia-50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-fuchsia-700 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <p className="text-xs font-semibold flex-1">Tóm tắt AI (20 tin nhắn gần nhất)</p>
              <button
                type="button"
                onClick={() => setDismissedSummaryRoomId(selectedChat.roomId)}
                className="w-5 h-5 rounded-full bg-fuchsia-100 hover:bg-fuchsia-200 flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-fuchsia-700" />
              </button>
            </div>
            {isLoadingGroupSummary ? (
              <div className="flex items-center gap-2 text-zinc-500">
                <div className="w-3.5 h-3.5 border-2 border-fuchsia-300 border-t-fuchsia-600 rounded-full animate-spin" />
                <p className="text-xs">AI đang tóm tắt cuộc trò chuyện...</p>
              </div>
            ) : (
              <p className="text-[13px] leading-5 text-zinc-700 whitespace-pre-line">
                {groupSummary?.summary}
              </p>
            )}
          </div>
        )}
        
        <ChatPinnedMessages roomId={selectedChat.roomId} participants={selectedChat.participants} />

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
          onCreatePoll={handleCreatePoll}
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
            animate={{ width: "18rem", opacity: 1 }}
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
