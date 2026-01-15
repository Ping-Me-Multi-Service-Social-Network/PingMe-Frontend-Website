import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MessageResponse } from "@/types/chat/message";
import type {
  MessageCreatedEventPayload,
  MessageRecalledEventPayload,
  ReadStateChangedEvent,
  RoomCreatedEventPayload,
  RoomUpdatedEventPayload,
  RoomMemberAddedEventPayload,
  RoomMemberRemovedEventPayload,
  RoomMemberRoleChangedEventPayload,
  TypingSignalPayload,
} from "@/services/ws/module/chatSocket";
import type { RootState } from "@/features/store";

// =================================================================
// Types
// =================================================================
export interface TypingUser {
  userId: number;
  name: string;
  avatar?: string;
  isTyping: boolean;
  timestamp: number;
}

export type ChatEvent =
  | { type: "MESSAGE_CREATED"; payload: MessageCreatedEventPayload }
  | { type: "MESSAGE_RECALLED"; payload: MessageRecalledEventPayload }
  | { type: "ROOM_CREATED"; payload: RoomCreatedEventPayload }
  | { type: "ROOM_UPDATED"; payload: RoomUpdatedEventPayload }
  | { type: "MEMBER_ADDED"; payload: RoomMemberAddedEventPayload }
  | { type: "MEMBER_REMOVED"; payload: RoomMemberRemovedEventPayload }
  | { type: "MEMBER_ROLE_CHANGED"; payload: RoomMemberRoleChangedEventPayload };

export interface ChatState {
  // Current room messages
  currentRoomId: number | null;
  messages: MessageResponse[];

  // Typing indicators (per room)
  typingUsers: Record<number, TypingUser[]>;

  // Latest chat event (includes both message and room events)
  latestChatEvent: ChatEvent | null;
}

const initialState: ChatState = {
  currentRoomId: null,
  messages: [],
  typingUsers: {},
  latestChatEvent: null,
};

// =================================================================
// Slice
// =================================================================
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentRoom(state, action: PayloadAction<number | null>) {
      state.currentRoomId = action.payload;
      state.messages = [];
    },

    clearMessages(state) {
      state.messages = [];
    },

    messageCreated(state, action: PayloadAction<MessageCreatedEventPayload>) {
      const message = action.payload.messageResponse;
      // Only add if it's for current room
      if (state.currentRoomId === message.roomId) {
        const isDuplicate = state.messages.some(
          (m) =>
            m.id === message.id ||
            (message.clientMsgId && m.clientMsgId === message.clientMsgId)
        );
        if (!isDuplicate) {
          state.messages.push(message);
        }
      }
      // Also emit as event for ChatPage to handle room list updates
      state.latestChatEvent = {
        type: "MESSAGE_CREATED",
        payload: action.payload,
      };
    },

    messageRecalled(state, action: PayloadAction<MessageRecalledEventPayload>) {
      const messageId = action.payload.messageRecalledResponse.id;
      const idx = state.messages.findIndex((m) => m.id === messageId);
      if (idx !== -1) {
        state.messages.splice(idx, 1);
      }
      // Emit as event for ChatPage
      state.latestChatEvent = {
        type: "MESSAGE_RECALLED",
        payload: action.payload,
      };
    },

    readStateChanged(state, action: PayloadAction<ReadStateChangedEvent>) {
      // Update read states for messages in current room
      // This depends on your business logic for read states
      state.messages.forEach((msg) => {
        if (msg.roomId === action.payload.roomId) {
          // Update lastReadMessageId logic if needed
        }
      });
    },

    userTyping(state, action: PayloadAction<TypingSignalPayload>) {
      const { roomId, userId, name, avatar, isTyping } = action.payload;

      if (!state.typingUsers[roomId]) {
        state.typingUsers[roomId] = [];
      }

      const existingIdx = state.typingUsers[roomId].findIndex(
        (u) => u.userId === userId
      );

      if (isTyping) {
        const typingUser: TypingUser = {
          userId,
          name, // Use 'name' not 'username'
          avatar,
          isTyping: true,
          timestamp: Date.now(),
        };

        if (existingIdx >= 0) {
          state.typingUsers[roomId][existingIdx] = typingUser;
        } else {
          state.typingUsers[roomId].push(typingUser);
        }
      } else {
        // Remove user from typing list
        if (existingIdx >= 0) {
          state.typingUsers[roomId].splice(existingIdx, 1);
        }
      }
    },

    clearRoomTyping(state, action: PayloadAction<number>) {
      delete state.typingUsers[action.payload];
    },

    roomCreated(state, action: PayloadAction<RoomCreatedEventPayload>) {
      state.latestChatEvent = { type: "ROOM_CREATED", payload: action.payload };
    },

    roomUpdated(state, action: PayloadAction<RoomUpdatedEventPayload>) {
      state.latestChatEvent = { type: "ROOM_UPDATED", payload: action.payload };
    },

    memberAdded(state, action: PayloadAction<RoomMemberAddedEventPayload>) {
      state.latestChatEvent = { type: "MEMBER_ADDED", payload: action.payload };
    },

    memberRemoved(state, action: PayloadAction<RoomMemberRemovedEventPayload>) {
      state.latestChatEvent = {
        type: "MEMBER_REMOVED",
        payload: action.payload,
      };
    },

    memberRoleChanged(
      state,
      action: PayloadAction<RoomMemberRoleChangedEventPayload>
    ) {
      state.latestChatEvent = {
        type: "MEMBER_ROLE_CHANGED",
        payload: action.payload,
      };
    },

    clearChatEvent(state) {
      state.latestChatEvent = null;
    },
  },
});

// =================================================================
// Export
// =================================================================
export const {
  setCurrentRoom,
  clearMessages,
  messageCreated,
  messageRecalled,
  readStateChanged,
  userTyping,
  clearRoomTyping,
  roomCreated,
  roomUpdated,
  memberAdded,
  memberRemoved,
  memberRoleChanged,
  clearChatEvent,
} = chatSlice.actions;

export default chatSlice.reducer;

// =================================================================
// Selectors
// =================================================================
export const selectCurrentRoomId = (state: RootState) =>
  state.chat.currentRoomId;
export const selectMessages = (state: RootState) => state.chat.messages;
export const selectTypingUsers = (roomId: number) => (state: RootState) =>
  state.chat.typingUsers[roomId] || [];
export const selectChatEvent = (state: RootState) => state.chat.latestChatEvent;
