import type { MessageResponse } from "@/types/chat/message";
import type { WeatherResponse } from "@/types/weather";
import MessageImage from "./MessageImage.tsx";
import MessageVideo from "./MessageVideo.tsx";
import MessageFile from "./MessageFile.tsx";
import WeatherMessageBubble from "./WeatherMessageBubble.tsx";
import { MessagePoll } from "./MessagePoll.tsx";
import { formatMessageTime } from "../../utils/formatMessageTime.ts";
import { getDisplayFileName } from "../../utils/getDisplayFileName.ts";
import { MoreHorizontal, RotateCcw, Forward, Trash2, Reply, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Pin } from "lucide-react";
import { recallMessageApi, deleteMessageForMeApi, pinMessageApi, unpinMessageApi } from "@/services/chat";
import { toast } from "sonner";
import { differenceInHours } from "date-fns";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";
import type { ChatTheme } from "../../utils/chatThemes.ts";
import LinkifiedText from "./LinkifiedText.tsx";
import CoListeningInviteCard, { parseCoListeningInvite } from "./CoListeningInviteCard.tsx";
import { ForwardedIndicator, RepliedMessagePreview } from "./MessageMetaBlocks.tsx";

interface SentMessageBubbleProps {
  message: MessageResponse;
  onMessageRecalled?: (messageId: string) => void;
  theme: ChatTheme;
  onForwardClick?: (messageId: string) => void;
  onDeleteForMe?: (messageId: string) => void;
  onReplyClick?: () => void;
  onEditClick?: () => void;
  onRetrySend?: (message: MessageResponse) => void;
  repliedSenderName?: string;
}

