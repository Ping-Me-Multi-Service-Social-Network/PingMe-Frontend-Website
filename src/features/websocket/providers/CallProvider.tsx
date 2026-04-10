/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";

import type { CallType, CallState } from "@/types/call/call";
import type { SignalingPayload } from "../events/systemEvents";
import { sendSignalingApi } from "@/services/call/callApi";
import { lookupByIdApi } from "@/services/user/userLookupApi";
import { toast } from "sonner";
import { CallNotification } from "@/components/call/CallNotification";
import { ZegoCallUI } from "@/components/call/ZegoCallUI";
import type { RoomParticipantResponse } from "@/types/chat/room";
import { useAppSelector } from "@/features/hooks";
import { SocketManager } from "../core/socketManager";

// --- Context Definition ---
interface CallContextType {
  callState: CallState;
  isInCall: boolean;

  // Call control
  initiateCall: (
    targetUserId: number,
    roomId: number,
    callType: CallType
  ) => Promise<void>;
  answerCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  endCall: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

// --- Hook to use the context ---
export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within CallProvider");
  }
  return context;
}

// --- Provider Component ---
interface CallProviderProps {
  children: ReactNode;
}

export function CallProvider({ children }: CallProviderProps) {
  const { userSession } = useAppSelector((state) => state.auth);

  // --- STATE ---
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<CallType>("VIDEO");

  const [callState, setCallState] = useState<CallState>({
    status: "idle",
    callType: "VIDEO",
    isInitiator: false,
  });

  const [callerInfo, setCallerInfo] = useState<
    RoomParticipantResponse | undefined
  >(undefined);
  const activeRoomIdRef = useRef<string>("");

  // --- HÀM RESET ---
  const resetCallState = useCallback(() => {
    console.log("[CallProvider] START RESET...");

    // Đợi 200ms cho Zego dọn dẹp xong mới Unmount hoàn toàn
    setTimeout(() => {
      console.log("[CallProvider] HARD RESET NOW");
      setIsInCall(false);
      setIsIncomingCall(false);
      activeRoomIdRef.current = "";
      setCallState({ status: "idle", callType: "VIDEO", isInitiator: false });
    }, 200);
  }, []);

  // --- WEBSOCKET ---
  useEffect(() => {
    if (!userSession?.id) return;

    const handleSignaling = (event: SignalingPayload) => {
      if (event.senderId === userSession.id) return;

      console.log(
        `[PingMe CallProvider] Signal: ${event.type} from ${event.senderId}`
      );

      if (event.type === "INVITE") {
      if (isInCall || isIncomingCall) return;

      activeRoomIdRef.current = event.roomId.toString();
      const incomingCallType = event.payload?.callType || "VIDEO";

      setCallerInfo({
        userId: event.senderId,
        name: "Đang tải...",
        avatarUrl: "null",
        status: "ONLINE",
        role: "MEMBER",
        lastReadMessageId: null,
        lastReadAt: null,
      });

      setCallType(incomingCallType);
      setCallState({
        status: "ringing",
        callType: incomingCallType,
        callerId: event.senderId,
        roomId: event.roomId,
        isInitiator: false,
      });
      setIsIncomingCall(true);

        lookupByIdApi(event.senderId)
          .then((res) => {
            const userInfo = res.data.data;
            setCallerInfo((prev) =>
              prev
                ? {
                    ...prev,
                    name: userInfo.name,
                    avatarUrl: userInfo.avatarUrl,
                  }
                : undefined
            );
          })
          .catch((err) => {
            console.error("[PingMe CallProvider] Lỗi lấy thông tin người gọi", err);
          });
      } else if (event.type === "ACCEPT") {
        console.log("Đối phương đã nghe máy!");
        setCallState((prev) => ({ ...prev, status: "connected" }));
      } else if (event.type === "REJECT") {
        console.log("Đối phương từ chối -> Tắt máy ngay");
        toast.info("Người dùng đang bận");

        setCallState((prev) => ({ ...prev, status: "ended" }));
        resetCallState();
      } else if (event.type === "HANGUP") {
        console.log("[PingMe CallProvider] NHẬN TÍN HIỆU KẾT THÚC -> TẮT MÁY");
        toast.info("Cuộc gọi kết thúc");

        setCallState((prev) => ({ ...prev, status: "ended" }));
        resetCallState();
      }
    };

    const unsub = SocketManager.on("SIGNALING", handleSignaling);
    return () => unsub();
  }, [
    userSession?.id,
    isInCall,
    isIncomingCall,
    resetCallState,
  ]);

  // --- ACTIONS ---
  const initiateCall = useCallback(
    async (
      targetUserId: number,
      roomId: number,
      selectedCallType: CallType
    ) => {
      activeRoomIdRef.current = roomId.toString();
      setCallType(selectedCallType);

      setCallState({
        status: "calling",
        callType: selectedCallType,
        targetUserId,
        roomId,
        isInitiator: true,
        startTime: new Date(),
      });

      // Bật UI Zego ngay để chờ
      setIsInCall(true);

      await sendSignalingApi({
        type: "INVITE",
        roomId: roomId,
        payload: { targetUserId, callType: selectedCallType },
      });
    },
    []
  );

  const answerCall = useCallback(async () => {
    setIsIncomingCall(false);
    setCallState((prev) => ({ ...prev, status: "connected" }));

    await sendSignalingApi({
      type: "ACCEPT",
      roomId: Number(activeRoomIdRef.current),
      payload: {},
    });

    setIsInCall(true);
  }, []);

  const rejectCall = useCallback(async () => {
    const roomIdToReject = activeRoomIdRef.current;
    setIsIncomingCall(false);

    // Tắt UI ngay
    setCallState((prev) => ({ ...prev, status: "rejected" }));
    resetCallState();

    if (roomIdToReject) {
      await sendSignalingApi({
        type: "REJECT",
        roomId: Number(roomIdToReject),
        payload: { reason: "REJECTED_BY_USER" },
      }).catch(console.error);
    }
  }, [resetCallState]);

  const endCall = useCallback(() => {
    // Tắt UI ngay
    setCallState((prev) => ({ ...prev, status: "ended" }));
    setIsInCall(false);

    const roomIdToEnd = activeRoomIdRef.current;
    resetCallState();

    if (roomIdToEnd) {
      sendSignalingApi({
        type: "HANGUP",
        roomId: Number(roomIdToEnd),
        payload: {},
      }).catch(console.error);
    }
  }, [resetCallState]);

  const value: CallContextType = {
    callState,
    isInCall,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
  };

  return (
    <CallContext.Provider value={value}>
      {children}

      {/* Modal báo cuộc gọi đến */}
      {isIncomingCall && !isInCall && (
        <CallNotification
          caller={callerInfo}
          callType={callType}
          onAccept={answerCall}
          onReject={rejectCall}
        />
      )}

      {/* Giao diện Video Call */}
      {isInCall && userSession && (
        <ZegoCallUI
          roomId={callState.roomId?.toString() || ""}
          currentUserId={userSession.id.toString()}
          currentUserName={userSession.name || "User"}
          callType={callType}
          onEndCall={endCall}
        />
      )}
    </CallContext.Provider>
  );
}
