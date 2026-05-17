import { useCallback, useEffect } from "react";
import { useAppDispatch } from "@/features/hooks";
import { SocketManager } from "../core/socketManager";
import type {
  MessageCreatedEventPayload,
  MessageUpdatedEventPayload,
  RoomUpdatedEventPayload,

  RoomCreatedEventPayload,
  RoomMemberAddedEventPayload,
  RoomMemberRemovedEventPayload,
  RoomMemberRoleChangedEventPayload,
  RoomDeletedEventPayload,
} from "../events/chatEvents";
import { messageCreated } from "../state/chatSlice";
import type { RoomResponse } from "@/types/chat/room";
import type { CurrentUserSessionResponse } from "@/types/authentication";
import {
  ENCRYPTED_TEXT_PREVIEW,
  isEncryptedTextContent,
} from "@/pages/app-routes-page/chat-page/utils/textMessageCrypto";

interface UseChatSocketHandlerProps {
  setRooms: React.Dispatch<React.SetStateAction<RoomResponse[]>>;
  setSelectedChat: React.Dispatch<React.SetStateAction<RoomResponse | null>>;
  selectedChat: RoomResponse | null;
  selectedRoomIdRef: React.MutableRefObject<number | null>;
  userSession: CurrentUserSessionResponse | null;
}

