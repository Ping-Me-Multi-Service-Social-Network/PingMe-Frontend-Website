import { createContext } from "react";
import type { CallState, CallType } from "@/types/call/call";

export interface CallContextType {
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

export const CallContext = createContext<CallContextType | undefined>(
  undefined
);
