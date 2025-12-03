import type { UserStatusPayload } from "@/types/common/userStatus";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { toast } from "sonner";

export interface userStatusWSOptions {
  baseUrl: string;
  onStatus: (ev: UserStatusPayload) => void;
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
//Thêm phương thức kết nối ws mới là connectFriendStatusWS phục vụ cho ChatCard
// (vì ChatCard nhận danh sách room nên phải tách ra một ws khác cho dễ kết nối,
//không dùng chung ws connectFriendshipWS)

export async function connectUserStatusSocket(opts: userStatusWSOptions) {
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
    subStatus?.unsubscribe();
    subStatus = client!.subscribe("/user/queue/status", (msg: IMessage) => {
      try {
        const ev = JSON.parse(msg.body) as {
          userId: string;
          name: string;
          isOnline: boolean;
        };
        opts.onStatus?.(ev); // thêm callback mới
      } catch (e) {
        console.error("[PingMe] parse error:", e, msg.body);
      }
    });
  };

  client.onStompError = (frame) => {
    console.error(
      "[FriendshipWS] STOMP error:",
      frame.headers["message"],
      frame.body
    );
  };

  client.onWebSocketError = (ev) => {
    console.error("[FriendshipWS] WebSocket error:", ev);
  };

  client.onDisconnect = () => {
    sub = null;
    if (manualDisconnect) return;
  };

  client.activate();
}

export function disconnectUserStatusSocket() {
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
