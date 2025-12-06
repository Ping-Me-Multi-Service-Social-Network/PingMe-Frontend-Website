import type { UserStatusPayload } from "@/types/common/userStatus";
import type { UserSummaryResponse } from "@/types/common/userSummary";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { toast } from "sonner";

// =================================================================
// Type
// =================================================================
export type FriendshipEventType =
  | "INVITED"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELED"
  | "DELETED";

export interface FriendshipEventPayload {
  type: FriendshipEventType;
  userSummaryResponse: UserSummaryResponse;
}

//Thêm interface cho DTO UserOnlineStatusRespone (bên phía Back End) trả về
export interface FriendShipPresenceEventPayload {
  userId: string;
  name: string;
  isOnline: boolean;
}

export interface FriendshipWSOptions {
  baseUrl: string;
  onEvent: (ev: FriendshipEventPayload) => void;
  onStatus: (ev: FriendShipPresenceEventPayload) => void;
}

//Thêm interface FriendStatusWS (tách ra từ FriendshipWSOptions) để chỉ chuyên nhận payload status người dùng.
export interface FriendStatusWS {
  baseUrl: string;
  onStatus: (ev: FriendShipPresenceEventPayload) => void;
}

// =================================================================
// Internal state
// =================================================================
let client: Client | null = null;
let manualDisconnect = false;

let sub: StompSubscription | null = null;
let subStatus: StompSubscription | null = null;

// ================================================================
// Connect / Disconnect
// ================================================================
export async function connectFriendshipWS(opts: FriendshipWSOptions) {
  if (client?.connected) return;
  manualDisconnect = false;

  client = new Client({
    webSocketFactory: () => {
      const token = localStorage.getItem("access_token") ?? "";
      const url = `${opts.baseUrl}/ws?access_token=${encodeURIComponent(
        token
      )}`;
      return new SockJS(url);
    },
    heartbeatIncoming: 15000,
    heartbeatOutgoing: 15000,
    reconnectDelay: 3000,
    maxWebSocketChunkSize: 8 * 1024,
  });

  client.onConnect = () => {
    sub?.unsubscribe();
    sub = client!.subscribe("/user/queue/friendship", (msg: IMessage) => {
      try {
        const ev = JSON.parse(msg.body) as FriendshipEventPayload;
        opts.onEvent(ev);
      } catch (e) {
        console.error("[PingMeWS] parse error:", e, msg.body);
      }
    });

    subStatus?.unsubscribe();
    subStatus = client!.subscribe("/user/queue/status", (msg: IMessage) => {
      try {
        const ev = JSON.parse(msg.body) as UserStatusPayload;
        opts.onStatus?.(ev);
      } catch (e) {
        console.error("[PresenceWS] parse error:", e, msg.body);
      }
    });
  };

  client.onStompError = (frame) => {
    console.error(
      "[PingMeWS] STOMP error:",
      frame.headers["message"],
      frame.body
    );
  };

  client.onWebSocketError = (ev) => {
    console.error("[PingMeWS] WebSocket error:", ev);
  };

  client.onDisconnect = () => {
    sub = null;
    if (manualDisconnect) return;
  };

  client.activate();
}

export function disconnectFriendshipWS() {
  manualDisconnect = true;
  try {
    sub?.unsubscribe();
    sub = null;
  } catch (err) {
    toast.error(getErrorMessage(err, "Không thể ngắt kết nối"));
  }
  client?.deactivate();
  client = null;
}
