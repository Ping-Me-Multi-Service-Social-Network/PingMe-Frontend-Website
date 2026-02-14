import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  FriendshipEventPayload,
  SignalingPayload,
  UserStatusPayload,
} from "@/services/ws/module/globalSocket";
import type { RootState } from "@/features/store";

interface SocketEventState<T> {
  id: number;
  payload: T | null;
}

interface SocketState {
  friendshipEvent: SocketEventState<FriendshipEventPayload>;
  userStatusEvent: SocketEventState<UserStatusPayload>;
  signalingEvent: SocketEventState<SignalingPayload>;
}

const initialState: SocketState = {
  friendshipEvent: { id: 0, payload: null },
  userStatusEvent: { id: 0, payload: null },
  signalingEvent: { id: 0, payload: null },
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    friendshipEventReceived(
      state,
      action: PayloadAction<FriendshipEventPayload>
    ) {
      state.friendshipEvent = {
        id: state.friendshipEvent.id + 1,
        payload: action.payload,
      };
    },
    userStatusEventReceived(state, action: PayloadAction<UserStatusPayload>) {
      state.userStatusEvent = {
        id: state.userStatusEvent.id + 1,
        payload: action.payload,
      };
    },
    signalingEventReceived(state, action: PayloadAction<SignalingPayload>) {
      state.signalingEvent = {
        id: state.signalingEvent.id + 1,
        payload: action.payload,
      };
    },
  },
});

export const {
  friendshipEventReceived,
  userStatusEventReceived,
  signalingEventReceived,
} = socketSlice.actions;

export default socketSlice.reducer;

export const selectFriendshipEvent = (state: RootState) =>
  state.socket.friendshipEvent;
export const selectUserStatusEvent = (state: RootState) =>
  state.socket.userStatusEvent;
export const selectSignalingEvent = (state: RootState) =>
  state.socket.signalingEvent;
