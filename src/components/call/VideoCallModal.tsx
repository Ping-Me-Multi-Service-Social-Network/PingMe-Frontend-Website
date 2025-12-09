import { useEffect, useRef, useState } from "react";
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useCallContext } from "@/hooks/useCallContext";
import type { RoomParticipantResponse } from "@/types/chat/room";

interface VideoCallModalProps {
  remoteUser?: RoomParticipantResponse;
}

export function VideoCallModal({ remoteUser }: VideoCallModalProps) {
  const { callState, localStream, remoteStream, endCall } = useCallContext();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  // Stream local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log(
        "[v0] VideoCallModal: Setting local stream, tracks:",
        localStream
          .getTracks()
          .map((t) => ({
            kind: t.kind,
            enabled: t.enabled,
            readyState: t.readyState,
          }))
      );
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Stream remote video
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log(
        "[v0] VideoCallModal: Setting remote stream, tracks:",
        remoteStream
          .getTracks()
          .map((t) => ({
            kind: t.kind,
            enabled: t.enabled,
            readyState: t.readyState,
          }))
      );
      remoteVideoRef.current.srcObject = remoteStream;

      // Force play remote video (for autoplay policy)
      remoteVideoRef.current.play().catch((err) => {
        console.error("[v0] VideoCallModal: Failed to play remote video:", err);
      });
    }
  }, [remoteStream]);

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState.status === "connected" && callState.startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - new Date(callState.startTime!).getTime()) / 1000
        );
        setCallDuration(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState.status, callState.startTime]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle mic
  const handleToggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicEnabled(!isMicEnabled);
    }
  };

  // Toggle video
  const handleToggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  // Show only during active call
  if (callState.status !== "connected") {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-40">
      {/* Remote video (full screen) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Local video (picture in picture) */}
      <div className="absolute bottom-6 right-6 w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border-4 border-white shadow-lg">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>

      {/* Call info and controls */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 bg-gradient-to-b from-black/50 to-transparent">
        {/* Remote user info */}
        <div className="text-white">
          <h3 className="text-lg font-semibold">
            {remoteUser?.name || "User"}
          </h3>
          <p className="text-sm opacity-90">{formatDuration(callDuration)}</p>
        </div>

        {/* Call type badge */}
        <div className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
          {callState.callType === "VIDEO" ? "Video Call" : "Audio Call"}
        </div>
      </div>

      {/* Control buttons */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 p-6 bg-gradient-to-t from-black/50 to-transparent">
        {/* Mic toggle */}
        <button
          onClick={handleToggleMic}
          className={`p-4 rounded-full transition-colors ${
            isMicEnabled
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-red-600 hover:bg-red-700"
          }`}
          aria-label="Toggle microphone"
        >
          {isMicEnabled ? (
            <Mic className="w-6 h-6 text-white" />
          ) : (
            <MicOff className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Video toggle */}
        {callState.callType === "VIDEO" && (
          <button
            onClick={handleToggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoEnabled
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-600 hover:bg-red-700"
            }`}
            aria-label="Toggle video"
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>
        )}

        {/* End call */}
        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
          aria-label="End call"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
