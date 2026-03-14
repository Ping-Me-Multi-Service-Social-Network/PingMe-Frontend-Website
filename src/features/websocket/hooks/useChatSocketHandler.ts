import { useCallback, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/features/hooks";
import { SocketManager } from "@/features/websocket/socketManager";
import type {
  MessageCreatedEventPayload,
  RoomUpdatedEventPayload,
  MessageRecalledEventPayload,
  RoomCreatedEventPayload,
  RoomMemberAddedEventPayload,
  RoomMemberRemovedEventPayload,
  RoomMemberRoleChangedEventPayload,
} from "@/features/websocket/module/chatSocket";
import {
  selectChatEvent,
  clearChatEvent,
  messageCreated,
} from "@/features/websocket/slices/chatSlice";
import type { RoomResponse } from "@/types/chat/room";
import type { CurrentUserSessionResponse } from "@/types/authentication";

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
  const chatEvent = useAppSelector(selectChatEvent);

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

        const updatedRoom = {
          ...targetRoom,
          lastMessage: {
            messageId: message.id,
            senderId: message.senderId,
            preview: message.content,
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

  const handleRoomUpdated = useCallback(
    (event: RoomUpdatedEventPayload) => {
      upsertRoom(event.roomResponse);
      dispatchSystemMessage(event.systemMessage, event.roomResponse.roomId);
    },
    [upsertRoom, dispatchSystemMessage]
  );

  const handleRecallMessage = useCallback(
    (_event: MessageRecalledEventPayload) => {
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

  // --- Event Listener ---
  useEffect(() => {
    if (!chatEvent) return;

    switch (chatEvent.type) {
      case "MESSAGE_CREATED":
        handleNewMessage(chatEvent.payload);
        break;
      case "ROOM_UPDATED":
        handleRoomUpdated(chatEvent.payload);
        break;
      case "MESSAGE_RECALLED":
        handleRecallMessage(chatEvent.payload);
        break;
      case "ROOM_CREATED":
        handleRoomCreated(chatEvent.payload);
        break;
      case "MEMBER_ADDED":
        handleMemberAdded(chatEvent.payload);
        break;
      case "MEMBER_REMOVED":
        handleMemberRemoved(chatEvent.payload);
        break;
      case "MEMBER_ROLE_CHANGED":
        handleMemberRoleChanged(chatEvent.payload);
        break;
    }

    dispatch(clearChatEvent());
  }, [
    chatEvent,
    dispatch,
    handleNewMessage,
    handleRecallMessage,
    handleRoomCreated,
    handleMemberAdded,
    handleMemberRemoved,
    handleMemberRoleChanged,
    handleRoomUpdated,
  ]);
};
