"use client";

import { useEffect, useRef } from "react";
import { Phone, PhoneOff } from "lucide-react";
import type { RoomParticipantResponse } from "@/types/chat/room";
import type { CallType } from "@/types/call/call";

interface CallNotificationProps {
  caller?: RoomParticipantResponse;
  callType?: CallType;
  onAccept: () => void;
  onReject: () => void;
}

export function CallNotification({
  caller,
  callType = "VIDEO",
  onAccept,
  onReject,
}: CallNotificationProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  return (
    <>
      <audio ref={audioRef} src="/sounds/ringtone.mp3" />

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-sm mx-4 animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {callType === "VIDEO"
                ? "Cuộc gọi video đến"
                : "Cuộc gọi thoại đến"}
            </h2>
            <p className="text-gray-600">
              <span className="font-semibold text-purple-600">
                {caller?.name || "Người dùng"}
              </span>{" "}
              đang gọi bạn...
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="relative">
              <img
                src={
                  caller?.avatarUrl ||
                  "https://ui-avatars.com/api/?name=" + (caller?.name || "User")
                }
                alt={caller?.name || "Caller"}
                className="w-28 h-28 rounded-full object-cover border-4 border-purple-100 shadow-xl"
              />
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </div>
          </div>

          <div className="flex gap-6 justify-center">
            <button
              onClick={handleReject}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="p-4 bg-red-100 text-red-600 rounded-full transition-all group-hover:bg-red-600 group-hover:text-white shadow-md">
                <PhoneOff className="w-8 h-8" />
              </div>
              <span className="text-sm font-medium text-gray-600">Từ chối</span>
            </button>

            <button
              onClick={handleAnswer}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="p-4 bg-green-100 text-green-600 rounded-full transition-all group-hover:bg-green-600 group-hover:text-white shadow-lg animate-bounce">
                {callType === "VIDEO" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8"
                  >
                    <path d="M15.545 13.982a8.001 8.001 0 003.053.621 8.001 8.001 0 00-6.099 6.099A8.001 8.001 0 009.4 22.056a8.001 8.001 0 00.621-3.053 8.002 8.002 0 004.387-7.557zM7.175 9.075A8.002 8.002 0 004.121 15.124a8.002 8.002 0 003.993 6.047A8.002 8.002 0 0015.976 21.02a8.002 8.002 0 006.047-3.993A8.002 8.002 0 0021.02 15.976a8.002 8.002 0 00-3.993-6.047A8.002 8.002 0 0015.976 4.121a8.002 8.002 0 00-6.047 3.993z" />
                  </svg>
                ) : (
                  <Phone className="w-8 h-8" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-600">Trả lời</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
