import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import type { MusicGuessEventMessage } from "@/types/music/guess";

interface MusicGuessSocketOptions {
  baseUrl: string;
  sessionId: string;
  onEvent: (event: MusicGuessEventMessage) => void;
  onError?: (message: string) => void;
}

class MusicGuessSocketManagerClass {
  private client: Client | null = null;
  private topicSub: StompSubscription | null = null;
  private userSub: StompSubscription | null = null;
  private sessionId: string | null = null;
  private onEventCallback?: (event: MusicGuessEventMessage) => void;
  private onErrorCallback?: (message: string) => void;

  connect(options: MusicGuessSocketOptions): void {
    this.onEventCallback = options.onEvent;
    this.onErrorCallback = options.onError;

    if (this.client?.connected && this.sessionId === options.sessionId) {
      return;
    }

    this.disconnect();
    this.sessionId = options.sessionId;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${options.baseUrl}/music-service/ws-music`),
      beforeConnect: async () => {
        const token = localStorage.getItem("access_token");
        if (this.client) {
          this.client.connectHeaders = {
            Authorization: `Bearer ${token ?? ""}`,
          };
        }
      },
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
      reconnectDelay: 4000,
    });

    this.client.onConnect = () => {
      if (!this.client) return;
      this.topicSub = this.client.subscribe(
        `/topic/music/guess/${options.sessionId}`,
        (message) => this.handleMessage(message),
      );
      this.userSub = this.client.subscribe(
        "/user/queue/music/guess",
        (message) => this.handleMessage(message),
      );
    };

    this.client.onStompError = (frame) => {
      this.onErrorCallback?.(frame.body || frame.headers.message || "Không thể kết nối game");
    };

    this.client.activate();
  }

  disconnect(): void {
    try {
      this.topicSub?.unsubscribe();
      this.userSub?.unsubscribe();
    } catch (error) {
      console.warn("[MusicGuessWS] Failed to unsubscribe", error);
    }
    this.topicSub = null;
    this.userSub = null;
    this.sessionId = null;
    this.client?.deactivate();
    this.client = null;
  }

  private handleMessage(
    message: IMessage,
  ): void {
    try {
      this.onEventCallback?.(JSON.parse(message.body) as MusicGuessEventMessage);
    } catch (error) {
      console.error("[MusicGuessWS] Invalid message", error);
      this.onErrorCallback?.("Dữ liệu realtime không hợp lệ");
    }
  }
}

export const MusicGuessSocketManager = new MusicGuessSocketManagerClass();
