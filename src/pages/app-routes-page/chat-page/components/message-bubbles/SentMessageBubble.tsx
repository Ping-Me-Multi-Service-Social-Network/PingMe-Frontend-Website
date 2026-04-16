import type { MessageResponse } from "@/types/chat/message";
import type { WeatherResponse } from "@/types/weather";
import MessageImage from "./MessageImage.tsx";
import MessageVideo from "./MessageVideo.tsx";
import MessageFile from "./MessageFile.tsx";
import WeatherMessageBubble from "./WeatherMessageBubble.tsx";
import { formatMessageTime } from "../../utils/formatMessageTime.ts";
import { getDisplayFileName } from "../../utils/getDisplayFileName.ts";
import { MoreHorizontal, RotateCcw, Forward } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { recallMessageApi } from "@/services/chat";
import { toast } from "sonner";
import { differenceInHours } from "date-fns";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";
import type { ChatTheme } from "../../utils/chatThemes.ts";

interface SentMessageBubbleProps {
  message: MessageResponse;
  onMessageRecalled?: (messageId: string) => void;
  theme: ChatTheme;
  onForwardClick?: (messageId: string) => void;
}

const SentMessageBubble = memo(function SentMessageBubble({
  message,
  onMessageRecalled,
  theme,
  onForwardClick,
}: SentMessageBubbleProps) {
  const { t } = useTranslation("chat");
  const isMediaMessage =
    message.type === "IMAGE" ||
    message.type === "VIDEO" ||
    message.type === "FILE";
  const isWeatherMessage = message.type === "WEATHER";

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
        contentNode = <MessageImage src={message.content} alt="Sent image" />;
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
      initial={{ opacity: 0, scale: 0.95, y: 10, originX: 1, originY: 1 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className="msg-row msg-row--sent group mb-4"
    >
      <div className="msg-bubble-wrapper relative">
        <AnimatePresence>
          {message.isActive && (
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
                  onClick={() => onForwardClick?.(message.id)}
                  className="cursor-pointer"
                >
                  <Forward className="mr-2 h-4 w-4" />
                  {t("bubbles.messages.forwardBtn", "Forward")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleRecallMessage}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t("bubbles.messages.recallBtn")}
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
              className={`msg-bubble msg-bubble--sent border ${!message.isActive ? "bg-muted text-muted-foreground border-border shadow-none" : theme.messages.sentBubbleText}`}
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

        <div className="msg-time msg-time--sent mr-1">
          {formatMessageTime(message.createdAt)}
        </div>
      </div>
    </motion.div>
  );
});

export default SentMessageBubble;
