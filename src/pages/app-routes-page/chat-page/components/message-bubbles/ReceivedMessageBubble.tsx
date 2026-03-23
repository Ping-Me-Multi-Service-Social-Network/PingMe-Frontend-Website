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
  const isWeatherMessage = message.type === "WEATHER"; // Added weather message check

  const renderMessageContent = () => {
    if (!message.isActive) {
      return (
        <div className="flex items-center gap-2 text-gray-700">
          <RotateCcw className="h-4 w-4 text-gray-500" />
          <p className="text-sm italic">{t("bubbles.messages.recalled")}</p>
        </div>
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

  if (isWeatherMessage && message.isActive) {
    return (
      <div className="flex items-start mb-4 group">
        <Avatar
          className={`w-10 h-10 mr-3 shrink-0 ring-2 ${theme.messages.avatarRing}`}
        >
          <AvatarImage
            src={senderAvatar || "/placeholder.svg"}
            alt={senderName}
          />
          <UserAvatarFallback name={senderName} size="md" />
        </Avatar>
        <div className="msg-bubble-wrapper">
          {roomType === "GROUP" && senderName && (
            <div className="text-xs font-medium text-gray-600 mb-1 ml-1">
              {senderName}
            </div>
          )}
          {renderMessageContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="msg-row msg-row--received group">
      <Avatar
        className={`w-10 h-10 mr-3 shrink-0 ring-2 ${theme.messages.avatarRing}`}
      >
        <AvatarImage
          src={senderAvatar || "/placeholder.svg"}
          alt={senderName}
        />
        <UserAvatarFallback name={senderName} size="md" />
      </Avatar>

      <div className="msg-bubble-wrapper">
        {roomType === "GROUP" && senderName && (
          <div className="text-xs font-medium text-gray-600 mb-1 ml-1">
            {senderName}
          </div>
        )}

        {isMediaMessage ? (
          <div>{renderMessageContent()}</div>
        ) : (
          <div
            className={`msg-bubble msg-bubble--received ${theme.messages.receivedBubbleText} border ${theme.messages.receivedBubbleBorder}`}
            style={theme.messages.receivedBubbleStyle}
          >
            {renderMessageContent()}
          </div>
        )}
        <div className="msg-time">
          {formatMessageTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
