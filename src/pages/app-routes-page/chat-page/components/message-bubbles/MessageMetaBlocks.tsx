import { Forward } from "lucide-react";
import { getRepliedMessagePreview } from "../../utils/getRepliedMessagePreview.ts";
import type { MessageResponse } from "@/types/chat/message";
import type { TFunction } from "i18next";

interface RepliedMessagePreviewProps {
  repliedMessage: MessageResponse["repliedMessage"];
  repliedSenderName?: string;
  t: TFunction;
  className: string;
}

export function RepliedMessagePreview({
  repliedMessage,
  repliedSenderName,
  t,
  className,
}: RepliedMessagePreviewProps) {
  if (!repliedMessage) return null;

  const scrollToRepliedMessage = () => {
    const el = document.getElementById(`message-${repliedMessage.id}`);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("bg-primary/20", "transition-colors", "duration-500");
    setTimeout(() => el.classList.remove("bg-primary/20"), 1500);
  };

  return (
    <div className={className} onClick={scrollToRepliedMessage}>
      <span className="font-bold opacity-100 mb-0.5">
        {t("bubbles.messages.replyTo", "Replying to")} {repliedSenderName || "User"}
      </span>
      <span className="truncate max-w-[200px] opacity-90 text-[11px]">
        {getRepliedMessagePreview(repliedMessage, t)}
      </span>
    </div>
  );
}

export function ForwardedIndicator({ isForwarded, t }: { isForwarded?: boolean; t: TFunction }) {
  if (!isForwarded) return null;

  return (
    <div className="flex items-center text-[11px] opacity-70 mb-1 italic">
      <Forward className="h-3 w-3 mr-1" />
      {t("bubbles.messages.forwarded", "Forwarded")}
    </div>
  );
}
