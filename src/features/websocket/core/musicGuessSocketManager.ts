import type { IMessage, StompSubscription } from "@stomp/stompjs";
import type { MusicGuessEventMessage } from "@/types/music/guess";
import { MusicStompSharedClient } from "./musicStompSharedClient";

interface MusicGuessSocketOptions {
  baseUrl: string;
  sessionId: string;
  onEvent: (event: MusicGuessEventMessage) => void;
  onError?: (message: string) => void;
}

class MusicGuessSocketManagerClass {
  private topicSub: StompSubscription | null = null;
  private userSub: StompSubscription | null = null;
  private sessionId: string | null = null;
  private onEventCallback?: (event: MusicGuessEventMessage) => void;
  private onErrorCallback?: (message: string) => void;
  private readonly consumerId = "music-guess";

  connect(options: MusicGuessSocketOptions): void {
    this.onEventCallback = options.onEvent;
    this.onErrorCallback = options.onError;

    if (this.sessionId === options.sessionId && MusicStompSharedClient.isConnected()) {
      return;
    }

    this.disconnect();
    this.sessionId = options.sessionId;

    MusicStompSharedClient.acquire(this.consumerId, options.baseUrl, {
      onConnect: () => {
        this.topicSub = MusicStompSharedClient.subscribe(
          `/topic/music/guess/${options.sessionId}`,
          (message: IMessage) => this.handleMessage(message)
        );
        this.userSub = MusicStompSharedClient.subscribe(
          "/user/queue/music/guess",
          (message: IMessage) => this.handleMessage(message)
        );
      },
      onStompError: (frame) => {
        this.onErrorCallback?.(frame.body || frame.headers.message || "Khong the ket noi game");
      },
    });
  }

  disconnect(): void {
    try {
      this.topicSub?.unsubscribe();
      this.userSub?.unsubscribe();
    } catch {
      // ignore stale subscription errors
    }
    this.topicSub = null;
    this.userSub = null;
    this.sessionId = null;
    MusicStompSharedClient.release(this.consumerId);
  }

  private handleMessage(message: IMessage): void {
    try {
      this.onEventCallback?.(JSON.parse(message.body) as MusicGuessEventMessage);
    } catch {
      this.onErrorCallback?.("Du lieu realtime khong hop le");
    }
  }
}

export const MusicGuessSocketManager = new MusicGuessSocketManagerClass();
