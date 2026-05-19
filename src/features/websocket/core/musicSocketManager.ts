// =================================================================
// Music Socket Manager - Kết nối STOMP độc lập tới Music Service
// Không dùng chung với socketManager.ts (chat)
// =================================================================
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import type {
  MusicSessionCommandRequest,
  MusicSessionEventType,
  MusicSessionState,
  MusicCommandError,
} from "@/types/music/musicSession";
import {
  joinSessionSuccess,
  sessionStateReceived,
  presenceChanged,
  queueChanged,
  commandErrorReceived,
} from "@/features/music/musicSessionSlice";

// =================================================================
// Types
// =================================================================

export interface MusicSocketManagerOptions {
  /** Base URL của API Gateway (ví dụ: http://localhost:8080) */
  baseUrl: string;
  /** Hàm dispatch của Redux store */
  dispatch: (action: unknown) => void;
  /** Callback khi session bị giải tán từ phía server */
  onSessionEnded?: (hostUserId: string) => void;
  /** Optional JWT token for non-friend session joining (fallback when friendship check fails) */
  sessionToken?: string;
}

// =================================================================
// Singleton Class
// =================================================================

class MusicSocketManagerClass {
  private client: Client | null = null;
  private sessionSub: StompSubscription | null = null;
  private errorSub: StompSubscription | null = null;
  private options: MusicSocketManagerOptions | null = null;

  // hostUserId của phiên hiện đang kết nối
  private currentHostUserId: string | null = null;

  // Hàng đợi lệnh khi chưa kịp kết nối
  private commandQueue: { hostUserId: string; request: MusicSessionCommandRequest }[] = [];

  // =================================================================
  // Public Methods
  // =================================================================

  isConnected(): boolean {
    return !!this.client?.connected;
  }

  /**
   * Kết nối tới Music Service WS và subscribe vào session của hostUserId.
   * Có thể gọi lại với hostUserId khác để chuyển phòng.
   */
  connect(hostUserId: string, opts: MusicSocketManagerOptions): void {
    // Nếu đang nghe cùng host thì bỏ qua
    if (this.isConnected() && this.currentHostUserId === hostUserId) {
      console.log("[MusicWS] Already connected to host:", hostUserId);
      return;
    }

    // Nếu đang kết nối host khác thì ngắt trước
    if (this.isConnected()) {
      this.disconnect();
    }

    this.options = opts;
    this.currentHostUserId = hostUserId;

    console.log("[MusicWS] Connecting to session of host:", hostUserId);

    this.client = new Client({
      webSocketFactory: () => {
        const url = `${opts.baseUrl}/music-service/ws-music`;
        console.log("[MusicWS] Creating WebSocket to:", url);
        return new SockJS(url);
      },

      // Gắn JWT vào header khi connect
      beforeConnect: async () => {
        const token = localStorage.getItem("access_token");
        if (this.client) {
          this.client.connectHeaders = {
            Authorization: `Bearer ${token ?? ""}`,
          };
          
          // If session token is provided (for non-friend join via share link),
          // add it to headers for fallback validation
          if (this.options?.sessionToken) {
            this.client.connectHeaders["X-Session-Token"] = this.options.sessionToken;
          }
        }
      },

      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
      reconnectDelay: 5000,
    });

    this.client.onConnect = () => {
      console.log("[MusicWS] Connected successfully!");
      opts.dispatch(joinSessionSuccess());
      this.subscribeToSession(hostUserId);
      this.subscribeToErrors();
      this.flushQueue();
    };

    this.client.onStompError = (frame) => {
      console.error("[MusicWS] STOMP error:", frame.headers["message"], frame.body);
      opts.dispatch(commandErrorReceived(frame.body || frame.headers["message"] || "Không thể kết nối phiên nghe chung"));
    };

    this.client.onWebSocketError = (ev) => {
      console.error("[MusicWS] WebSocket error:", ev);
      opts.dispatch(commandErrorReceived("Không thể kết nối WebSocket nghe chung"));
    };

    this.client.onDisconnect = () => {
      console.log("[MusicWS] Disconnected from Music Service");
    };

    this.client.activate();
  }

  /** Ngắt kết nối và xóa trạng thái */
  disconnect(): void {
    console.log("[MusicWS] Disconnecting...");
    this.safeUnsubscribe(this.sessionSub, "session");
    this.safeUnsubscribe(this.errorSub, "errors");
    this.sessionSub = null;
    this.errorSub = null;
    this.currentHostUserId = null;
    this.commandQueue = [];

    this.client?.deactivate();
    this.client = null;
  }

