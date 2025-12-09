import { useCallback, useState } from "react";
import type { CallState, CallStatus, CallType } from "@/types/call/call";

const initialCallState: CallState = {
  status: "idle",
  callType: "VIDEO",
  isInitiator: false,
};

export function useCallState() {
  const [callState, setCallState] = useState<CallState>(initialCallState);

  const setCallStatus = useCallback((status: CallStatus) => {
    setCallState((prev) => ({ ...prev, status }));
  }, []);

  const setCallerInfo = useCallback(
    (
      callerId: number,
      targetUserId: number,
      roomId: number,
      isInitiator: boolean
    ) => {
      setCallState((prev) => ({
        ...prev,
        callerId,
        targetUserId,
        roomId,
        isInitiator,
      }));
    },
    []
  );

  const setCallType = useCallback((callType: CallType) => {
    setCallState((prev) => ({ ...prev, callType }));
  }, []);

  const setStartTime = useCallback(() => {
    setCallState((prev) => ({ ...prev, startTime: new Date() }));
  }, []);

  const setEndTime = useCallback(() => {
    setCallState((prev) => ({ ...prev, endTime: new Date() }));
  }, []);

  const setRejectReason = useCallback((reason: string) => {
    setCallState((prev) => ({ ...prev, rejectReason: reason }));
  }, []);

  const setError = useCallback((error: string) => {
    setCallState((prev) => ({ ...prev, status: "error", error }));
  }, []);

  const reset = useCallback(() => {
    setCallState(initialCallState);
  }, []);

  return {
    callState,
    setCallStatus,
    setCallerInfo,
    setCallType,
    setStartTime,
    setEndTime,
    setRejectReason,
    setError,
    reset,
  };
}
