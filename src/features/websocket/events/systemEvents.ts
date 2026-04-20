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
  type: "INVITE" | "ACCEPT" | "REJECT" | "LEAVE" | "HANGUP" | "SESSION_ENDED";
  senderId: number;
  senderName: string;
  roomId: number;
  callSessionId: string;
  activeParticipantCount: number;
  payload?: {
    callType?: "AUDIO" | "VIDEO";
    reason?: string;
  };
}
