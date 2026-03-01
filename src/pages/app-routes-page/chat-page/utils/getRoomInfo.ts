import type { RoomResponse } from "@/types/chat/room";
import type { CurrentUserSessionResponse } from "@/types/authentication";
import i18n from "@/i18n";

export const getRoomDisplayName = (
  room: RoomResponse,
  userSession: CurrentUserSessionResponse | null
) => {
  if (room.name) return room.name;

  if (room.roomType === "DIRECT" && userSession) {
    const otherParticipant = room.participants.find(
      (p) => p.name !== userSession.name
    );
    return otherParticipant?.name || "Unknown";
  }

  return room.participants[0]?.name || "Unknown";
};

export const getRoomAvatar = (
  room: RoomResponse,
  userSession: CurrentUserSessionResponse | null
) => {
  if (room.roomType === "GROUP") {
    return room.roomImgUrl;
  }

  if (room.roomType === "DIRECT" && userSession) {
    const otherParticipant = room.participants.find(
      (p) => p.name !== userSession.name
    );
    return otherParticipant?.avatarUrl;
  }

  return room.participants[0]?.avatarUrl;
};

export const getLastMessagePreview = (
  room: RoomResponse,
  userSession: CurrentUserSessionResponse | null
) => {
  if (!room.lastMessage) return i18n.t("chat:preview.noMessages");

  const senderParticipant = room.participants.find(
    (p) => p.userId === room.lastMessage?.senderId
  );
  const senderName = senderParticipant?.name || "Unknown";

  let messageContent = room.lastMessage.preview;

  switch (room.lastMessage.messageType) {
    case "IMAGE":
      messageContent = i18n.t("chat:preview.image");
      break;
    case "VIDEO":
      messageContent = i18n.t("chat:preview.video");
      break;
    case "FILE":
      messageContent = i18n.t("chat:preview.file");
      break;
    case "WEATHER":
      messageContent = i18n.t("chat:preview.weather");
      break;
    case "TEXT":
    default:
      messageContent = room.lastMessage.preview;
      break;
  }

  if (userSession && senderName === userSession.name) {
    return `${i18n.t("chat:preview.you")}: ${messageContent}`;
  } else {
    return `${senderName}: ${messageContent}`;
  }
};

export const getOtherParticipant = (
  room: RoomResponse,
  userSession: CurrentUserSessionResponse | null
) => {
  if (room.roomType === "DIRECT" && userSession) {
    return room.participants.find((p) => p.userId !== userSession.id);
  }
  return null;
};