export const useChatSocketHandler = ({
  setRooms,
  setSelectedChat,
  selectedChat,
  selectedRoomIdRef,
  userSession,
}: UseChatSocketHandlerProps) => {
  const dispatch = useAppDispatch();

  // --- Room Entrance/Exit Logic ---
  useEffect(() => {
    if (!selectedChat) {
      selectedRoomIdRef.current = null;
      SocketManager.leaveRoom();
      return;
    }

    selectedRoomIdRef.current = selectedChat.roomId;
    SocketManager.enterRoom(selectedChat.roomId);

    return () => {
      SocketManager.leaveRoom();
    };
  }, [selectedChat, selectedRoomIdRef]);

  // --- Helpers ---
  const upsertRoom = useCallback(
    (incoming: RoomResponse) => {
      setRooms((prev) => {
        const idx = prev.findIndex((r) => r.roomId === incoming.roomId);

        if (idx === -1) {
          return [incoming, ...prev];
        }

        const merged = { ...prev[idx], ...incoming };
        const filtered = prev.filter((r) => r.roomId !== incoming.roomId);
        return [merged, ...filtered];
      });

      setSelectedChat((prev) => {
        if (prev && prev.roomId === incoming.roomId) {
          return { ...prev, ...incoming };
        }
        return prev;
      });
    },
    [setRooms, setSelectedChat]
  );

  /**
   * Dispatch a system message into Redux so the ChatBox picks it up reactively.
   */
  const dispatchSystemMessage = useCallback(
    (systemMessage: import("@/types/chat/message").MessageResponse | undefined, roomId: number) => {
      if (systemMessage && selectedRoomIdRef.current === roomId) {
        dispatch(
          messageCreated({
            chatEventType: "MESSAGE_CREATED",
            messageResponse: systemMessage,
          })
        );
      }
    },
    [dispatch, selectedRoomIdRef]
  );

  // --- Handlers ---
  const handleNewMessage = useCallback(
    (event: MessageCreatedEventPayload) => {
      const message = event.messageResponse;

      // Update room list (move room to top, update lastMessage)
      setRooms((prev) => {
        const targetRoom = prev.find((r) => r.roomId === message.roomId);
        if (!targetRoom) return prev;
        const preview =
          message.type === "TEXT" && isEncryptedTextContent(message.content)
            ? ENCRYPTED_TEXT_PREVIEW
            : message.content;

        const updatedRoom = {
          ...targetRoom,
          lastMessage: {
            messageId: message.id,
            senderId: message.senderId,
            preview,
            messageType: message.type === "SYSTEM" ? "TEXT" : message.type,
            createdAt: message.createdAt,
          },
        };
        const otherRooms = prev.filter((r) => r.roomId !== message.roomId);
        return [updatedRoom, ...otherRooms];
      });

      // Message is already added to Redux state.messages by chatSlice.messageCreated reducer
      // ChatBox picks it up via selectMessages → useMessages hook
    },
    [setRooms]
  );

  const handleMessageUpdated = useCallback(
    (event: MessageUpdatedEventPayload) => {
      const message = event.messageResponse;
      setRooms((prev) => {
        const targetRoom = prev.find((r) => r.roomId === message.roomId);
        if (!targetRoom) return prev;

        if (targetRoom.lastMessage?.messageId === message.id) {
          const preview =
            message.type === "TEXT" && isEncryptedTextContent(message.content)
              ? ENCRYPTED_TEXT_PREVIEW
              : message.content;
          const updatedRoom = {
            ...targetRoom,
            lastMessage: {
              ...targetRoom.lastMessage,
              preview,
            },
          };
          const otherRooms = prev.filter((r) => r.roomId !== message.roomId);
          return [updatedRoom, ...otherRooms];
        }
        return prev;
      });
    },
    [setRooms]
  );

  const handleRoomUpdated = useCallback(
    (event: RoomUpdatedEventPayload) => {
      upsertRoom(event.roomResponse);
      dispatchSystemMessage(event.systemMessage, event.roomResponse.roomId);
    },
    [upsertRoom, dispatchSystemMessage]
  );

  const handleRecallMessage = useCallback(
    () => {
      // Recall is handled reactively by chatSlice.messageRecalled reducer
      // (sets isActive: false) → ChatBox picks it up via selectMessages
    },
    []
  );

  const handleRoomCreated = useCallback(
    (event: RoomCreatedEventPayload) => {
      upsertRoom(event.roomResponse);
    },
    [upsertRoom]
  );

  const handleMemberAdded = useCallback(
    (event: RoomMemberAddedEventPayload) => {
      upsertRoom(event.roomResponse);
      dispatchSystemMessage(event.systemMessage, event.roomResponse.roomId);
    },
    [upsertRoom, dispatchSystemMessage]
  );

  const handleMemberRemoved = useCallback(
    (event: RoomMemberRemovedEventPayload) => {
      const isCurrentUserRemoved = event.targetUserId === userSession?.id;

      if (isCurrentUserRemoved) {
        setRooms((prev) =>
          prev.filter((r) => r.roomId !== event.roomResponse.roomId)
        );
        setSelectedChat((prev) =>
          prev?.roomId === event.roomResponse.roomId ? null : prev
        );
      } else {
        upsertRoom(event.roomResponse);
        dispatchSystemMessage(event.systemMessage, event.roomResponse.roomId);
      }
    },
    [upsertRoom, userSession?.id, setRooms, setSelectedChat, dispatchSystemMessage]
  );

  const handleMemberRoleChanged = useCallback(
    (event: RoomMemberRoleChangedEventPayload) => {
      upsertRoom(event.roomResponse);
      dispatchSystemMessage(event.systemMessage, event.roomResponse.roomId);
    },
    [upsertRoom, dispatchSystemMessage]
  );

  const handleRoomDeleted = useCallback(
    (event: RoomDeletedEventPayload) => {
      setRooms((prev) => prev.filter((r) => r.roomId !== event.roomId));
      setSelectedChat((prev) => (prev?.roomId === event.roomId ? null : prev));
    },
    [setRooms, setSelectedChat]
  );

  // --- Socket Listeners ---
  useEffect(() => {
    const unsubs = [
      SocketManager.on("MESSAGE_CREATED", handleNewMessage),
      SocketManager.on("MESSAGE_UPDATED", handleMessageUpdated),
      SocketManager.on("ROOM_UPDATED", handleRoomUpdated),
      SocketManager.on("MESSAGE_RECALLED", handleRecallMessage),
      SocketManager.on("ROOM_CREATED", handleRoomCreated),
      SocketManager.on("ROOM_MEMBER_ADDED", handleMemberAdded),
      SocketManager.on("ROOM_MEMBER_REMOVED", handleMemberRemoved),
      SocketManager.on("ROOM_MEMBER_ROLE_CHANGED", handleMemberRoleChanged),
      SocketManager.on("ROOM_DELETED", handleRoomDeleted),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [
    handleNewMessage,
    handleMessageUpdated,
    handleRecallMessage,
    handleRoomCreated,
    handleMemberAdded,
    handleMemberRemoved,
    handleMemberRoleChanged,
    handleRoomUpdated,
    handleRoomDeleted,
  ]);
};
