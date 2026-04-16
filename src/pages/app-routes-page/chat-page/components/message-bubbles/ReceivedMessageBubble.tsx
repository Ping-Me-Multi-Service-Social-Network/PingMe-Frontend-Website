import type { MessageResponse } from "@/types/chat/message";
import type { WeatherResponse } from "@/types/weather";
import MessageImage from "./MessageImage.tsx";
import MessageVideo from "./MessageVideo.tsx";
import MessageFile from "./MessageFile.tsx";
import WeatherMessageBubble from "./WeatherMessageBubble.tsx";
import { formatMessageTime } from "../../utils/formatMessageTime.ts";
import { getDisplayFileName } from "../../utils/getDisplayFileName.ts";
import { RotateCcw, Forward, MoreHorizontal, Trash2, Reply } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";
import { UserAvatarFallback } from "@/components/custom/UserAvatarFallback.tsx";
import type { ChatTheme } from "../../utils/chatThemes.ts";
import { useTranslation } from "react-i18next";
import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { deleteMessageForMeApi } from "@/services/chat";
import { toast } from "sonner";

interface ReceivedMessageBubbleProps {
  message: MessageResponse;
  senderName?: string;
  senderAvatar?: string;
  roomType?: "DIRECT" | "GROUP";
  theme: ChatTheme;
  onForwardClick?: (messageId: string) => void;
  onDeleteForMe?: (messageId: string) => void;
  onReplyClick?: () => void;
  repliedSenderName?: string;
}

const ReceivedMessageBubble = memo(function ReceivedMessageBubble({
  message,
  senderName,
  senderAvatar,
  roomType,
  theme,
  onForwardClick,
  onDeleteForMe,
  onReplyClick,
  repliedSenderName,
}: ReceivedMessageBubbleProps) {
  const { t } = useTranslation("chat");
  const isMediaMessage =
    message.type === "IMAGE" ||
    message.type === "VIDEO" ||
    message.type === "FILE";
  const isWeatherMessage = message.type === "WEATHER"; 

  const handleDeleteForMe = async () => {
    try {
      await deleteMessageForMeApi(message.id);
      toast.success(t("bubbles.messages.deleteForMeSuccess", "Message deleted for you"));
      onDeleteForMe?.(message.id);
    } catch {
      toast.error(t("bubbles.messages.deleteForMeError", "Could not delete message"));
    }
  };

  const renderMessageContent = () => {
    if (!message.isActive) {
      return (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="flex items-center gap-2 text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <p className="text-sm italic font-medium">{t("bubbles.messages.recalled")}</p>
        </motion.div>
      );
    }

    let contentNode = null;
    switch (message.type) {
      case "IMAGE":
        contentNode = <MessageImage src={message.content} mediaUrls={message.mediaUrls} alt="Received image" />;
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
            isSent={false}
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
              isSent={false}
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
      case "TEXT":
      default:
        contentNode = (
          <p className="text-sm leading-relaxed">
            {message.content}
          </p>
        );
        break;
    }

    return (
      <>
        {message.repliedMessage && (
          <div 
            className="flex flex-col text-xs mb-1.5 border-l-[3px] border-current/30 bg-black/5 rounded-r-md px-2 py-1.5 cursor-pointer hover:bg-black/10 transition-colors"
            onClick={() => {
              const el = document.getElementById(`message-${message.repliedMessage?.id}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('bg-primary/20', 'transition-colors', 'duration-500');
                setTimeout(() => el.classList.remove('bg-primary/20'), 1500);
              }
            }}
          >
            <span className="font-bold opacity-100 mb-0.5">
              {t("bubbles.messages.replyTo", "Replying to")} {repliedSenderName || "User"}
            </span>
            <span className="truncate max-w-[200px] opacity-90 text-[11px]">
              {!message.repliedMessage.isActive ? t("bubbles.messages.recalled") :
               message.repliedMessage.type === "TEXT" ? message.repliedMessage.content : 
               message.repliedMessage.type === "IMAGE" ? t("bubbles.messages.image", "Image") :
               message.repliedMessage.type === "VIDEO" ? t("bubbles.messages.video", "Video") :
               message.repliedMessage.type === "FILE" ? t("bubbles.messages.file", "File") : 
               message.repliedMessage.type === "WEATHER" ? t("bubbles.messages.weather", "Weather") : 
               "Message"}
            </span>
          </div>
        )}
        {message.isForwarded && (
          <div className="flex items-center text-[11px] opacity-70 mb-1 italic">
            <Forward className="h-3 w-3 mr-1" />
            {t("bubbles.messages.forwarded", "Forwarded")}
          </div>
        )}
        {contentNode}
      </>
    );
  };


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10, originX: 0, originY: 1 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className="msg-row msg-row--received group mb-4 flex items-start relative"
    >
      <Avatar
        className={`w-10 h-10 mr-3 mt-1 shrink-0 ring-2 ${theme.messages.avatarRing}`}
      >
        <AvatarImage
          src={senderAvatar || "/placeholder.svg"}
          alt={senderName}
        />
        <UserAvatarFallback name={senderName} size="md" />
      </Avatar>

      <div className="msg-bubble-wrapper min-w-0 relative" id={`message-${message.id}`}>
        {roomType === "GROUP" && senderName && (
          <div className="text-xs font-semibold text-muted-foreground mb-1 ml-1 truncate max-w-[200px]">
            {senderName}
          </div>
        )}

        <AnimatePresence>
          {message.isActive && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:bg-black/5"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={onReplyClick}
                  className="cursor-pointer"
                >
                  <Reply className="mr-2 h-4 w-4" />
                  {t("bubbles.messages.replyBtn", "Reply")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onForwardClick?.(message.id)}
                  className="cursor-pointer"
                >
                  <Forward className="mr-2 h-4 w-4" />
                  {t("bubbles.messages.forwardBtn", "Forward")}
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
            {isWeatherMessage && message.isActive ? (
                <div>{renderMessageContent()}</div>
            ) : isMediaMessage && message.isActive ? (
            <div>{renderMessageContent()}</div>
            ) : (
            <div
                className={`msg-bubble msg-bubble--received ${!message.isActive ? "bg-muted text-muted-foreground border border-border shadow-none" : theme.messages.receivedBubbleText} border ${message.isActive ? theme.messages.receivedBubbleBorder : ""}`}
                style={message.isActive ? theme.messages.receivedBubbleStyle : {}}
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
        
        <div className="msg-time ml-1">
          {formatMessageTime(message.createdAt)}
        </div>
      </div>
    </motion.div>
  );
});

export default ReceivedMessageBubble;
