import { useState } from "react";
import { Phone, Video } from "lucide-react";
import { useCall } from "@/features/websocket";
import { toast } from "sonner";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button.tsx";

interface CallButtonProps {
  targetUserId?: number;
  roomId: number;
  isTargetOnline?: boolean;
  targetName?: string;
  variant?: "header" | "sidebar";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  theme?: any;
  audioLabel?: string;
  videoLabel?: string;
}

export function CallButton({
  targetUserId,
  roomId,
  isTargetOnline = false,
  targetName = "User",
  variant = "header",
  theme,
  audioLabel,
  videoLabel,
}: CallButtonProps) {
  const { callState, initiateCall } = useCall();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation("call");

  const isCallActive = ["calling", "ringing", "connected"].includes(
    callState.status
  );
  const isDisabled = !targetUserId || !isTargetOnline || isCallActive || isLoading;

  const handleStartVideoCall = async () => {
    if (isDisabled || !targetUserId) return;

    setIsLoading(true);
    try {
      await initiateCall(targetUserId, roomId, "VIDEO");
    } catch (error) {
      console.error("[CallButton] Error starting video call:", error);
      toast.error(t("button.startVideoError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAudioCall = async () => {
    if (isDisabled || !targetUserId) return;

    setIsLoading(true);
    try {
      await initiateCall(targetUserId, roomId, "AUDIO");
    } catch (error) {
      console.error("[CallButton] Error starting audio call:", error);
      toast.error(t("button.startAudioError"));
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "sidebar" && theme) {
    return (
      <>
        {/* Audio Call Button (Sidebar) */}
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleStartAudioCall}
            disabled={isDisabled}
            className={`h-12 w-12 rounded-full bg-transparent transition-all ${
              isDisabled ? "opacity-50 cursor-not-allowed" : theme.sidebar.buttonHoverBg
            } ${theme.sidebar.buttonBorder}`}
            title={
              !isTargetOnline && targetUserId
                ? t("button.offline", { name: targetName })
                : isCallActive
                  ? t("button.active")
                  : t("button.audio")
            }
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Phone className={`h-5 w-5 ${theme.sidebar.iconColor}`} />
            )}
          </Button>
          <span className={`text-xs ${theme.sidebar.textSecondary}`}>
            {audioLabel || t("button.audio")}
          </span>
        </div>

        {/* Video Call Button (Sidebar) */}
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleStartVideoCall}
            disabled={isDisabled}
            className={`h-12 w-12 rounded-full bg-transparent transition-all ${
              isDisabled ? "opacity-50 cursor-not-allowed" : theme.sidebar.buttonHoverBg
            } ${theme.sidebar.buttonBorder}`}
            title={
              !isTargetOnline && targetUserId
                ? t("button.offline", { name: targetName })
                : isCallActive
                  ? t("button.active")
                  : t("button.video")
            }
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Video className={`h-5 w-5 ${theme.sidebar.iconColor}`} />
            )}
          </Button>
          <span className={`text-xs ${theme.sidebar.textSecondary}`}>
            {videoLabel || t("button.video")}
          </span>
        </div>
      </>
    );
  }

  // Header Variant (Default)
  return (
    <div className="flex items-center gap-1 mr-1">
      {/* Audio Call Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleStartAudioCall}
        disabled={isDisabled}
        title={
          !isTargetOnline && targetUserId
            ? t("button.offline", { name: targetName })
            : isCallActive
              ? t("button.active")
              : t("button.audio")
        }
        className={theme ? theme.header.iconHoverBg : ""}
        aria-label="Start audio call"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <Phone className={`h-5 w-5 ${theme ? theme.header.iconColor : 'text-zinc-500'}`} />
        )}
      </Button>

      {/* Video Call Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleStartVideoCall}
        disabled={isDisabled}
        title={
          !isTargetOnline && targetUserId
            ? t("button.offline", { name: targetName })
            : isCallActive
              ? t("button.active")
              : t("button.video")
        }
        className={theme ? theme.header.iconHoverBg : ""}
        aria-label="Start video call"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <Video className={`h-5 w-5 ${theme ? theme.header.iconColor : 'text-zinc-500'}`} />
        )}
      </Button>
    </div>
  );
}
