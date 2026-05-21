import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { FriendSessionSummary, MusicSessionState } from "@/types/music/musicSession";

interface MusicSessionSliceState {
  session: MusicSessionState | null;
  activeHostUserId: string | null;
  isHost: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  sessionToken?: string;
  friendSessionsByHostId: Record<string, FriendSessionSummary>;
}

const initialState: MusicSessionSliceState = {
  session: null,
  activeHostUserId: null,
  isHost: false,
  isConnecting: false,
  isConnected: false,
  error: null,
  sessionToken: undefined,
  friendSessionsByHostId: {},
};

const musicSessionSlice = createSlice({
  name: "musicSession",
  initialState,
  reducers: {
    joinSessionStart: (
      state,
      action: PayloadAction<{ hostUserId: string; currentUserId: string; sessionToken?: string }>
    ) => {
      // If we're already connected to the same host session, don't reset into a "connecting" state.
      // This prevents infinite spinner when user clicks an invite link again while already in-room.
      if (state.isConnected && state.activeHostUserId === action.payload.hostUserId) {
        state.sessionToken = action.payload.sessionToken;
        state.error = null;
        return;
      }

      state.activeHostUserId = action.payload.hostUserId;
      state.isHost = action.payload.hostUserId === action.payload.currentUserId;
      state.session = null;
      state.isConnecting = true;
      state.isConnected = false;
      state.error = null;
      state.sessionToken = action.payload.sessionToken;
    },

    joinSessionSuccess: (state) => {
      state.isConnecting = false;
      state.isConnected = true;
    },

    joinSessionFailed: (state, action: PayloadAction<string>) => {
      state.isConnecting = false;
      state.isConnected = false;
      state.error = action.payload;
    },

    sessionStateReceived: (state, action: PayloadAction<MusicSessionState>) => {
      if (state.session && state.session.hostUserId !== action.payload.hostUserId) {
        state.session = action.payload;
        return;
      }

      if (state.session && action.payload.version <= state.session.version) {
        return;
      }

      state.session = action.payload;
    },

    presenceChanged: (state, action: PayloadAction<string[]>) => {
      if (state.session) {
        state.session.activeListenerIds = action.payload;
      }
    },

    queueChanged: (state, action: PayloadAction<string[]>) => {
      if (state.session) {
        state.session.queue = action.payload;
      }
    },

    friendSessionsSnapshotReceived: (state, action: PayloadAction<FriendSessionSummary[]>) => {
      state.friendSessionsByHostId = action.payload.reduce<Record<string, FriendSessionSummary>>(
        (acc, session) => {
          acc[session.hostUserId] = session;
          return acc;
        },
        {}
      );
    },

    friendSessionUpserted: (state, action: PayloadAction<FriendSessionSummary>) => {
      state.friendSessionsByHostId ??= {};
      const current = state.friendSessionsByHostId[action.payload.hostUserId];
      if (current && action.payload.version < current.version) {
        return;
      }
      state.friendSessionsByHostId[action.payload.hostUserId] = action.payload;
    },

    friendSessionRemoved: (state, action: PayloadAction<string>) => {
      state.friendSessionsByHostId ??= {};
      delete state.friendSessionsByHostId[action.payload];
    },

    commandErrorReceived: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      if (state.isConnecting) {
        state.isConnecting = false;
      }
    },

    clearError: (state) => {
      state.error = null;
    },

    leaveSession: (state) => {
      state.session = null;
      state.activeHostUserId = null;
      state.isHost = false;
      state.isConnecting = false;
      state.isConnected = false;
      state.error = null;
      state.sessionToken = undefined;
    },
  },
});

export const {
  joinSessionStart,
  joinSessionSuccess,
  joinSessionFailed,
  sessionStateReceived,
  presenceChanged,
  queueChanged,
  friendSessionsSnapshotReceived,
  friendSessionUpserted,
  friendSessionRemoved,
  commandErrorReceived,
  clearError,
  leaveSession,
} = musicSessionSlice.actions;

export default musicSessionSlice.reducer;

