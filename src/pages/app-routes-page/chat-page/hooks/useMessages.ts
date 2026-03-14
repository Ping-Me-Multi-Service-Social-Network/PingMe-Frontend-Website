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
import { addUniqueMessage } from "../utils/addUniqueMessage";

interface UseMessagesReturn {
  messages: MessageResponse[];
  isLoadingMessages: boolean;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  handleLoadMore: (beforeMessageId?: string) => void;
  addMessage: (message: MessageResponse) => void;
}

export function useMessages(roomId: number): UseMessagesReturn {
  const dispatch = useAppDispatch();
  const reduxMessages = useAppSelector(selectMessages);
  const { t } = useTranslation("chat");

  // Local state for history messages (fetched via API)
  const [historyMessages, setHistoryMessages] = useState<MessageResponse[]>([]);
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
          setHistoryMessages((prev) => {
            const existingIds = new Set(prev.map((msg) => msg.id));
            const uniqueNewMessages = newMessages.filter(
              (msg) => !existingIds.has(msg.id)
            );
            return [...uniqueNewMessages, ...prev];
          });
        } else {
          setHistoryMessages(newMessages);
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

  // Fetch initial messages when room changes
  useEffect(() => {
    if (roomId) {
      setHistoryMessages([]);
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

  // Merge history messages + Redux real-time messages
  // History = loaded from API, Redux = from WebSocket
  const messages = (() => {
    if (reduxMessages.length === 0) return historyMessages;

    const historyIds = new Set(historyMessages.map((m) => m.id));
    const historyClientIds = new Set(
      historyMessages.map((m) => m.clientMsgId).filter(Boolean)
    );

    // Get new messages from Redux that are not in history
    const newFromRedux = reduxMessages.filter(
      (m) => !historyIds.has(m.id) && !historyClientIds.has(m.clientMsgId)
    );

    // Apply recall status from Redux to history messages
    const recalledIds = new Set(
      reduxMessages.filter((m) => !m.isActive).map((m) => m.id)
    );
    const updatedHistory = historyMessages.map((m) =>
      recalledIds.has(m.id) ? { ...m, isActive: false } : m
    );

    return [...updatedHistory, ...newFromRedux];
  })();

  /**
   * Optimistic add for sent messages (API response).
   * Messages also arrive via WebSocket → Redux, so dedup is applied.
   */
  const addMessage = useCallback((message: MessageResponse) => {
    setHistoryMessages((prev) => addUniqueMessage(prev, message));
  }, []);

  return {
    messages,
    isLoadingMessages,
    isLoadingMore,
    hasMoreMessages,
    handleLoadMore,
    addMessage,
  };
}