  /**
   * Gửi lệnh lên BE qua STOMP.
   * Destination: /app/music/users/{hostUserId}/command
   */
  sendCommand(hostUserId: string, request: MusicSessionCommandRequest): void {
    if (!this.isConnected() || !this.client) {
      console.log("[MusicWS] Not connected, queuing command:", request.command);
      this.commandQueue.push({ hostUserId, request });
      return;
    }

    const destination = `/app/music/users/${hostUserId}/command`;
    console.log("[MusicWS] Sending command:", request.command, "to", destination);

    this.client.publish({
      destination,
      body: JSON.stringify(request),
    });
  }

  /** Gửi toàn bộ lệnh đang chờ trong hàng đợi */
  private flushQueue(): void {
    if (!this.isConnected() || this.commandQueue.length === 0) return;

    console.log(`[MusicWS] Flushing ${this.commandQueue.length} queued commands`);
    const pending = [...this.commandQueue];
    this.commandQueue = [];

    pending.forEach(({ hostUserId, request }) => {
      this.sendCommand(hostUserId, request);
    });
  }

  // =================================================================
  // Private Methods
  // =================================================================

  /**
   * Subscribe vào topic session của Host để nhận state updates.
   * Topic: /topic/music/users/{hostUserId}/session
   */
  private subscribeToSession(hostUserId: string): void {
    if (!this.client) return;

    const topic = `/topic/music/users/${hostUserId}/session`;
    console.log("[MusicWS] Subscribing to:", topic);

    this.sessionSub = this.client.subscribe(
      topic,
      (msg: IMessage) => {
        this.handleSessionMessage(msg, hostUserId);
      },
      this.options?.sessionToken ? { "X-Session-Token": this.options.sessionToken } : {}
    );
  }

  /**
   * Subscribe vào queue lỗi cá nhân để nhận phản hồi lỗi từ server.
   * Destination: /user/queue/music/errors
   */
  private subscribeToErrors(): void {
    if (!this.client) return;

    this.errorSub = this.client.subscribe(
      "/user/queue/music/errors",
      (msg: IMessage) => {
        try {
          const err = JSON.parse(msg.body) as MusicCommandError;
          console.warn("[MusicWS] Command error:", err);
          this.options?.dispatch(commandErrorReceived(err.message));
        } catch (e) {
          console.error("[MusicWS] Failed to parse error message:", e);
        }
      }
    );
  }

  /** Xử lý event từ topic session */
  private handleSessionMessage(msg: IMessage, hostUserId: string): void {
    let envelope:
      | {
          eventType: "MUSIC_SESSION_STATE" | "MUSIC_PLAYBACK_CHANGED";
          data: MusicSessionState;
          serverTimeMs: number;
        }
      | {
          eventType: "MUSIC_QUEUE_CHANGED" | "MUSIC_PRESENCE_CHANGED";
          data: string[];
          serverTimeMs: number;
        }
      | {
          eventType: Exclude<
            MusicSessionEventType,
            | "MUSIC_SESSION_STATE"
            | "MUSIC_PLAYBACK_CHANGED"
            | "MUSIC_QUEUE_CHANGED"
            | "MUSIC_PRESENCE_CHANGED"
          >;
          data: unknown;
          serverTimeMs: number;
        };

    try {
      envelope = JSON.parse(msg.body) as typeof envelope;
    } catch (e) {
      console.error("[MusicWS] Failed to parse session message:", e);
      return;
    }

    console.log("[MusicWS] Received event:", envelope.eventType);

    switch (envelope.eventType) {
      case "MUSIC_SESSION_STATE":
      case "MUSIC_PLAYBACK_CHANGED":
        // Cả hai event đều gửi kèm full state -> dispatch vào slice
        this.options?.dispatch(sessionStateReceived(envelope.data));
        break;

      case "MUSIC_QUEUE_CHANGED":
        // BE gửi state đầy đủ sau queue change
        this.options?.dispatch(queueChanged(envelope.data));
        break;

      case "MUSIC_PRESENCE_CHANGED":
        // data là string[] (danh sách activeListenerIds)
        this.options?.dispatch(presenceChanged(envelope.data));
        break;

      case "MUSIC_SESSION_ENDED":
        console.log("[MusicWS] Session ended by host:", hostUserId);
        this.options?.onSessionEnded?.(hostUserId);
        // Không disconnect ngay - để FE tự phát hết bài rồi disconnect
        break;

      default:
        console.warn("[MusicWS] Unknown event type:", envelope.eventType);
    }
  }

  private safeUnsubscribe(sub: StompSubscription | null, context: string): void {
    try {
      sub?.unsubscribe();
    } catch (err) {
      console.warn(`[MusicWS] Error unsubscribing ${context}:`, err);
    }
  }
}

// =================================================================
// Singleton Export
// =================================================================
export const MusicSocketManager = new MusicSocketManagerClass();
