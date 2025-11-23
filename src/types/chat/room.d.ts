import type { UserStatus } from "@/types/common/userStatus.ts";

// =====================================================================
// RESPONSE
// =====================================================================
export interface RoomResponse {
  roomId: number;
  roomType: "DIRECT" | "GROUP";
  directKey: string | null;
  name: string | null;
  lastMessage: LastMessage | null;
  participants: RoomParticipantResponse[];
  roomImgUrl: string | null;
  theme: string | null;
}

export interface RoomParticipantResponse {
  userId: number;
  name: string;
  avatarUrl: string;

  status: UserStatus;
  role: "OWNER" | "ADMIN" | "MEMBER";
  lastReadMessageId: number | null;
  lastReadAt: string | null;
}

export interface LastMessage {
  messageId: number;
  senderId: number;
  preview: string;
  messageType: "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "WEATHER";
  createdAt: string;
}

// =====================================================================
// Request
// =====================================================================

export interface CreateOrGetDirectRoomRequest {
  targetUserId: number;
}

export interface CreateGroupRoomRequest {
  name: string;
  memberIds: number[];
}

export interface AddGroupMembersRequest {
  roomId: number;
  memberIds: number[];
}
