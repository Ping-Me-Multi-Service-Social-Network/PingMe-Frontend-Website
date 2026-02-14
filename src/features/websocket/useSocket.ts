import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/features/hooks";
import { SocketManager } from "./socketManager";
import { toast } from "sonner";
// Actions are dispatched within SocketManager

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const { userSession } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!userSession) return;

    console.log("[PingMe] Connecting SocketManager via useSocket...");

    SocketManager.connect({
      baseUrl: import.meta.env.VITE_BACKEND_BASE_URL,
      dispatch: dispatch,

      onFriendEvent: (ev) => {
        if (ev.type === "INVITED") {
          toast.info(
            `Bạn nhận được lời mời kết bạn từ ${ev.userSummaryResponse.name}`
          );
        } else if (ev.type === "ACCEPTED") {
          toast.success(
            `${ev.userSummaryResponse.name} đã chấp nhận lời mời kết bạn`
          );
        }
      },

      chat: {
        onRoomCreated: (ev) => {
          if (ev.roomResponse.roomType === "GROUP") {
            toast.success(
              `Bạn đã được thêm vào nhóm "${ev.roomResponse.name}"`
            );
          }
        },
        onMemberAdded: (ev) => {
          if (
            ev.targetUserId === userSession.id &&
            ev.roomResponse.roomType === "GROUP"
          ) {
            toast.success(
              `Bạn đã được thêm vào nhóm "${ev.roomResponse.name}"`
            );
          }
        },
      },

      onDisconnect: (reason?: string) => {
        console.warn("[PingMe] SocketManager disconnected:", reason);
      },
    });

    return () => {
      console.log("[PingMe] Disconnecting SocketManager...");
      SocketManager.disconnect();
    };
  }, [userSession, dispatch]);
};
