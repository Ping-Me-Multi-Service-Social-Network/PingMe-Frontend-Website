import type { MessageResponse } from "@/types/chat/message";
import type { WeatherResponse } from "@/types/weather";
import MessageImage from "./MessageImage";
import MessageVideo from "./MessageVideo";
import MessageFile from "./MessageFile";
import WeatherMessageBubble from "./WeatherMessageBubble";
import { formatMessageTime } from "../../utils/formatMessageTime";
import { MoreHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { recallMessageApi } from "@/services/chat";
import { toast } from "sonner";
import { differenceInHours } from "date-fns";
import type { ChatTheme } from "../../utils/chatThemes";

interface SentMessageBubbleProps {
  message: MessageResponse;
  onMessageRecalled?: (messageId: number) => void;
  theme: ChatTheme;
}

export default function SentMessageBubble({
  message,
  onMessageRecalled,
  theme,
}: SentMessageBubbleProps) {
  const isMediaMessage =
    message.type === "IMAGE" ||
    message.type === "VIDEO" ||
    message.type === "FILE";
  const isWeatherMessage = message.type === "WEATHER";

  const handleRecallMessage = async () => {
    const messageDate = new Date(message.createdAt);
    const hoursDiff = differenceInHours(new Date(), messageDate);

    if (hoursDiff >= 24) {
      toast.error("Không thể thu hồi tin nhắn quá 24 giờ");
      return;
    }

    try {
      await recallMessageApi(message.id);
      toast.success("Đã thu hồi tin nhắn");
      onMessageRecalled?.(message.id);
    } catch {
      toast.error("Không thể thu hồi tin nhắn");
    }
  };

  const renderMessageContent = () => {
    if (!message.isActive) {
      return (
        <p className="text-md italic text-black select-none">
          Tin nhắn đã được thu hồi
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
              Không thể hiển thị thông tin thời tiết
            </p>
          );
        }
      }
      case "TEXT":
      default:
        return (
          <p className="text-sm leading-relaxed break-words">
            {message.content}
          </p>
        );
    }
  };

  if (isWeatherMessage && message.isActive) {
    return <>{renderMessageContent()}</>;
  }

  return (
    <div className="flex justify-end mb-4 group">
      <div className="max-w-[80%] relative">
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
                Thu hồi tin nhắn
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {isMediaMessage ? (
          <div>{renderMessageContent()}</div>
        ) : (
          <div
            className={`${theme.messages.sentBubbleBg} ${theme.messages.sentBubbleText} rounded-2xl rounded-br-md px-4 py-3 shadow-sm`}
          >
            {renderMessageContent()}
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-1.5 text-right opacity-70">
          {formatMessageTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
