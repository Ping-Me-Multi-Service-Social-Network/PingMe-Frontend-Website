import { useState } from "react";
import { Phone, Video } from "lucide-react";
import { useCall } from "@/features/websocket";
import { toast } from "sonner";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import { useTranslation } from "react-i18next";

interface CallButtonProps {
  targetUserId: number;
  roomId: number;
  isTargetOnline: boolean;
  targetName?: string;
}

export function CallButton({
  targetUserId,
  roomId,
  isTargetOnline,
  targetName = "User",
}: CallButtonProps) {
  const { callState, initiateCall } = useCall();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation("call");

  const isCallActive = ["calling", "ringing", "connected"].includes(
    callState.status
  );
  const isDisabled = !isTargetOnline || isCallActive || isLoading;

  const handleStartVideoCall = async () => {
    if (isDisabled) return;

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
    if (isDisabled) return;

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

  return (
    <div className="flex items-center gap-2">
      {/* Video Call Button */}
      <button
        onClick={handleStartVideoCall}
        disabled={isDisabled}
        title={
          !isTargetOnline
            ? t("button.offline", { name: targetName })
            : isCallActive
              ? t("button.active")
              : t("button.video")
        }
        className={`p-2 rounded-full transition-all ${isDisabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        aria-label="Start video call"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <Video className="w-5 h-5" />
        )}
      </button>

      {/* Audio Call Button */}
      <button
        onClick={handleStartAudioCall}
        disabled={isDisabled}
        title={
          !isTargetOnline
            ? t("button.offline", { name: targetName })
            : isCallActive
              ? t("button.active")
              : t("button.audio")
        }
        className={`p-2 rounded-full transition-all ${isDisabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        aria-label="Start audio call"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <Phone className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
