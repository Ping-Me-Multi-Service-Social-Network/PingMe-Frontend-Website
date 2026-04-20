import { useState } from "react";
import { Phone, Video, PhoneIncoming } from "lucide-react";
import { useCall } from "@/features/websocket";
import { toast } from "sonner";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";

interface CallButtonProps {
  // undefined = group room (gọi cả phòng, không cần target)
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
  const { callState, initiateCall, pendingJoin, joinCall } = useCall();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation("call");

  const isGroup = !targetUserId;
  const isCallActive = ["calling", "ringing", "connected"].includes(callState.status);

  // Có lời mời nhóm đã từ chối cho đúng room này không?
  const hasPendingJoin = isGroup && pendingJoin?.roomId === roomId;

  const isDisabled = isCallActive || isLoading || (!isGroup && !isTargetOnline);

  const getTitle = (callTypeName: string) => {
    if (hasPendingJoin) return t("button.joinOngoing");
    if (isCallActive) return t("button.active");
    if (!isGroup && !isTargetOnline) return t("button.offline", { name: targetName });
    if (isGroup) return t("button.group", { type: callTypeName });
    return callTypeName === "video" ? t("button.video") : t("button.audio");
  };

  const handleJoinCall = async () => {
    if (!pendingJoin || isLoading) return;
    setIsLoading(true);
    try {
      await joinCall(pendingJoin);
    } catch (error) {
      console.error("[CallButton] Error joining call:", error);
      toast.error(t("button.joinError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartVideoCall = async () => {
    if (isDisabled) return;
    setIsLoading(true);
    try {
      await initiateCall(roomId, "VIDEO", targetUserId);
    } catch (error) {
      console.error("[CallButton] Error starting video call:", error);
      toast.error(t("button.startVideoError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAudioCall = async () => {
    if (isDisabled) return;
    setIsLoading(true);
    try {
      await initiateCall(roomId, "AUDIO", targetUserId);
    } catch (error) {
      console.error("[CallButton] Error starting audio call:", error);
      toast.error(t("button.startAudioError"));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Nút Join đang có call nhóm (thay thế toàn bộ khi hasPendingJoin) ──
  if (hasPendingJoin) {
    if (variant === "sidebar" && theme) {
      return (
        <div className="flex flex-col items-center gap-2 col-span-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleJoinCall}
            disabled={isLoading || isCallActive}
            className={`h-12 w-12 rounded-full bg-green-500/10 border-green-500 text-green-600
              animate-pulse hover:bg-green-500 hover:text-white transition-all`}
            title={t("button.joinOngoing")}
          >
            {isLoading ? <LoadingSpinner size="sm" /> : <PhoneIncoming className="h-5 w-5" />}
          </Button>
          <span className={`text-xs font-medium text-green-600`}>
            {t("button.joinOngoing")}
          </span>
        </div>
      );
    }

    // Header variant
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleJoinCall}
        disabled={isLoading || isCallActive}
        className="flex items-center gap-1.5 px-3 text-green-600 animate-pulse
          hover:bg-green-500/10 hover:text-green-700 transition-all"
        title={t("button.joinOngoing")}
        aria-label="Join ongoing group call"
      >
        {isLoading
          ? <LoadingSpinner size="sm" />
          : <PhoneIncoming className="h-4 w-4" />
        }
        <span className="text-xs font-medium">{t("button.joinOngoing")}</span>
      </Button>
    );
  }

  // ── Sidebar variant ──────────────────────────────────────────────────────
  if (variant === "sidebar" && theme) {
    return (
      <>
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleStartAudioCall}
            disabled={isDisabled}
            className={`h-12 w-12 rounded-full bg-transparent transition-all ${
              isDisabled ? "opacity-50 cursor-not-allowed" : theme.sidebar.buttonHoverBg
            } ${theme.sidebar.buttonBorder}`}
            title={getTitle("audio")}
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

        <div className="flex flex-col items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleStartVideoCall}
            disabled={isDisabled}
            className={`h-12 w-12 rounded-full bg-transparent transition-all ${
              isDisabled ? "opacity-50 cursor-not-allowed" : theme.sidebar.buttonHoverBg
            } ${theme.sidebar.buttonBorder}`}
            title={getTitle("video")}
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

  // ── Header variant (default) ─────────────────────────────────────────────
  return (
    <div className="flex items-center gap-1 mr-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleStartAudioCall}
        disabled={isDisabled}
        title={getTitle("audio")}
        className={theme ? theme.header.iconHoverBg : ""}
        aria-label="Start audio call"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <Phone className={`h-5 w-5 ${theme ? theme.header.iconColor : "text-zinc-500"}`} />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleStartVideoCall}
        disabled={isDisabled}
        title={getTitle("video")}
        className={theme ? theme.header.iconHoverBg : ""}
        aria-label="Start video call"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <Video className={`h-5 w-5 ${theme ? theme.header.iconColor : "text-zinc-500"}`} />
        )}
      </Button>
    </div>
  );
}
