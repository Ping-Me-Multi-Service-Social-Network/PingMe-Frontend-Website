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
import { selectChatEvent, clearChatEvent } from "@/features/websocket/slices/chatSlice";
import type { RoomResponse } from "@/types/chat/room";
import type { CurrentUserSessionResponse } from "@/types/authentication";

interface UseChatSocketHandlerProps {
  setRooms: React.Dispatch<React.SetStateAction<RoomResponse[]>>;
  setSelectedChat: React.Dispatch<React.SetStateAction<RoomResponse | null>>;
  selectedChat: RoomResponse | null;
  selectedRoomIdRef: React.MutableRefObject<number | null>;
  chatBoxRef: React.RefObject<any>; // Using any for Ref to avoid circular dependency or complex type import for now
  userSession: CurrentUserSessionResponse | null;
}

export const useChatSocketHandler = ({
  setRooms,
  setSelectedChat,
  selectedChat,
  selectedRoomIdRef,
  chatBoxRef,
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

  // --- Handlers ---
  const handleNewMessage = useCallback(
    (event: MessageCreatedEventPayload) => {
      const message = event.messageResponse;

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

      if (selectedRoomIdRef.current === message.roomId && chatBoxRef.current) {
        chatBoxRef.current.handleIncomingMessage(message);
      }
    },
    [setRooms, selectedRoomIdRef, chatBoxRef]
  );

  const handleRoomUpdated = useCallback(
    (event: RoomUpdatedEventPayload) => {
      upsertRoom(event.roomResponse);

      if (
        event.systemMessage &&
        selectedRoomIdRef.current === event.roomResponse.roomId &&
        chatBoxRef.current
      ) {
        chatBoxRef.current.handleIncomingMessage(event.systemMessage);
      }
    },
    [upsertRoom, selectedRoomIdRef, chatBoxRef]
  );

  const handleRecallMessage = useCallback(
    (event: MessageRecalledEventPayload) => {
      if (chatBoxRef.current) {
        chatBoxRef.current.handleRecallMessage(
          event.messageRecalledResponse.id
        );
      }
    },
    [chatBoxRef]
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

      if (
        event.systemMessage &&
        selectedRoomIdRef.current === event.roomResponse.roomId &&
        chatBoxRef.current
      ) {
        chatBoxRef.current.handleIncomingMessage(event.systemMessage);
      }
    },
    [upsertRoom, selectedRoomIdRef, chatBoxRef]
  );

  const handleMemberRemoved = useCallback(
    (event: RoomMemberRemovedEventPayload) => {
      console.log("[PingMe] Member removed event:", event);

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

        if (
          event.systemMessage &&
          selectedRoomIdRef.current === event.roomResponse.roomId &&
          chatBoxRef.current
        ) {
          chatBoxRef.current.handleIncomingMessage(event.systemMessage);
        }
      }
    },
    [upsertRoom, userSession?.id, setRooms, setSelectedChat, selectedRoomIdRef, chatBoxRef]
  );

  const handleMemberRoleChanged = useCallback(
    (event: RoomMemberRoleChangedEventPayload) => {
      upsertRoom(event.roomResponse);

      if (
        event.systemMessage &&
        selectedRoomIdRef.current === event.roomResponse.roomId &&
        chatBoxRef.current
      ) {
        chatBoxRef.current.handleIncomingMessage(event.systemMessage);
      }
    },
    [upsertRoom, selectedRoomIdRef, chatBoxRef]
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
