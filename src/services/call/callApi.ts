import type { SignalingRequest } from "@/types/call/call";
import axiosClient from "@/lib/axiosClient";

// Send signaling message (OFFER/ANSWER/CANDIDATE/HANGUP)
export async function sendSignalingApi(payload: SignalingRequest) {
  try {
    const response = await axiosClient.post("/chat/signaling", payload);
    return response;
  } catch (error) {
    console.error("[CallAPI] sendSignaling error:", error);
    throw error;
  }
}
