// =================================================================
// Chat Socket Module - Types and Interfaces
// =================================================================
import type {
  MessageRecalledResponse,
  MessageResponse,
} from "@/types/chat/message";
import type { RoomResponse } from "@/types/chat/room";

export type ChatEventType =
  | "MESSAGE_CREATED"
  | "MESSAGE_RECALLED"
  | "READ_STATE_CHANGED"
  | "ROOM_CREATED"
  | "ROOM_UPDATED"
  | "MEMBER_ADDED"
  | "MEMBER_REMOVED"
  | "MEMBER_ROLE_CHANGED";

export interface MessageCreatedEventPayload {
  chatEventType: "MESSAGE_CREATED";
  messageResponse: MessageResponse;
}

export interface MessageRecalledEventPayload {
  chatEventType: "MESSAGE_RECALLED";
  messageRecalledResponse: MessageRecalledResponse;
}

export interface ReadStateChangedEvent {
  chatEventType: "READ_STATE_CHANGED";
  roomId: number;
  userId?: number;
  lastReadMessageId: string;
  lastReadAt: string;
}

export interface RoomCreatedEventPayload {
  chatEventType: "ROOM_CREATED";
  roomResponse: RoomResponse;
}

export interface RoomUpdatedEventPayload {
  chatEventType: "ROOM_UPDATED";
  roomResponse: RoomResponse;
  systemMessage?: MessageResponse;
}

export interface RoomMemberAddedEventPayload {
  chatEventType: "MEMBER_ADDED";
  roomResponse: RoomResponse;
  targetUserId: number;
  actorUserId: number;
  systemMessage?: MessageResponse;
}

export interface RoomMemberRemovedEventPayload {
  chatEventType: "MEMBER_REMOVED";
  roomResponse: RoomResponse;
  targetUserId: number;
  actorUserId: number;
  systemMessage?: MessageResponse;
}

export interface RoomMemberRoleChangedEventPayload {
  chatEventType: "MEMBER_ROLE_CHANGED";
  roomResponse: RoomResponse;
  targetUserId: number;
  oldRole: "OWNER" | "ADMIN" | "MEMBER";
  newRole: "OWNER" | "ADMIN" | "MEMBER";
  actorUserId: number;
  systemMessage?: MessageResponse;
}

export interface ChatEventHandlers {
  // Message events
  onMessageCreated?: (ev: MessageCreatedEventPayload) => void;
  onMessageRecalled?: (ev: MessageRecalledEventPayload) => void;

  // Room events
  onRoomCreated?: (ev: RoomCreatedEventPayload) => void;
  onRoomUpdated?: (ev: RoomUpdatedEventPayload) => void;

  // Member events
  onMemberAdded?: (ev: RoomMemberAddedEventPayload) => void;
  onMemberRemoved?: (ev: RoomMemberRemovedEventPayload) => void;
  onMemberRoleChanged?: (ev: RoomMemberRoleChangedEventPayload) => void;

  // Read state
  onReadStateChanged?: (ev: ReadStateChangedEvent) => void;
}
