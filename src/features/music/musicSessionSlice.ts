import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { FriendSessionSummary, MusicSessionState } from "@/types/music/musicSession";

// =================================================================
// Music Session Slice - Lưu trạng thái nghe chung trong Redux
// =================================================================

interface MusicSessionSliceState {
  /** null = không có session nào đang hoạt động */
  session: MusicSessionState | null;
  /** ID của host mà mình đang nghe (null = chưa tham gia) */
  activeHostUserId: string | null;
  /** Mình có phải là Host không */
  isHost: boolean;
  /** Đang kết nối tới Music WS */
  isConnecting: boolean;
  /** Đã kết nối thành công */
  isConnected: boolean;
  /** Lỗi khi kết nối / nhận command */
  error: string | null;
  /** Optional JWT token for non-friend session joining */
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
    // Bắt đầu kết nối tới Music WS
    joinSessionStart: (
      state,
      action: PayloadAction<{ hostUserId: string; currentUserId: string; sessionToken?: string }>
    ) => {
      state.activeHostUserId = action.payload.hostUserId;
      state.isHost = action.payload.hostUserId === action.payload.currentUserId;
      state.isConnecting = true;
      state.isConnected = false;
      state.error = null;
      state.sessionToken = action.payload.sessionToken;
    },

    // Kết nối thành công
    joinSessionSuccess: (state) => {
      state.isConnecting = false;
      state.isConnected = true;
    },

    // Nhận toàn bộ Session State từ BE (MUSIC_SESSION_STATE event)
    sessionStateReceived: (state, action: PayloadAction<MusicSessionState>) => {
      // Bỏ qua nếu version cũ hơn để tránh nhận event lỗi thứ tự
      if (
        state.session &&
        action.payload.version <= state.session.version
      ) {
        return;
      }
      state.session = action.payload;
    },

    // Cập nhật nhanh presence (MUSIC_PRESENCE_CHANGED) - tránh re-render toàn bộ
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

    // Nhận lỗi từ server (/user/queue/music/errors)
    commandErrorReceived: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    // Xóa lỗi
    clearError: (state) => {
      state.error = null;
    },

    // Rời / giải tán session
    leaveSession: (state) => {
      state.session = null;
      state.activeHostUserId = null;
      state.isHost = false;
      state.isConnecting = false;
      state.isConnected = false;
      state.error = null;
    },
  },
});

export const {
  joinSessionStart,
  joinSessionSuccess,
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
