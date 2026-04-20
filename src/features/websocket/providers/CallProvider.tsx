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

// Lời mời nhóm đã từ chối — dùng để join lại sau
export interface PendingJoin {
  roomId: number;
  callSessionId: string;
  callType: CallType;
  callerName: string;
}

// --- Context Definition ---
interface CallContextType {
  callState: CallState;
  isInCall: boolean;
  pendingJoin: PendingJoin | null;

  // targetUserId optional: undefined = group call (gọi cả phòng)
  initiateCall: (roomId: number, callType: CallType, targetUserId?: number) => Promise<void>;
  answerCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  endCall: () => void;
  joinCall: (invite: PendingJoin) => Promise<void>;
  clearPendingJoin: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within CallProvider");
  }
  return context;
}

interface CallProviderProps {
  children: ReactNode;
}

const IDLE_STATE: CallState = {
  status: "idle",
  callType: "VIDEO",
  isInitiator: false,
  isGroup: false,
  activeParticipantCount: 0,
};

export function CallProvider({ children }: CallProviderProps) {
  const { userSession } = useAppSelector((state) => state.auth);

  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<CallType>("VIDEO");
  const [callState, setCallState] = useState<CallState>(IDLE_STATE);
  const [callerInfo, setCallerInfo] = useState<RoomParticipantResponse | undefined>(undefined);

  // Lưu lời mời nhóm đã từ chối để user có thể join lại sau
  const [pendingJoin, setPendingJoin] = useState<PendingJoin | null>(null);

  // Refs để tránh stale closure bên trong signal handler
  const activeRoomIdRef = useRef<string>("");
  const callSessionIdRef = useRef<string>("");
  const isInCallRef = useRef(false);
  const isIncomingCallRef = useRef(false);
  const callStateRef = useRef<CallState>(IDLE_STATE);

  useEffect(() => { isInCallRef.current = isInCall; }, [isInCall]);
  useEffect(() => { isIncomingCallRef.current = isIncomingCall; }, [isIncomingCall]);
  useEffect(() => { callStateRef.current = callState; }, [callState]);

  // --- RESET ---
  const resetCallState = useCallback(() => {
    setTimeout(() => {
      setIsInCall(false);
      setIsIncomingCall(false);
      activeRoomIdRef.current = "";
      callSessionIdRef.current = "";
      setCallState(IDLE_STATE);
    }, 200);
  }, []);

  // Xóa pending join (dùng khi call đã kết thúc hoàn toàn)
  const clearPendingJoin = useCallback(() => {
    setPendingJoin(null);
  }, []);

  // --- WEBSOCKET SIGNAL HANDLER ---
  useEffect(() => {
    if (!userSession?.id) return;

    const handleSignaling = (event: SignalingPayload) => {
      // Bỏ qua signal từ chính mình
      // Ngoại lệ: SESSION_ENDED là reply từ BE về chính user đã gửi ACCEPT
      if (event.senderId === userSession.id && event.type !== "SESSION_ENDED") return;

      console.log(`[CallProvider] Signal: ${event.type} | Session: ${event.callSessionId} | From: ${event.senderName}`);

      if (event.type === "INVITE") {
        if (isInCallRef.current || isIncomingCallRef.current) return;

        activeRoomIdRef.current = event.roomId.toString();
        callSessionIdRef.current = event.callSessionId;

        const incomingCallType = event.payload?.callType ?? "VIDEO";
        // BE trả về tổng room member count cho INVITE
        // → room có 3+ người = group, 2 người = 1-1
        const isGroup = event.activeParticipantCount > 2;

        setCallerInfo({
          userId: event.senderId,
          name: event.senderName || "Đang tải...",
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
          callSessionId: event.callSessionId,
          callerId: event.senderId,
          callerName: event.senderName,
          roomId: event.roomId,
          isInitiator: false,
          isGroup,
          activeParticipantCount: event.activeParticipantCount,
        });
        setIsIncomingCall(true);

        lookupByIdApi(event.senderId)
          .then((res) => {
            setCallerInfo((prev) =>
              prev
                ? { ...prev, name: res.data.data.name, avatarUrl: res.data.data.avatarUrl }
                : undefined
            );
          })
          .catch(() => {/* avatar không quan trọng */});

        return;
      }

      // Với các signal còn lại: bỏ qua nếu không đúng session
      if (
        event.callSessionId &&
        callSessionIdRef.current &&
        event.callSessionId !== callSessionIdRef.current
      ) {
        console.warn(`[CallProvider] Bỏ qua signal ${event.type} - session không khớp`);
        return;
      }

      if (event.type === "ACCEPT") {
        setCallState((prev) => ({
          ...prev,
          status: "connected",
          activeParticipantCount: event.activeParticipantCount,
        }));

      } else if (event.type === "REJECT") {
        const { isGroup } = callStateRef.current;

        if (isGroup) {
          // Group call: 1 người từ chối không ảnh hưởng call của người khác
          toast.info(`${event.senderName} đã từ chối tham gia cuộc gọi`);
          // Không reset — call vẫn tiếp tục cho những người còn lại
        } else {
          // 1-1: đối phương từ chối → kết thúc call
          toast.info("Người dùng đang bận hoặc từ chối cuộc gọi");
          setCallState((prev) => ({ ...prev, status: "rejected" }));
          resetCallState();
        }

      } else if (event.type === "LEAVE") {
        const remaining = event.activeParticipantCount;
        setCallState((prev) => ({ ...prev, activeParticipantCount: remaining }));

        if (remaining <= 1) {
          toast.info("Tất cả mọi người đã rời cuộc gọi");
          setCallState((prev) => ({ ...prev, status: "ended" }));
          setPendingJoin(null); // Session đã kết thúc, xóa pending join
          resetCallState();
        } else {
          toast.info(`${event.senderName} đã rời cuộc gọi`);
        }

      } else if (event.type === "HANGUP") {
        toast.info("Cuộc gọi đã kết thúc");
        setCallState((prev) => ({ ...prev, status: "ended" }));
        setPendingJoin(null); // Session đã bị force-end, xóa pending join
        resetCallState();

      } else if (event.type === "SESSION_ENDED") {
        // BE gửi khi user cố ACCEPT vào session đã chết
        toast.info("Cuộc gọi này đã kết thúc trước khi bạn tham gia");
        setPendingJoin(null);
        setIsIncomingCall(false);
        resetCallState();
      }
    };

    const unsub = SocketManager.on("SIGNALING", handleSignaling);
    return () => unsub();
  }, [userSession?.id, resetCallState]);

  // --- ACTIONS ---
  const initiateCall = useCallback(
    async (roomId: number, selectedCallType: CallType, targetUserId?: number) => {
      const sessionId = crypto.randomUUID();
      const isGroup = !targetUserId;

      activeRoomIdRef.current = roomId.toString();
      callSessionIdRef.current = sessionId;

      setCallType(selectedCallType);
      setCallState({
        status: "calling",
        callType: selectedCallType,
        callSessionId: sessionId,
        targetUserId,
        roomId,
        isInitiator: true,
        isGroup,
        activeParticipantCount: 1,
        startTime: new Date(),
      });

      setIsInCall(true);

      await sendSignalingApi({
        type: "INVITE",
        roomId,
        callSessionId: sessionId,
        payload: { callType: selectedCallType },
      });
    },
    []
  );

  const answerCall = useCallback(async () => {
    setIsIncomingCall(false);
    setCallState((prev) => ({ ...prev, status: "connected" }));
    setIsInCall(true);

    await sendSignalingApi({
      type: "ACCEPT",
      roomId: Number(activeRoomIdRef.current),
      callSessionId: callSessionIdRef.current,
      payload: {},
    });
  }, []);

  const rejectCall = useCallback(async () => {
    const roomIdToReject = activeRoomIdRef.current;
    const sessionId = callSessionIdRef.current;
    const { isGroup, callType: currentCallType, callerName } = callStateRef.current;

    setIsIncomingCall(false);

    // Group call: lưu lại để user có thể join sau
    if (isGroup && roomIdToReject && sessionId) {
      setPendingJoin({
        roomId: Number(roomIdToReject),
        callSessionId: sessionId,
        callType: currentCallType,
        callerName: callerName ?? "Nhóm",
      });
    }

    setCallState((prev) => ({ ...prev, status: "rejected" }));
    resetCallState();

    if (roomIdToReject) {
      await sendSignalingApi({
        type: "REJECT",
        roomId: Number(roomIdToReject),
        callSessionId: sessionId,
        payload: { reason: "REJECTED_BY_USER" },
      }).catch(console.error);
    }
  }, [resetCallState]);

  const endCall = useCallback(() => {
    const roomIdToEnd = activeRoomIdRef.current;
    const sessionId = callSessionIdRef.current;
    const { isGroup, activeParticipantCount } = callStateRef.current;

    setCallState((prev) => ({ ...prev, status: "ended" }));
    setIsInCall(false);
    resetCallState();

    if (roomIdToEnd) {
      // Group call + còn người khác → LEAVE (call tiếp tục)
      // 1-1 hoặc người cuối → HANGUP (kết thúc hẳn)
      const signalType = (isGroup && activeParticipantCount > 1) ? "LEAVE" : "HANGUP";

      sendSignalingApi({
        type: signalType,
        roomId: Number(roomIdToEnd),
        callSessionId: sessionId,
        payload: {},
      }).catch(console.error);
    }
  }, [resetCallState]);

  // Join call sau khi đã từ chối (chỉ dành cho group call)
  const joinCall = useCallback(async (invite: PendingJoin) => {
    activeRoomIdRef.current = invite.roomId.toString();
    callSessionIdRef.current = invite.callSessionId;

    setCallType(invite.callType);
    setCallState({
      status: "connected",
      callType: invite.callType,
      callSessionId: invite.callSessionId,
      roomId: invite.roomId,
      isInitiator: false,
      isGroup: true,
      activeParticipantCount: 1, // sẽ được cập nhật khi BE trả về ACCEPT response
    });

    setPendingJoin(null);
    setIsInCall(true);

    await sendSignalingApi({
      type: "ACCEPT",
      roomId: invite.roomId,
      callSessionId: invite.callSessionId,
      payload: {},
    });
  }, []);

  const value: CallContextType = {
    callState,
    isInCall,
    pendingJoin,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    joinCall,
    clearPendingJoin,
  };

  return (
    <CallContext.Provider value={value}>
      {children}

      {isIncomingCall && !isInCall && (
        <CallNotification
          caller={callerInfo}
          callType={callType}
          participantCount={callState.activeParticipantCount}
          onAccept={answerCall}
          onReject={rejectCall}
        />
      )}

      {isInCall && userSession && (
        <ZegoCallUI
          roomId={callState.roomId?.toString() ?? ""}
          currentUserId={userSession.id.toString()}
          currentUserName={userSession.name ?? "User"}
          callType={callType}
          isGroup={callState.isGroup}
          onEndCall={endCall}
        />
      )}
    </CallContext.Provider>
  );
}
