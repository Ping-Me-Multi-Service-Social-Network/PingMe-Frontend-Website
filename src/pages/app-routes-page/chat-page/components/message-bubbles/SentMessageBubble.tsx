import type { MessageResponse } from "@/types/chat/message";
import type { WeatherResponse } from "@/types/weather";
import {
  MoreHorizontal,
  RotateCcw,
  Forward,
  Trash2,
  Reply,
  Edit2,
  RefreshCw,
  Loader2,
  AlertCircle,
  CloudSun,
  Pin,
} from "lucide-react";
import MessageImage from "./MessageImage.tsx";
import MessageVideo from "./MessageVideo.tsx";
import MessageFile from "./MessageFile.tsx";
import WeatherMessageBubble from "./WeatherMessageBubble.tsx";
import { MessagePoll } from "./MessagePoll.tsx";
import { formatMessageTime } from "../../utils/formatMessageTime.ts";
import { getDisplayFileName } from "../../utils/getDisplayFileName.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Progress } from "@/components/ui/progress.tsx";
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
  const localUploadProgress =
    typeof message.localUploadProgress === "number" ? Math.max(0, Math.min(message.localUploadProgress, 100)) : null;
  const isUploadingMedia =
    isMediaMessage && isLocalPending && localUploadProgress !== null;
  const isWeatherPending = isWeatherMessage && isLocalPending;

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
        contentNode = (
          <div className="flex flex-col gap-2">
            <MessageImage src={message.content} mediaUrls={message.mediaUrls} alt="Sent image" />
            {isUploadingMedia && renderUploadProgress()}
          </div>
        );
        break;
      case "VIDEO":
        contentNode = (
          <div className="flex flex-col gap-2">
            <MessageVideo src={message.content} />
            {isUploadingMedia && renderUploadProgress()}
          </div>
        );
        break;
      case "FILE": {
        const fileName = message.localFileName ?? getDisplayFileName(message.content, message.fileFormat);
        contentNode = (
          <div className="flex flex-col gap-2">
            <MessageFile
              src={message.content}
              fileName={fileName}
              isSent={true}
            />
            {isUploadingMedia && renderUploadProgress()}
          </div>
        );
        break;
      }
      case "WEATHER": {
        if (isLocalFailed) {
          contentNode = (
            <div className="rounded-2xl rounded-br-md px-4 py-3 shadow-sm max-w-sm min-w-[240px] border border-red-200 bg-red-50/80">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-sm">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-red-700">
                    {t("bubbles.weather.title")}
                  </div>
                  <div className="text-xs text-red-600">
                    {message.localError ?? t("bubbles.messages.sendFailed")}
                  </div>
                </div>
              </div>
            </div>
          );
          break;
        }

        if (isWeatherPending) {
          contentNode = (
            <div className="rounded-2xl rounded-br-md px-4 py-3 shadow-sm max-w-sm min-w-[240px] border border-white/20 bg-white/20 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/70 text-purple-600 shadow-sm">
                  <CloudSun className="h-6 w-6 animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">
                    {t("bubbles.weather.title")}
                  </div>
                  <div className="text-xs opacity-80">
                    {message.localStatus === "encrypting"
                      ? t("bubbles.messages.encrypting")
                      : t("bubbles.messages.sending")}
                  </div>
                </div>
              </div>
            </div>
          );
          break;
        }

        try {
          const weatherData: WeatherResponse = JSON.parse(message.content);
          contentNode = (
          <WeatherMessageBubble
            weather={weatherData}
            createdAt={message.createdAt}
            isSent={true}
            theme={theme}
            showTime={false}
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

  const renderUploadProgress = () => {
    if (!isUploadingMedia) return null;

    return (
      <div className="space-y-1">
        <Progress
          value={localUploadProgress ?? 0}
          className="h-1.5 bg-white/25 [&_[data-slot=progress-indicator]]:bg-white"
        />
        <div className="flex items-center justify-between gap-2 text-[11px] opacity-80">
          <span>{t("bubbles.messages.sending")}</span>
          <span>{localUploadProgress}%</span>
        </div>
      </div>
    );
  };

  const canRetry = message.type === "TEXT" || message.type === "WEATHER";

  const renderLocalStatusIcon = () => {
    if (!isLocalPending && !isLocalFailed) return null;

    const iconClass =
      "h-3.5 w-3.5";

    return (
      <div
        className={`absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm ${
          isLocalFailed
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-purple-200 bg-white text-purple-600"
        }`}
        aria-hidden="true"
      >
        {isLocalFailed ? (
          <AlertCircle className={iconClass} />
        ) : (
          <Loader2 className={`${iconClass} animate-spin`} />
        )}
      </div>
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
        {renderLocalStatusIcon()}
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
                {onRetrySend && canRetry && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRetrySend(message)}
                    aria-label={t("bubbles.messages.retrySend")}
                    className="h-6 w-6 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    title={t("bubbles.messages.retrySend")}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
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
