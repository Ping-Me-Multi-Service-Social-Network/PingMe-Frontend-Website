import type { UserSummaryResponse } from "@/types/common/userSummary";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { toast } from "sonner";

// =================================================================
// Type Definitions
// =================================================================
export type FriendshipEventType =
  | "INVITED"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELED"
  | "DELETED";

export interface FriendshipEventPayload {
  type: FriendshipEventType;
  userSummaryResponse: UserSummaryResponse; // Thay any bằng type chuẩn của bạn
}

export interface UserStatusPayload {
  userId: string;
  name: string;
  isOnline: boolean;
}

export interface SignalingPayload {
  type: "INVITE" | "ACCEPT" | "REJECT" | "HANGUP";
  senderId: number;
  roomId: number;
  payload?: {
    callType?: "AUDIO" | "VIDEO";
    targetUserId?: number;
    reason?: string;
  };
}

// Đổi tên Interface cho chuẩn nghĩa Global
export interface GlobalWSOptions {
  baseUrl: string;
  onFriendEvent: (ev: FriendshipEventPayload) => void;
  onStatus: (ev: UserStatusPayload) => void;
  onSignalEvent: (ev: SignalingPayload) => void;
}

// =================================================================
// Internal State (Singleton Pattern)
// =================================================================
let client: Client | null = null;
let manualDisconnect = false;

// Các biến Subscription
let subFriendship: StompSubscription | null = null;
let subStatus: StompSubscription | null = null;
let subSignal: StompSubscription | null = null;

// ================================================================
// Helper: Clean up subscriptions
// ================================================================
const clearSubscriptions = () => {
  try {
    if (subFriendship) {
      subFriendship.unsubscribe();
      subFriendship = null;
    }
    if (subStatus) {
      subStatus.unsubscribe();
      subStatus = null;
    }
    if (subSignal) {
      subSignal.unsubscribe();
      subSignal = null;
    }
  } catch (error) {
    console.warn("[GlobalWS] Error clearing subscriptions", error);
  }
};

// ================================================================
// Connect Function
// ================================================================
export async function connectGlobalWS(opts: GlobalWSOptions) {
  // Nếu đã kết nối và client đang active thì không connect lại
  if (client?.connected && client?.active) return;

  manualDisconnect = false;

  client = new Client({
    webSocketFactory: () => {
      const token = localStorage.getItem("access_token") ?? "";
      // Encode token là thói quen tốt
      const url = `${opts.baseUrl}/ws?access_token=${encodeURIComponent(
        token
      )}`;
      return new SockJS(url);
    },
    // Config Heartbeat để giữ kết nối không bị timeout qua Nginx/LoadBalancer
    heartbeatIncoming: 20000,
    heartbeatOutgoing: 20000,
    reconnectDelay: 5000, // Tăng delay chút để đỡ spam server nếu sập
  });

  client.onConnect = () => {
    // 1. Reset sạch subscription cũ trước khi sub mới (Phòng trường hợp re-connect)
    clearSubscriptions();

    console.log("[GlobalWS] Connected!");

    // 2. Subscribe Friendship
    subFriendship = client!.subscribe(
      "/user/queue/friendship",
      (msg: IMessage) => {
        try {
          const ev = JSON.parse(msg.body) as FriendshipEventPayload;
          opts.onFriendEvent(ev);
        } catch (e) {
          console.error("[GlobalWS] Friendship parse error:", e);
        }
      }
    );

    // 3. Subscribe Status
    subStatus = client!.subscribe("/user/queue/status", (msg: IMessage) => {
      try {
        const ev = JSON.parse(msg.body) as UserStatusPayload;
        opts.onStatus(ev);
      } catch (e) {
        console.error("[GlobalWS] Status parse error:", e);
      }
    });

    // 4. Subscribe Signaling (Voice/Video Call)
    console.log("[v0] GlobalWS: Subscribing to /user/queue/signaling");
    subSignal = client!.subscribe("/user/queue/signaling", (msg: IMessage) => {
      try {
        console.log("[v0] GlobalWS: Received raw signaling message:", msg.body);
        const ev = JSON.parse(msg.body) as SignalingPayload;
        console.log("[v0] GlobalWS: Parsed signaling event:", ev);
        opts.onSignalEvent(ev);
      } catch (e) {
        console.error("[GlobalWS] Signaling parse error:", e);
      }
    });
  };

  client.onStompError = (frame) => {
    console.error(
      "[GlobalWS] STOMP error:",
      frame.headers["message"],
      frame.body
    );
  };

  client.onDisconnect = () => {
    console.log("[GlobalWS] Disconnected");
    // Nếu rớt mạng tự nhiên (không phải do user logout), cần clear sub để tránh lỗi trạng thái
    if (!manualDisconnect) {
      clearSubscriptions();
    }
  };

  client.activate();
}

// ================================================================
// Disconnect Function (Dùng khi Logout)
// ================================================================
export function disconnectGlobalWS() {
  manualDisconnect = true;

  // 1. Clear toàn bộ subscription
  clearSubscriptions();

  // 2. Deactivate Client
  if (client) {
    try {
      client.deactivate();
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể ngắt kết nối"));
      console.error("Error deactivating client", err);
    }
    client = null;
  }
}

// ================================================================
// Send Signal Message Function
// ================================================================
// Removed sendSignalMessage function since we're using REST API now
