import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MessageResponse } from "@/types/chat/message";
import type {
  MessageCreatedEventPayload,
  MessageUpdatedEventPayload,
  MessageRecalledEventPayload,
  ReadStateChangedEvent,
  TypingSignalPayload,
} from "../events/chatEvents";
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

export interface ChatState {
  // Current room messages
  currentRoomId: number | null;
  messages: MessageResponse[];
  recalledMessageIds: string[];
  editedMessages: Record<string, Partial<MessageResponse>>;

  typingUsers: Record<number, TypingUser[]>;
}

const initialState: ChatState = {
  currentRoomId: null,
  messages: [],
  recalledMessageIds: [],
  editedMessages: {},
  typingUsers: {},
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
      state.recalledMessageIds = [];
      state.editedMessages = {};
    },

    clearMessages(state) {
      state.messages = [];
      state.recalledMessageIds = [];
      state.editedMessages = {};
    },

    messageCreated(state, action: PayloadAction<MessageCreatedEventPayload>) {
      const message = action.payload.messageResponse;
      // Only add if it's for current room
      if (state.currentRoomId === message.roomId) {
        const isDuplicate = state.messages.some(
          (m) =>
            m.id === message.id ||
            (message.clientMsgId && m.clientMsgId === message.clientMsgId),
        );
        if (!isDuplicate) {
          state.messages.push(message);
        }
      }
    },

    messageUpdated(state, action: PayloadAction<MessageUpdatedEventPayload>) {
      const message = action.payload.messageResponse;
      if (state.currentRoomId === message.roomId) {
        // We store the updated message metadata to be applied on both history and redux messages
        state.editedMessages[message.id] = {
          content: message.content,
          isEdited: message.isEdited,
          editedAt: message.editedAt,
          isPinned: message.isPinned,
          pinnedAt: message.pinnedAt,
          pinnedByUserId: message.pinnedByUserId,
        };

        // Also update local list if it exists
        const idx = state.messages.findIndex((m) => m.id === message.id);
        if (idx !== -1) {
          state.messages[idx].content = message.content;
          state.messages[idx].isEdited = message.isEdited;
          state.messages[idx].editedAt = message.editedAt;
          state.messages[idx].isPinned = message.isPinned;
          state.messages[idx].pinnedAt = message.pinnedAt;
          state.messages[idx].pinnedByUserId = message.pinnedByUserId;
        }
      }
    },

    messageRecalled(state, action: PayloadAction<MessageRecalledEventPayload>) {
      const messageId = action.payload.messageRecalledResponse.id;
      if (!state.recalledMessageIds.includes(messageId)) {
        state.recalledMessageIds.push(messageId);
      }

      const idx = state.messages.findIndex((m) => m.id === messageId);
      if (idx !== -1) {
        state.messages[idx].isActive = false;
      }
    },

    messageDeletedLocal(state, action: PayloadAction<string>) {
      state.messages = state.messages.filter((m) => m.id !== action.payload);
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
        (u) => u.userId === userId,
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
        if (existingIdx >= 0) {
          state.typingUsers[roomId].splice(existingIdx, 1);
        }
      }
    },

    clearRoomTyping(state, action: PayloadAction<number>) {
      delete state.typingUsers[action.payload];
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
  messageUpdated,
  messageRecalled,
  messageDeletedLocal,
  readStateChanged,
  userTyping,
  clearRoomTyping,
} = chatSlice.actions;

export default chatSlice.reducer;

// =================================================================
// Selectors
// =================================================================
export const selectCurrentRoomId = (state: RootState) =>
  state.chat.currentRoomId;
export const selectMessages = (state: RootState) => state.chat.messages;
export const selectRecalledMessageIds = (state: RootState) =>
  state.chat.recalledMessageIds;
export const selectEditedMessages = (state: RootState) =>
  state.chat.editedMessages;
export const selectTypingUsers = (roomId: number) => (state: RootState) =>
  state.chat.typingUsers[roomId] || [];
