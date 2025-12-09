import {
  useCallback,
  useEffect,
  useState,
  useRef, // Thêm useMemo
  type ReactNode,
} from "react";
import { CallContext, type CallContextType } from "@/contexts/CallContext";
import { connectGlobalWS } from "@/services/ws/friendshipSocket";
import { sendSignalingApi } from "@/services/call/callApi";
import { useAppSelector } from "@/features/hooks";
import { CallNotification } from "./CallNotification";
import { ZegoCallUI } from "./ZegoCallUI";
import type { RoomParticipantResponse } from "@/types/chat/room";
import type { SignalingResponse, CallType, CallState } from "@/types/call/call";
import { lookupByIdApi } from "@/services/common/userLookupApi";
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

    connectGlobalWS({
      baseUrl: import.meta.env.VITE_BACKEND_BASE_URL,
      onFriendEvent: () => {},
      onStatus: () => {},

      onSignalEvent: async (event: SignalingResponse) => {
        if (event.senderId === userSession.id) return;

        console.log(
          `[CallProvider] Signal: ${event.type} from ${event.senderId}`
        );

        if (event.type === "INVITE") {
          // Logic nhận cuộc gọi (như cũ)
          if (isInCall || isIncomingCall) return;

          activeRoomIdRef.current = event.roomId.toString();
          const incomingCallType = event.payload?.callType || "VIDEO";

          // Mock info
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

          // Fetch info
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
            console.error("[CallProvider] Lỗi lấy thông tin người gọi", e);
          }
        } else if (event.type === "ACCEPT") {
          console.log("Đối phương đã nghe máy!");
          setCallState((prev) => ({ ...prev, status: "connected" }));
        }

        // --- XỬ LÝ REJECT (Sửa lại) ---
        else if (event.type === "REJECT") {
          console.log("Đối phương từ chối -> Tắt máy ngay (như Hangup)");
          toast.info("Người dùng đang bận");

          // --- SỬA LẠI: LÀM ĐƠN GIẢN NHƯ HANGUP ---
          // Không cần set status 'rejected' làm gì để tránh trigger useEffect thừa ở con
          setCallState((prev) => ({ ...prev, status: "ended" }));

          // Gọi hàm reset ngay lập tức để gỡ UI
          resetCallState();
        }

        // --- XỬ LÝ HANGUP ---
        else if (event.type === "HANGUP") {
          console.log("!!! NHẬN TÍN HIỆU KẾT THÚC -> TẮT MÁY !!!");
          toast.info("Cuộc gọi kết thúc");

          setCallState((prev) => ({ ...prev, status: "ended" }));
          resetCallState();
        }
      },
    });
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
