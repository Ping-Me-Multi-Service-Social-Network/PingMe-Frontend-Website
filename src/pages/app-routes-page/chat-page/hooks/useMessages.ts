import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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

function upsertMessageByClientMsgId(
  prev: MessageResponse[],
  nextMessage: MessageResponse,
): MessageResponse[] {
  nextMessage = normalizeMessageContent(nextMessage);

  if (!nextMessage.clientMsgId) {
    return addUniqueMessage(prev, nextMessage);
  }

  const hasClientMatch = prev.some((m) => m.clientMsgId === nextMessage.clientMsgId);
  if (!hasClientMatch) {
    return addUniqueMessage(prev, nextMessage);
  }

  return prev.map((m) =>
    m.clientMsgId === nextMessage.clientMsgId
      ? { ...nextMessage, localStatus: undefined, localError: null }
      : m,
  );
}

function normalizeMessageContent(message: MessageResponse): MessageResponse {
  return {
    ...message,
    content: message.content ?? "",
    repliedMessage: message.repliedMessage
      ? {
          ...message.repliedMessage,
          content: message.repliedMessage.content ?? "",
        }
      : message.repliedMessage,
  };
}

interface UseMessagesReturn {
  messages: MessageResponse[];
  isLoadingMessages: boolean;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  handleLoadMore: (beforeMessageId?: string) => void;
  addMessage: (message: MessageResponse) => void;
  patchMessageByClientMsgId: (
    clientMsgId: string,
    patch: Partial<MessageResponse>
  ) => void;
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

  const roomRef = useRef(room);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

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
        setLiveMessages(decrypted.map(normalizeMessageContent));
      }
    });

    return () => {
      active = false;
    };
  }, [reduxMessages, room, roomCryptoMaterial]);

  useEffect(() => {
    let active = true;

    const toDecryptedEditedEntry = async (
      id: string,
      patch: Partial<MessageResponse>,
    ) => {
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
        roomRef.current,
      );

      return [id, { ...patch, content: decrypted.content }] as const;
    };

    const decryptEditedMessages = async () => {
      const entries = await Promise.all(
        Object.entries(editedMessages).map(([id, patch]) =>
          toDecryptedEditedEntry(id, patch),
        ),
      );

      if (active) {
        setDecryptedEditedMessages(Object.fromEntries(entries));
      }
    };

    decryptEditedMessages();

    return () => {
      active = false;
    };
  }, [editedMessages, roomCryptoMaterial, roomId]);

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
        const decryptedMessages = await decryptTextMessagesForRoom(
          historyResponse.messageResponses,
          roomRef.current,
        );
        const newMessages = decryptedMessages.map(normalizeMessageContent);

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

  useEffect(() => {
    dispatch(setCurrentRoom(roomId));
  }, [roomId, dispatch]);

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

    const newFromRedux = liveMessages.filter(
      (m) => !historyIds.has(m.id) && !historyClientIds.has(m.clientMsgId)
    );

    const merged = [...updatedHistory, ...newFromRedux];
    merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return merged;
  }, [historyMessages, liveMessages, recalledMessageIds, decryptedEditedMessages]);

  const addToHistoryIfSameRoom = useCallback(
    (nextMessage: MessageResponse) => {
      setHistoryMessages((prev) => {
        if (nextMessage.roomId !== roomId) return prev;
        return upsertMessageByClientMsgId(prev, nextMessage);
      });
    },
    [roomId],
  );

  const addMessage = useCallback((message: MessageResponse) => {
    decryptTextMessageForRoom(message, roomRef.current)
      .then(addToHistoryIfSameRoom)
      .catch(() => addToHistoryIfSameRoom(message));
  }, [addToHistoryIfSameRoom]);

  const patchMessageByClientMsgId = useCallback(
    (clientMsgId: string, patch: Partial<MessageResponse>) => {
      setHistoryMessages((prev) =>
        prev.map((m) => (m.clientMsgId === clientMsgId ? { ...m, ...patch } : m))
      );
    },
    []
  );

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
    patchMessageByClientMsgId,
    removeMessageLocally,
  };
}
