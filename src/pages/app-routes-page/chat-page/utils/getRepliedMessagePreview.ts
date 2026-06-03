import type { MessageResponse } from "@/types/chat/message";
import type { TFunction } from "i18next";

export const getRepliedMessagePreview = (
  repliedMessage: MessageResponse["repliedMessage"],
  t: TFunction,
) => {
  if (!repliedMessage) return "Message";

  if (!repliedMessage.isActive) return t("bubbles.messages.recalled");
  if (repliedMessage.type === "TEXT") return repliedMessage.content;
  if (repliedMessage.type === "IMAGE") return t("bubbles.messages.image", "Image");
  if (repliedMessage.type === "VIDEO") return t("bubbles.messages.video", "Video");
  if (repliedMessage.type === "FILE") return t("bubbles.messages.file", "File");
  if (repliedMessage.type === "WEATHER") return t("bubbles.messages.weather", "Weather");
  if (repliedMessage.type === "POLL") {
    return `[${t("input.createPollTitle", "Poll")}] ${repliedMessage.poll?.question || ""}`;
  }
  if (repliedMessage.type === "NOTE") return `[${t("input.note", "Note")}] ${repliedMessage.content || ""}`;
  if (repliedMessage.type === "REMINDER") return `[${t("input.reminder", "Reminder")}] ${repliedMessage.content || ""}`;

  return "Message";
};
