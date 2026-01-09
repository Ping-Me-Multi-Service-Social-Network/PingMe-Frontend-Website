// =================================================================
// Global Socket Module - Types and Interfaces
// =================================================================
import type { UserSummaryResponse } from "@/types/common/userSummary";

export type FriendshipEventType =
  | "INVITED"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELED"
  | "DELETED";

export interface FriendshipEventPayload {
  type: FriendshipEventType;
  userSummaryResponse: UserSummaryResponse;
}

export interface UserStatusPayload {
  userId: string;
  name: string;
  isOnline: boolean;
}

export interface SignalingPayload {
  type: "INVITE" | "ACCEPT" | "REJECT" | "HANGUP";
  senderId: number;
  roomId: number;
  payload?: {
    callType?: "AUDIO" | "VIDEO";
    targetUserId?: number;
    reason?: string;
  };
}
