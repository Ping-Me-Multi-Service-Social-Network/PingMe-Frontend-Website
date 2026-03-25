import type { MessageResponse } from "@/types/chat/message";
import type { WeatherResponse } from "@/types/weather";
import MessageImage from "./MessageImage.tsx";
import MessageVideo from "./MessageVideo.tsx";
import MessageFile from "./MessageFile.tsx";
import WeatherMessageBubble from "./WeatherMessageBubble.tsx";
import { formatMessageTime } from "../../utils/formatMessageTime.ts";
import { RotateCcw } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";
import { UserAvatarFallback } from "@/components/custom/UserAvatarFallback.tsx";
import type { ChatTheme } from "../../utils/chatThemes.ts";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface ReceivedMessageBubbleProps {
  message: MessageResponse;
  senderName?: string;
  senderAvatar?: string;
  roomType?: "DIRECT" | "GROUP";
  theme: ChatTheme;
}

export default function ReceivedMessageBubble({
  message,
  senderName,
  senderAvatar,
  roomType,
  theme,
}: ReceivedMessageBubbleProps) {
  const { t } = useTranslation("chat");
  const isMediaMessage =
    message.type === "IMAGE" ||
    message.type === "VIDEO" ||
    message.type === "FILE";
  const isWeatherMessage = message.type === "WEATHER"; 

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

    switch (message.type) {
      case "IMAGE":
        return <MessageImage src={message.content} alt="Received image" />;
      case "VIDEO":
        return <MessageVideo src={message.content} />;
      case "FILE": {
        const fileName = message.content.split("/").pop() || "file";
        return (
          <MessageFile
            src={message.content}
            fileName={fileName}
            isSent={false}
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
              isSent={false}
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
      initial={{ opacity: 0, scale: 0.95, y: 10, originX: 0, originY: 1 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className="msg-row msg-row--received group mb-4 flex items-start"
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

      <div className="msg-bubble-wrapper min-w-0">
        {roomType === "GROUP" && senderName && (
          <div className="text-xs font-semibold text-muted-foreground mb-1 ml-1 truncate max-w-[200px]">
            {senderName}
          </div>
        )}

        <motion.div layout="size" transition={{ type: "spring", stiffness: 400, damping: 30 }}>
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
        
        <motion.div layout="position" className="msg-time ml-1">
          {formatMessageTime(message.createdAt)}
        </motion.div>
      </div>
    </motion.div>
  );
}
