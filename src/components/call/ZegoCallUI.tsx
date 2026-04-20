import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import type { CallType } from "@/types/call/call.ts";

interface ZegoCallUIProps {
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  callType: CallType;
  isGroup?: boolean;
  onEndCall: () => void;
}

function ZegoCallUIInternal({
  roomId,
  currentUserId,
  currentUserName,
  callType,
  isGroup = false,
  onEndCall,
}: ZegoCallUIProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zpRef = useRef<ZegoUIKitPrebuilt | null>(null);
  const isInitializedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
  const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !appID || !serverSecret || isInitializedRef.current) return;

    isInitializedRef.current = true;

    const initZego = async () => {
      try {
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomId,
          currentUserId,
          currentUserName,
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        // Group call: dùng VideoConference cho cả audio và video (hỗ trợ N-N)
        // 1-1 call: VideoConference cho video, OneONoneCall cho audio
        const scenario = isGroup || callType === "VIDEO"
          ? ZegoUIKitPrebuilt.VideoConference
          : ZegoUIKitPrebuilt.OneONoneCall;

        zp.joinRoom({
          container,
          scenario: { mode: scenario },
          showPreJoinView: false,
          turnOnCameraWhenJoining: callType === "VIDEO",
          turnOnMicrophoneWhenJoining: true,
          showScreenSharingButton: true,
          showUserList: isGroup,
          showLayoutButton: isGroup,

          onLeaveRoom: () => {
            // Người dùng chủ động rời → kết thúc về phía mình
            onEndCall();
          },

          onUserLeave: () => {
            // 1-1: đối phương rời → kết thúc ngay
            // Group: người khác rời → KHÔNG kết thúc, CallProvider xử lý qua signal LEAVE
            if (!isGroup) {
              onEndCall();
            }
          },
        });
      } catch (err: unknown) {
        console.error("[ZegoCallUI] Init error:", err);
        setError("Không thể khởi tạo cuộc gọi");
        isInitializedRef.current = false;
      }
    };

    initZego();

    return () => {
      isInitializedRef.current = true;

      const zp = zpRef.current;
      zpRef.current = null;

      if (zp) {
        setTimeout(() => {
          try {
            zp.destroy();
          } catch (e) {
            console.warn("[ZegoCallUI] Destroy error:", e);
          }
        }, 0);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center z-[9999]">
        <div className="text-center">
          <p className="text-lg mb-4">{error}</p>
          <button
            onClick={onEndCall}
            className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

export const ZegoCallUI = React.memo(ZegoCallUIInternal, (prev, next) => {
  return (
    prev.roomId === next.roomId &&
    prev.currentUserId === next.currentUserId &&
    prev.isGroup === next.isGroup
  );
});
