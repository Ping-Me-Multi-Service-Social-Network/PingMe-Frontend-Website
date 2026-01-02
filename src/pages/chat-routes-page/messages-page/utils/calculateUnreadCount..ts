import type { RoomResponse } from "@/types/chat/room";

export function calculateUnreadCount(
  room: RoomResponse,
  currentUserId: number
): number {
  if (!room.lastMessage) {
    return 0;
  }

  const currentUserParticipant = room.participants.find(
    (p) => p.userId === currentUserId
  );

  if (
    !currentUserParticipant ||
    currentUserParticipant.lastReadMessageId === null
  ) {
    if (room.lastMessage.senderId !== currentUserId) {
      return 1;
    }
    return 0;
  }

  const unreadCount = 0;
  // room.lastMessage.messageId - currentUserParticipant.lastReadMessageId;

  return Math.max(0, unreadCount);
}
