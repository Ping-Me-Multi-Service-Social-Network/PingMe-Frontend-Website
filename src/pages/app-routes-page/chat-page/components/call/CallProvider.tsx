import {
  useCallback,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { CallContext, type CallContextType } from "@/contexts/CallContext.tsx";
import { sendSignalingApi } from "@/services/call/callApi.ts";
import { useAppSelector } from "@/features/hooks.ts";
import { CallNotification } from "./CallNotification.tsx";
import { ZegoCallUI } from "./ZegoCallUI.tsx";
import type { RoomParticipantResponse } from "@/types/chat/room";
import type {
  SignalingResponse,
  CallType,
  CallState,
} from "@/types/call/call.ts";
import { lookupByIdApi } from "@/services/user/userLookupApi.ts";
import { toast } from "sonner";

interface CallProviderProps {
  children: ReactNode;
}

export function CallProvider({ children }: CallProviderProps) {
  const { userSession } = useAppSelector((state) => state.auth);

  // --- STATE ---
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<CallType>("VIDEO");
  // const [isEndingCall, setIsEndingCall] = useState(false);

  const [callState, setCallState] = useState<CallState>({
    status: "idle",
    callType: "VIDEO",
    isInitiator: false,
  });

  const [callerInfo, setCallerInfo] = useState<
    RoomParticipantResponse | undefined
  >(undefined);
  const activeRoomIdRef = useRef<string>("");

  // --- LOGIC HIỂN THỊ ZEGO (Quan trọng: Tính toán kỹ lưỡng điều kiện hiển thị) ---
  // Chỉ hiện Zego khi:
  // 1. isInCall = true
  // 2. Status không phải là rejected (đã từ chối) hoặc ended (đã kết thúc)
  // const shouldShowZego = useMemo(() => {
  //   return (
  //     isInCall &&
  //     userSession &&
  //     callState.status !== "rejected" &&
  //     callState.status !== "ended"
  //   );
  // }, [isInCall, userSession, callState.status]);

  // --- HÀM RESET ---
  const resetCallState = useCallback(() => {
    console.log("[CallProvider] START RESET...");

    // 1. Bật cờ báo hiệu cho Zego biết để tự hủy
    // setIsEndingCall(true);

    // 2. Đợi 200ms cho Zego dọn dẹp xong mới Unmount hoàn toàn
    setTimeout(() => {
      console.log("[CallProvider] HARD RESET NOW");
      setIsInCall(false);
      setIsIncomingCall(false);
      // setIsEndingCall(false); // Reset cờ
      activeRoomIdRef.current = "";
      setCallState({ status: "idle", callType: "VIDEO", isInitiator: false });
    }, 200);
  }, []);

  // --- WEBSOCKET ---
  useEffect(() => {
    if (!userSession?.id) return;

    const handleSignalingEvent = async (e: Event) => {
      const event = (e as CustomEvent).detail as SignalingResponse;

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

        try {
          const res = await lookupByIdApi(event.senderId);
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
        } catch (e) {
          console.error("[PingMe CallProvider] Lỗi lấy thông tin người gọi", e);
        }
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

    window.addEventListener("socket:signaling", handleSignalingEvent);

    return () => {
      window.removeEventListener("socket:signaling", handleSignalingEvent);
    };
  }, [userSession?.id, isInCall, isIncomingCall, resetCallState]);

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
  } as unknown as CallContextType;

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
      {/* SỬA: Chỉ check isInCall, bỏ shouldShowZego đi để tránh unmount quá sớm */}
      {isInCall && userSession && (
        <ZegoCallUI
          roomId={activeRoomIdRef.current}
          currentUserId={userSession.id.toString()}
          currentUserName={userSession.name || "User"}
          callType={callType}
          // QUAN TRỌNG: Truyền status xuống để con biết khi nào tự hủy
          // callStatus={callState.status}
          onEndCall={endCall}
        />
      )}
    </CallContext.Provider>
  );
}
