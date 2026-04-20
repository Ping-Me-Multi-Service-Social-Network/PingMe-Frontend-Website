import { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import type { RoomParticipantResponse } from "@/types/chat/room";
import type { CallType } from "@/types/call/call.ts";
import { useTranslation } from "react-i18next";

interface CallNotificationProps {
  caller?: RoomParticipantResponse;
  callType?: CallType;
  participantCount?: number;
  onAccept: () => void;
  onReject: () => void;
}

export function CallNotification({
  caller,
  callType = "VIDEO",
  participantCount = 2,
  onAccept,
  onReject,
}: CallNotificationProps) {
  const { t } = useTranslation("call");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isGroup = participantCount > 2;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current
        .play()
        .catch(() => console.log("[CallNotification] Ring play skipped"));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleAnswer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onAccept();
  };

  const handleReject = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onReject();
  };

  const titleKey = isGroup
    ? callType === "VIDEO"
      ? "notification.groupVideoTitle"
      : "notification.groupAudioTitle"
    : callType === "VIDEO"
      ? "notification.videoTitle"
      : "notification.audioTitle";

  const callerDisplay = isGroup
    ? t("notification.groupParticipants", {
        name: caller?.name ?? t("notification.callerUnknown"),
        count: participantCount - 1,
      })
    : caller?.name ?? t("notification.callerUnknown");

  return (
    <>
      <audio ref={audioRef} src="/sounds/ringtone.mp3" />

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-sm mx-4 animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t(titleKey)}
            </h2>
            <p className="text-gray-600">
              <span className="font-semibold text-purple-600">{callerDisplay}</span>{" "}
              {t("notification.incoming")}
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="relative">
              <img
                src={
                  caller?.avatarUrl && caller.avatarUrl !== "null"
                    ? caller.avatarUrl
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(caller?.name ?? "User")}`
                }
                alt={caller?.name ?? "Caller"}
                className="w-28 h-28 rounded-full object-cover border-4 border-purple-100 shadow-xl"
              />
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </div>
          </div>

          {isGroup && (
            <p className="text-center text-sm text-gray-500 mb-6">
              {t("notification.groupSize", { count: participantCount })}
            </p>
          )}

          <div className="flex gap-6 justify-center">
            <button onClick={handleReject} className="flex flex-col items-center gap-2 group">
              <div className="p-4 bg-red-100 text-red-600 rounded-full transition-all group-hover:bg-red-600 group-hover:text-white shadow-md">
                <PhoneOff className="w-8 h-8" />
              </div>
              <span className="text-sm font-medium text-gray-600">{t("notification.reject")}</span>
            </button>

            <button onClick={handleAnswer} className="flex flex-col items-center gap-2 group">
              <div className="p-4 bg-green-100 text-green-600 rounded-full transition-all group-hover:bg-green-600 group-hover:text-white shadow-lg animate-bounce">
                {callType === "VIDEO" ? (
                  <Video className="w-8 h-8" />
                ) : (
                  <Phone className="w-8 h-8" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-600">{t("notification.answer")}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
