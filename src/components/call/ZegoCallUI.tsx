"use client";

import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import type { CallType } from "@/types/call/call";

interface ZegoCallUIProps {
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  callType: CallType;
  onEndCall: () => void;
  // Bỏ prop callStatus đi, không cần nữa
}

function ZegoCallUIInternal({
  roomId,
  currentUserId,
  currentUserName,
  callType,
  onEndCall,
}: ZegoCallUIProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zpRef = useRef<ZegoUIKitPrebuilt | null>(null);
  const isInitializedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
  const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

  // 1. INIT EFFECT
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !appID || !serverSecret || isInitializedRef.current)
      return;

    console.log("[ZegoCallUI] Initializing...");
    isInitializedRef.current = true;

    const initZego = async () => {
      try {
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomId,
          currentUserId,
          currentUserName
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        zp.joinRoom({
          container: container,
          scenario: {
            mode:
              callType === "VIDEO"
                ? ZegoUIKitPrebuilt.VideoConference
                : ZegoUIKitPrebuilt.OneONoneCall,
          },
          showPreJoinView: false,
          turnOnCameraWhenJoining: callType === "VIDEO",
          turnOnMicrophoneWhenJoining: true,
          showScreenSharingButton: false,
          showUserList: false,

          onLeaveRoom: () => {
            console.log("[ZegoCallUI] Left room (User action)");
            onEndCall();
          },

          onUserLeave: () => {
            console.log("[ZegoCallUI] Remote user left -> Auto End");
            onEndCall();
          },
        });
      } catch (err: unknown) {
        console.error("[ZegoCallUI] Crash:", err);
        setError("Failed to initialize");
        isInitializedRef.current = false;
      }
    };

    initZego();

    // CLEANUP (Giữ nguyên logic cleanup an toàn này)
    return () => {
      console.log("[ZegoCallUI] Unmounting - Force Destroy");

      // Chặn init lại
      isInitializedRef.current = true;

      const zp = zpRef.current;
      zpRef.current = null;

      if (zp) {
        // Xóa nội dung DOM ngay lập tức để giao diện biến mất
        if (containerRef.current) {
          // containerRef.current.innerHTML = ""; // Có thể comment dòng này nếu gây lỗi
        }

        // Destroy Zego sau 1 tích tắc
        setTimeout(() => {
          try {
            zp.destroy();
            console.log("[ZegoCallUI] Destroyed");
          } catch (e) {
            // Kệ lỗi destroy
            console.warn("[ZegoCallUI] Destroy error:", e);
          }
        }, 0);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- XÓA BỎ useEffect lắng nghe callStatus Ở ĐÂY ---

  if (error)
    return (
      <div className="fixed inset-0 bg-black text-white p-10">{error}</div>
    );

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

// React.memo đơn giản hơn
export const ZegoCallUI = React.memo(ZegoCallUIInternal, (prev, next) => {
  // Chỉ render lại nếu Room hoặc User đổi (gần như không bao giờ đổi trong 1 cuộc gọi)
  return (
    prev.roomId === next.roomId && prev.currentUserId === next.currentUserId
  );
});
