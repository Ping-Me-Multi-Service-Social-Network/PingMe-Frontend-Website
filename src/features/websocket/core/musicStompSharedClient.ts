import { Client, type Frame, type IFrame, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";

type ConsumerHooks = {
  onConnect?: () => void;
  onStompError?: (frame: IFrame) => void;
  onWebSocketError?: (event: Event) => void;
};

class MusicStompSharedClientClass {
  private client: Client | null = null;
  private readonly consumers = new Map<string, ConsumerHooks>();

  isConnected(): boolean {
    return !!this.client?.connected;
  }

  acquire(consumerId: string, baseUrl: string, hooks: ConsumerHooks = {}): void {
    this.consumers.set(consumerId, hooks);

    if (!this.client) {
      this.createAndActivateClient(baseUrl);
      return;
    }

    if (this.client.connected) {
      hooks.onConnect?.();
      return;
    }

    if (!this.client.active) {
      this.client.activate();
    }
  }

  release(consumerId: string): void {
    this.consumers.delete(consumerId);
    if (this.consumers.size > 0) return;

    this.client?.deactivate();
    this.client = null;
  }

  subscribe(
    destination: string,
    callback: (message: IMessage) => void,
    headers: Record<string, string> = {}
  ): StompSubscription | null {
    if (!this.client?.connected) return null;
    return this.client.subscribe(destination, callback, headers);
  }

  publish(destination: string, body: string): void {
    if (!this.client?.connected) return;
    this.client.publish({ destination, body });
  }

  private createAndActivateClient(baseUrl: string): void {
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/music-service/ws-music`),
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
      this.consumers.forEach((hooks) => hooks.onConnect?.());
    };

    this.client.onStompError = (frame: Frame) => {
      this.consumers.forEach((hooks) => hooks.onStompError?.(frame));
    };

    this.client.onWebSocketError = (event: Event) => {
      this.consumers.forEach((hooks) => hooks.onWebSocketError?.(event));
    };

    this.client.activate();
  }
}

export const MusicStompSharedClient = new MusicStompSharedClientClass();
