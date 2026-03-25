import type { MessageResponse } from "@/types/chat/message";
import type { WeatherResponse } from "@/types/weather";
import MessageImage from "./MessageImage.tsx";
import MessageVideo from "./MessageVideo.tsx";
import MessageFile from "./MessageFile.tsx";
import WeatherMessageBubble from "./WeatherMessageBubble.tsx";
import { formatMessageTime } from "../../utils/formatMessageTime.ts";
import { MoreHorizontal, RotateCcw } from "lucide-react";
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
import type { ChatTheme } from "../../utils/chatThemes.ts";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface SentMessageBubbleProps {
  message: MessageResponse;
  onMessageRecalled?: (messageId: string) => void;
  theme: ChatTheme;
}

export default function SentMessageBubble({
  message,
  onMessageRecalled,
  theme,
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

    switch (message.type) {
      case "IMAGE":
        return <MessageImage src={message.content} alt="Sent image" />;
      case "VIDEO":
        return <MessageVideo src={message.content} />;
      case "FILE": {
        const fileName = message.content.split("/").pop() || "file";
        return (
          <MessageFile
            src={message.content}
            fileName={fileName}
            isSent={true}
          />
        );
      }
      case "WEATHER": {
        try {
          const weatherData: WeatherResponse = JSON.parse(message.content);
          return (
            <WeatherMessageBubble
              weather={weatherData}
              createdAt={message.createdAt}
              isSent={true}
              theme={theme}
            />
          );
        } catch (error) {
          console.error("Failed to parse weather data:", error);
          return (
            <p className="text-sm text-red-500">
              {t("bubbles.weather.error")}
            </p>
          );
        }
      }
      case "TEXT":
      default:
        return (
          <p className="text-sm leading-relaxed">
            {message.content}
          </p>
        );
    }
  };

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, scale: 0.95, y: 10, originX: 1, originY: 1 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className="msg-row msg-row--sent group"
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

        <motion.div layout="size" transition={{ type: "spring", stiffness: 400, damping: 30 }}>
          {(isMediaMessage || isWeatherMessage) && message.isActive ? (
            <div>{renderMessageContent()}</div>
          ) : (
            <div
              className={`msg-bubble msg-bubble--sent ${!message.isActive ? "bg-black/5 text-black border border-black/10 shadow-none dark:bg-white/10 dark:text-white dark:border-white/10" : theme.messages.sentBubbleText}`}
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
        <motion.div layout="position" className="msg-time msg-time--sent">
          {formatMessageTime(message.createdAt)}
        </motion.div>
      </div>
    </motion.div>
  );
}
