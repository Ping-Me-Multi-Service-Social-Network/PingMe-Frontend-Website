import { useState, useEffect, useCallback } from "react";
import type {
  MessageResponse,
  HistoryMessageResponse,
} from "@/types/chat/message";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import { getHistoryMessagesApi } from "@/services/chat";
import { useAppSelector, useAppDispatch } from "@/features/hooks.ts";
import {
  setCurrentRoom,
  selectMessages,
} from "@/features/websocket/slices/chatSlice";
import { useTranslation } from "react-i18next";
import {
  addUniqueMessage,
  mergeUniqueMessages,
} from "../utils/addUniqueMessage";

interface UseMessagesReturn {
  messages: MessageResponse[];
  isLoadingMessages: boolean;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  handleLoadMore: (beforeMessageId?: string) => void;
  addMessage: (message: MessageResponse) => void;
  recallMessage: (messageId: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<MessageResponse[]>>;
}

export function useMessages(roomId: number): UseMessagesReturn {
  const dispatch = useAppDispatch();
  const reduxMessages = useAppSelector(selectMessages);
  const { t } = useTranslation("chat");

  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchMessages = useCallback(
    async (beforeMessageId?: string, size = 20, append = false) => {
      try {
        if (!append) setIsLoadingMessages(true);
        else setIsLoadingMore(true);

        const response = await getHistoryMessagesApi(
          roomId,
          beforeMessageId,
          size
        );

        const historyResponse: HistoryMessageResponse = response.data.data;
        const newMessages = historyResponse.messageResponses;

        if (append) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((msg) => msg.id));
            const uniqueNewMessages = newMessages.filter(
              (msg) => !existingIds.has(msg.id)
            );
            return [...uniqueNewMessages, ...prev];
          });
        } else {
          setMessages(newMessages);
        }

        setHasMoreMessages(historyResponse.hasMore);
      } catch (err) {
        toast.error(getErrorMessage(err, t("box.historyError")));
      } finally {
        setIsLoadingMessages(false);
        setIsLoadingMore(false);
      }
    },
    [roomId, t]
  );

  // Set current room in Redux
  useEffect(() => {
    dispatch(setCurrentRoom(roomId));
  }, [roomId, dispatch]);

  // Sync messages from Redux (WebSocket)
  useEffect(() => {
    if (reduxMessages.length > 0) {
      setMessages((prev) => mergeUniqueMessages(prev, reduxMessages));
    }
  }, [reduxMessages]);

  // Fetch initial messages when room changes
  useEffect(() => {
    if (roomId) {
      setMessages([]);
      setHasMoreMessages(true);
      fetchMessages(undefined, 20);
    }
  }, [roomId, fetchMessages]);

  const handleLoadMore = useCallback(
    (beforeMessageId?: string) => {
      fetchMessages(beforeMessageId, 20, true);
    },
    [fetchMessages]
  );

  const addMessage = useCallback((message: MessageResponse) => {
    setMessages((prev) => addUniqueMessage(prev, message));
  }, []);

  const recallMessage = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isActive: false } : msg
      )
    );
  }, []);

  return {
    messages,
    isLoadingMessages,
    isLoadingMore,
    hasMoreMessages,
    handleLoadMore,
    addMessage,
    recallMessage,
    setMessages,
  };
}
