import { useContext } from "react";
import { CallContext } from "@/contexts/CallContext";

export function useCallContext() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCallContext must be used within CallProvider");
  }
  return context;
}
