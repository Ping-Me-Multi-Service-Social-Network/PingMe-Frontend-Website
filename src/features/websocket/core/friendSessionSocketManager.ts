import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import type { FriendSessionSummary, MusicSessionEventMessage } from "@/types/music/musicSession";
import {
  friendSessionRemoved,
  friendSessionUpserted,
} from "@/features/music/musicSessionSlice";

interface FriendSessionSocketOptions {
  baseUrl: string;
  dispatch: (action: any) => void;
}

class FriendSessionSocketManagerClass {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;
  private currentUserId: string | null = null;
  private options: FriendSessionSocketOptions | null = null;

  connect(userId: string, options: FriendSessionSocketOptions): void {
    if (this.client?.connected && this.currentUserId === userId) {
      return;
    }

    this.disconnect();
    this.currentUserId = userId;
    this.options = options;

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
      reconnectDelay: 5000,
    });

    this.client.onConnect = () => {
      this.subscribe(userId);
    };

    this.client.onStompError = (frame) => {
      console.warn("[FriendSessionWS] STOMP error:", frame.headers["message"], frame.body);
    };

    this.client.activate();
  }

  disconnect(): void {
    try {
      this.subscription?.unsubscribe();
    } catch (err) {
      console.warn("[FriendSessionWS] Error unsubscribing:", err);
    }
    this.subscription = null;
    this.currentUserId = null;
    this.client?.deactivate();
    this.client = null;
  }

  private subscribe(userId: string): void {
    if (!this.client) return;

    this.subscription = this.client.subscribe(
      `/topic/music/users/${userId}/friend-sessions`,
      (message: IMessage) => this.handleMessage(message)
    );
  }

  private handleMessage(message: IMessage): void {
    let envelope: MusicSessionEventMessage;
    try {
      envelope = JSON.parse(message.body) as MusicSessionEventMessage;
    } catch (err) {
      console.warn("[FriendSessionWS] Invalid payload:", err);
      return;
    }

    switch (envelope.eventType) {
      case "FRIEND_SESSION_STARTED":
      case "FRIEND_SESSION_UPDATED":
        this.options?.dispatch(friendSessionUpserted(envelope.data as FriendSessionSummary));
        break;
      case "FRIEND_SESSION_ENDED": {
        const hostUserId = (envelope.data as { hostUserId?: string })?.hostUserId;
        if (hostUserId) {
          this.options?.dispatch(friendSessionRemoved(hostUserId));
        }
        break;
      }
      default:
        break;
    }
  }
}

export const FriendSessionSocketManager = new FriendSessionSocketManagerClass();
