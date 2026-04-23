import type { RoomResponse, RoomParticipantResponse } from "@/types/chat/room";

type Role = "OWNER" | "ADMIN" | "MEMBER";

export const getMyParticipant = (room: RoomResponse, currentUserId: number): RoomParticipantResponse | undefined => {
  return room.participants.find((p) => p.userId === currentUserId);
};

export const getMyRoomRole = (room: RoomResponse, currentUserId: number): Role => {
  const me = getMyParticipant(room, currentUserId);
  return me?.role || "MEMBER";
};

export const canManageGroup = (room: RoomResponse, currentUserId: number): boolean => {
  if (room.roomType !== "GROUP") return false;
  const role = getMyRoomRole(room, currentUserId);
  return role === "OWNER" || role === "ADMIN";
};

export const canAddMembers = (room: RoomResponse, currentUserId: number): boolean => {
  return canManageGroup(room, currentUserId);
};

export const canRenameGroup = (room: RoomResponse, currentUserId: number): boolean => {
  return canManageGroup(room, currentUserId);
};

export const canChangeGroupAvatar = (room: RoomResponse, currentUserId: number): boolean => {
  return canManageGroup(room, currentUserId);
};

export const canChangeTheme = (room: RoomResponse, currentUserId: number): boolean => {
  // Theme change is often allowed for direct messages too, but let's restrict group theme changes
  if (room.roomType === "DIRECT") return true;
  return canManageGroup(room, currentUserId);
};

export const canChangeMemberRole = (room: RoomResponse, currentUserId: number): boolean => {
  if (room.roomType !== "GROUP") return false;
  return getMyRoomRole(room, currentUserId) === "OWNER";
};

export const canRemoveMember = (room: RoomResponse, currentUserId: number, targetParticipant: RoomParticipantResponse): boolean => {
  if (room.roomType !== "GROUP") return false;
  const myRole = getMyRoomRole(room, currentUserId);
  const targetRole = targetParticipant.role;

  if (targetRole === "OWNER") return false; // no one can remove OWNER
  if (currentUserId === targetParticipant.userId) return false; // self-removal is "leave group", handled separately

  if (myRole === "OWNER") return true; // OWNER can remove ADMIN and MEMBER
  if (myRole === "ADMIN" && targetRole === "MEMBER") return true; // ADMIN can remove MEMBER

  return false;
};

export const getAvailableRoleActions = (
  room: RoomResponse, 
  currentUserId: number, 
  targetParticipant: RoomParticipantResponse
): { role: Role; labelKey: string }[] => {
  const actions: { role: Role; labelKey: string }[] = [];
  if (room.roomType !== "GROUP") return actions;

  const myRole = getMyRoomRole(room, currentUserId);
  if (myRole !== "OWNER") return actions;

  if (targetParticipant.userId === currentUserId) return actions; // cannot self-demote here

  if (targetParticipant.role === "MEMBER") {
    actions.push({ role: "ADMIN", labelKey: "modals.groupMembers.promoteToAdmin" });
    actions.push({ role: "OWNER", labelKey: "modals.groupMembers.transferOwnership" });
  } else if (targetParticipant.role === "ADMIN") {
    actions.push({ role: "MEMBER", labelKey: "modals.groupMembers.demoteToMember" });
    actions.push({ role: "OWNER", labelKey: "modals.groupMembers.transferOwnership" });
  }

  return actions;
};