const SentMessageBubble = memo(function SentMessageBubble({
  message,
  onMessageRecalled,
  theme,
  onForwardClick,
  onDeleteForMe,
  onReplyClick,
  onEditClick,
  onRetrySend,
  repliedSenderName,
}: SentMessageBubbleProps) {
  const { t } = useTranslation("chat");
  const isMediaMessage =
    message.type === "IMAGE" ||
    message.type === "VIDEO" ||
    message.type === "FILE";
  const isWeatherMessage = message.type === "WEATHER";
  const coListeningInvite = message.type === "TEXT" ? parseCoListeningInvite(message.content) : null;
  const isInviteMessage = !!coListeningInvite;
  const isLocalPending = message.localStatus === "encrypting" || message.localStatus === "sending";
  const isLocalFailed = message.localStatus === "failed";

  const handleRecallMessage = async () => {
    const messageDate = new Date(message.createdAt);
    const hoursDiff = differenceInHours(new Date(), messageDate);

    if (hoursDiff >= 24) {
      toast.error(t("bubbles.messages.recallErrorTime"));
      return;
    }

    try {
      await recallMessageApi(message.id);
      toast.success(t("bubbles.messages.recallSuccess"));
      onMessageRecalled?.(message.id);
    } catch {
      toast.error(t("bubbles.messages.recallError"));
    }
  };

  const handleDeleteForMe = async () => {
    try {
      await deleteMessageForMeApi(message.id);
      toast.success(t("bubbles.messages.deleteForMeSuccess", "Message deleted for you"));
      onDeleteForMe?.(message.id);
    } catch {
      toast.error(t("bubbles.messages.deleteForMeError", "Could not delete message"));
    }
  };

  const handlePin = async () => {
    try {
      await pinMessageApi(message.id);
      toast.success(t("bubbles.messages.pinSuccess", "Message pinned"));
    } catch {
      toast.error(t("bubbles.messages.pinError", "Could not pin message"));
    }
  };

  const handleUnpin = async () => {
    try {
      await unpinMessageApi(message.id);
      toast.success(t("bubbles.messages.unpinSuccess", "Message unpinned"));
    } catch {
      toast.error(t("bubbles.messages.unpinError", "Could not unpin message"));
    }
  };

  const renderMessageContent = () => {
    if (!message.isActive) {
      return (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-md italic text-black/60 select-none pb-0.5"
        >
          {t("bubbles.messages.recalled")}
        </motion.p>
      );
    }

    let contentNode = null;
    switch (message.type) {
      case "IMAGE":
        contentNode = <MessageImage src={message.content} mediaUrls={message.mediaUrls} alt="Sent image" />;
        break;
      case "VIDEO":
        contentNode = <MessageVideo src={message.content} />;
        break;
      case "FILE": {
        const fileName = getDisplayFileName(message.content, message.fileFormat);
        contentNode = (
          <MessageFile
            src={message.content}
            fileName={fileName}
            isSent={true}
          />
        );
        break;
      }
      case "WEATHER": {
        try {
          const weatherData: WeatherResponse = JSON.parse(message.content);
          contentNode = (
            <WeatherMessageBubble
              weather={weatherData}
              createdAt={message.createdAt}
              isSent={true}
              theme={theme}
            />
          );
        } catch (error) {
          console.error("Failed to parse weather data:", error);
          contentNode = (
            <p className="text-sm text-red-500">
              {t("bubbles.weather.error")}
            </p>
          );
        }
        break;
      }
      case "POLL":
        contentNode = <MessagePoll message={message} currentUserId={message.senderId} />;
        break;
      case "TEXT":
      default:
        // Render a compact invite card for co-listening share links (instead of a huge URL).
        if (isInviteMessage) {
          contentNode = (
            <div className="flex flex-col relative">
              <CoListeningInviteCard text={message.content} />
            </div>
          );
          break;
        }
        contentNode = (
          <div className="flex flex-col relative">
            <LinkifiedText text={message.content} className="text-sm leading-relaxed" />
            {message.isEdited && (
              <span className="text-[10px] opacity-60 mt-1 self-end leading-none inline-flex items-center" title={message.editedAt ? new Date(message.editedAt).toLocaleString() : undefined}>
                <Edit2 className="w-2.5 h-2.5 mr-1" />
                {t("bubbles.messages.edited", "Edited")}
              </span>
            )}
          </div>
        );
        break;
    }

    return (
      <>
        <RepliedMessagePreview
          repliedMessage={message.repliedMessage}
          repliedSenderName={repliedSenderName}
          t={t}
          className="flex flex-col text-xs mb-1.5 border-l-[3px] border-current/40 bg-black/10 rounded-r-md px-2 py-1.5 cursor-pointer hover:bg-black/20 transition-colors"
        />
        <ForwardedIndicator isForwarded={message.isForwarded} t={t} />
        {contentNode}
      </>
    );
  };

  const shouldRenderBareContentContainer =
    message.isActive && (isWeatherMessage || isMediaMessage || isInviteMessage);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10, originX: 1, originY: 1 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className="msg-row msg-row--sent group mb-4"
    >
      <div className="msg-bubble-wrapper relative" id={`message-${message.id}`}>
        <AnimatePresence>
          {message.isActive && !isLocalPending && !isLocalFailed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:bg-black/5"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={onReplyClick}
                  className="cursor-pointer"
                >
                  <Reply className="mr-2 h-4 w-4" />
                  {t("bubbles.messages.replyBtn", "Reply")}
                </DropdownMenuItem>
                {message.type !== "POLL" && !message.isEncryptedText && (
                  <DropdownMenuItem
                    onClick={() => onForwardClick?.(message.id)}
                    className="cursor-pointer"
                  >
                    <Forward className="mr-2 h-4 w-4" />
                    {t("bubbles.messages.forwardBtn", "Forward")}
                  </DropdownMenuItem>
                )}
                {message.type === "TEXT" && (
                  <DropdownMenuItem
                    onClick={onEditClick}
                    className="cursor-pointer"
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    {t("bubbles.messages.editBtn", "Edit")}
                  </DropdownMenuItem>
                )}
                {message.type !== "SYSTEM" && (
                  <DropdownMenuItem
                    onClick={message.isPinned ? handleUnpin : handlePin}
                    className="cursor-pointer"
                  >
                    <Pin className="mr-2 h-4 w-4" />
                    {message.isPinned ? t("bubbles.messages.unpinBtn", "Unpin message") : t("bubbles.messages.pinBtn", "Pin message")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleRecallMessage}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t("bubbles.messages.recallBtn")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteForMe}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("bubbles.messages.deleteForMeBtn", "Delete for me")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </AnimatePresence>

        <motion.div transition={{ type: "spring", stiffness: 400, damping: 30 }}>
          {shouldRenderBareContentContainer ? (
            <div>{renderMessageContent()}</div>
          ) : (
            <div
              className={`msg-bubble msg-bubble--sent ${!message.isActive ? "bg-muted text-muted-foreground shadow-none" : theme.messages.sentBubbleText}`}
              style={message.isActive ? theme.messages.sentBubbleStyle : {}}
            >
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={message.isActive ? "active" : "recalled"}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.15 } }}
                  transition={{ duration: 0.2 }}
                >
                  {renderMessageContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        <div className="msg-time msg-time--sent mr-1 flex items-center justify-end gap-1">
          {message.isPinned && (
            <span title={t("bubbles.messages.pinnedMsg", "Pinned message")}>
              <Pin className="w-3 h-3 text-orange-500 fill-current" />
            </span>
          )}
          {formatMessageTime(message.createdAt)}
        </div>
        {(isLocalPending || isLocalFailed) && (
          <div className="mr-1 mt-1 flex items-center justify-end gap-2 text-[11px] text-right text-muted-foreground">
            {message.localStatus === "encrypting" && t("bubbles.messages.encrypting")}
            {message.localStatus === "sending" && t("bubbles.messages.sending")}
            {message.localStatus === "failed" && (
              <>
                <span>{t("bubbles.messages.sendFailed")}</span>
                {onRetrySend && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRetrySend(message)}
                    className="h-6 px-2 text-[11px] text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    {t("bubbles.messages.retrySend")}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default SentMessageBubble;
