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
        <p className="text-md italic text-black select-none">
          {t("bubbles.messages.recalled")}
        </p>
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

  if (isWeatherMessage && message.isActive) {
    return <>{renderMessageContent()}</>;
  }

  return (
    <div className="msg-row msg-row--sent group">
      <div className="msg-bubble-wrapper relative">
        {message.isActive && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={handleRecallMessage}
                className="cursor-pointer"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {t("bubbles.messages.recallBtn")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {isMediaMessage ? (
          <div>{renderMessageContent()}</div>
        ) : (
          <div
            className={`msg-bubble msg-bubble--sent ${theme.messages.sentBubbleText}`}
            style={theme.messages.sentBubbleStyle}
          >
            {renderMessageContent()}
          </div>
        )}
        <div className="msg-time msg-time--sent">
          {formatMessageTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
