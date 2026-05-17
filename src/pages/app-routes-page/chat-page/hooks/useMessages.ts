import { useState, useEffect, useCallback, useMemo } from "react";
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
  selectRecalledMessageIds,
  selectEditedMessages,
  messageDeletedLocal,
} from "@/features/websocket/chat";
import { useTranslation } from "react-i18next";
import { addUniqueMessage } from "../utils/addUniqueMessage";
import type { RoomResponse } from "@/types/chat/room";
import {
  decryptTextMessageForRoom,
  decryptTextMessagesForRoom,
  getRoomTextEncryptionMaterial,
} from "../utils/textMessageCrypto";


interface UseMessagesReturn {
  messages: MessageResponse[];
  isLoadingMessages: boolean;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  handleLoadMore: (beforeMessageId?: string) => void;
  addMessage: (message: MessageResponse) => void;
  removeMessageLocally: (messageId: string) => void;
}

export function useMessages(room: RoomResponse): UseMessagesReturn {
  const roomId = room.roomId;
  const roomCryptoMaterial = useMemo(() => getRoomTextEncryptionMaterial(room), [room]);
  const dispatch = useAppDispatch();
  const reduxMessages = useAppSelector(selectMessages);
  const recalledMessageIds = useAppSelector(selectRecalledMessageIds);
  const editedMessages = useAppSelector(selectEditedMessages);
  const { t } = useTranslation("chat");

  // Local state for history messages (fetched via API)
  const [historyMessages, setHistoryMessages] = useState<MessageResponse[]>([]);
  const [liveMessages, setLiveMessages] = useState<MessageResponse[]>([]);
  const [decryptedEditedMessages, setDecryptedEditedMessages] = useState<
    Record<string, Partial<MessageResponse>>
  >({});
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    let active = true;

    decryptTextMessagesForRoom(reduxMessages, room).then((decrypted) => {
      if (active) {
        setLiveMessages(decrypted);
      }
    });

    return () => {
      active = false;
    };
  }, [reduxMessages, room, roomCryptoMaterial]);

  useEffect(() => {
    let active = true;

    const decryptEditedMessages = async () => {
      const entries = await Promise.all(
        Object.entries(editedMessages).map(async ([id, patch]) => {
          if (!patch.content) {
            return [id, patch] as const;
          }

          const decrypted = await decryptTextMessageForRoom(
            {
              id,
              roomId,
              clientMsgId: "",
              senderId: 0,
              content: patch.content,
              type: "TEXT",
              createdAt: "",
              isActive: true,
            },
            room,
          );

          return [id, { ...patch, content: decrypted.content }] as const;
        }),
      );

      if (active) {
        setDecryptedEditedMessages(Object.fromEntries(entries));
      }
    };

    decryptEditedMessages();

    return () => {
      active = false;
    };
  }, [editedMessages, room, roomCryptoMaterial, roomId]);

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
        const newMessages = await decryptTextMessagesForRoom(
          historyResponse.messageResponses,
          room,
        );

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
    [roomId, room, roomCryptoMaterial, t]
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
  const messages = useMemo(() => {
    const recalledIds = new Set(recalledMessageIds);
    const updatedHistory = historyMessages.map((m) => {
      let updated = m;
      if (decryptedEditedMessages[m.id]) {
        updated = { ...updated, ...decryptedEditedMessages[m.id] };
      }
      return recalledIds.has(m.id) ? { ...updated, isActive: false } : updated;
    });

    if (liveMessages.length === 0) return updatedHistory;

    const historyIds = new Set(historyMessages.map((m) => m.id));
    const historyClientIds = new Set(
      historyMessages.map((m) => m.clientMsgId).filter(Boolean)
    );

    // Get new messages from Redux that are not in history
    const newFromRedux = liveMessages.filter(
      (m) => !historyIds.has(m.id) && !historyClientIds.has(m.clientMsgId)
    );

    // Merge and sort by createdAt to maintain correct chronological order.
    // Without sorting, optimistically-added messages (via addMessage → historyMessages)
    // can appear before WebSocket-only messages (in Redux), causing bubbles to jump.
    const merged = [...updatedHistory, ...newFromRedux];
    merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return merged;
  }, [historyMessages, liveMessages, recalledMessageIds, decryptedEditedMessages]);

  /**
   * Optimistic add for sent messages (API response).
   * Messages also arrive via WebSocket → Redux, so dedup is applied.
   */
  const addMessage = useCallback((message: MessageResponse) => {
    decryptTextMessageForRoom(message, room).then((decrypted) => {
      setHistoryMessages((prev) => {
        if (decrypted.roomId !== roomId) return prev;
        return addUniqueMessage(prev, decrypted);
      });
    });
  }, [room, roomCryptoMaterial, roomId]);

  const removeMessageLocally = useCallback((messageId: string) => {
    setHistoryMessages((prev) => prev.filter((m) => m.id !== messageId));
    dispatch(messageDeletedLocal(messageId));
  }, [dispatch]);

  return {
    messages,
    isLoadingMessages,
    isLoadingMore,
    hasMoreMessages,
    handleLoadMore,
    addMessage,
    removeMessageLocally,
  };
}
