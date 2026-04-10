import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/features/hooks";
import { SocketManager } from "../core/socketManager";
import { toast } from "sonner";
// Actions are dispatched within SocketManager

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const { userSession, isLogin } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!userSession || !isLogin || !token) return;

    console.log("[PingMe] Connecting SocketManager via useSocket...");

    SocketManager.connect({
      baseUrl: import.meta.env.VITE_BACKEND_BASE_URL,
      dispatch: dispatch,
      onDisconnect: (reason?: string) => {
        console.warn("[PingMe] SocketManager disconnected:", reason);
      },
    });

    const unsubs = [
      SocketManager.on("FRIENDSHIP", (ev) => {
        // Bỏ qua event dội echo từ server
        if (ev.userSummaryResponse.id === Number(userSession?.id)) return;

        if (ev.type === "INVITED") {
          import("@/utils/inviteTracker").then((module) => {
            if (!module.hasSentInvite(ev.userSummaryResponse.id)) {
              toast.info(`Bạn nhận được lời mời kết bạn từ ${ev.userSummaryResponse.name}`);
            }
          });
        } else if (ev.type === "ACCEPTED") {
          toast.success(`${ev.userSummaryResponse.name} đã chấp nhận lời mời kết bạn`);
        }
      }),
      SocketManager.on("ROOM_CREATED", (ev) => {
        if (ev.roomResponse.roomType === "GROUP") {
          toast.success(`Bạn đã được thêm vào nhóm "${ev.roomResponse.name}"`);
        }
      }),
      SocketManager.on("ROOM_MEMBER_ADDED", (ev) => {
        if (ev.targetUserId === userSession.id && ev.roomResponse.roomType === "GROUP") {
          toast.success(`Bạn đã được thêm vào nhóm "${ev.roomResponse.name}"`);
        }
      }),
      SocketManager.on("AI_CHAT_ROOM_TITLE", (ev) => {
        console.log("[PingMe] AI chat room title updated:", ev);
        window.dispatchEvent(new CustomEvent("socket:update-ai-chat-room-title", { detail: ev }));
      })
    ];

    return () => {
      console.log("[PingMe] Disconnecting SocketManager...");
      unsubs.forEach((unsub) => unsub());
      SocketManager.disconnect();
    };
  }, [userSession, isLogin, dispatch]);
};
