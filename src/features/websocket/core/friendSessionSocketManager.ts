import type { IMessage, StompSubscription } from "@stomp/stompjs";
import type { FriendSessionSummary, MusicSessionEventType } from "@/types/music/musicSession";
import { friendSessionRemoved, friendSessionUpserted } from "@/features/music/musicSessionSlice";
import { MusicStompSharedClient } from "./musicStompSharedClient";

interface FriendSessionSocketOptions {
  baseUrl: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: (action: any) => void;
}

class FriendSessionSocketManagerClass {
  private subscription: StompSubscription | null = null;
  private currentUserId: string | null = null;
  private options: FriendSessionSocketOptions | null = null;
  private readonly consumerId = "friend-session";

  connect(userId: string, options: FriendSessionSocketOptions): void {
    if (this.currentUserId === userId && MusicStompSharedClient.isConnected()) {
      return;
    }

    this.disconnect();
    this.currentUserId = userId;
    this.options = options;

    MusicStompSharedClient.acquire(this.consumerId, options.baseUrl, {
      onConnect: () => this.subscribe(userId),
      onStompError: () => {
        // keep silent, this stream is advisory only
      },
    });
  }

  disconnect(): void {
    try {
      this.subscription?.unsubscribe();
    } catch {
      // ignore stale subscription errors
    }
    this.subscription = null;
    this.currentUserId = null;
    MusicStompSharedClient.release(this.consumerId);
  }

  private subscribe(userId: string): void {
    this.subscription = MusicStompSharedClient.subscribe(
      `/topic/music/users/${userId}/friend-sessions`,
      (message: IMessage) => this.handleMessage(message)
    );
  }

  private handleMessage(message: IMessage): void {
    let envelope:
      | {
          eventType: "FRIEND_SESSION_STARTED" | "FRIEND_SESSION_UPDATED";
          data: FriendSessionSummary;
          serverTimeMs: number;
        }
      | {
          eventType: "FRIEND_SESSION_ENDED";
          data: { hostUserId?: string };
          serverTimeMs: number;
        }
      | {
          eventType: Exclude<
            MusicSessionEventType,
            "FRIEND_SESSION_STARTED" | "FRIEND_SESSION_UPDATED" | "FRIEND_SESSION_ENDED"
          >;
          data: unknown;
          serverTimeMs: number;
        };

    try {
      envelope = JSON.parse(message.body) as typeof envelope;
    } catch {
      return;
    }

    switch (envelope.eventType) {
      case "FRIEND_SESSION_STARTED":
      case "FRIEND_SESSION_UPDATED":
        this.options?.dispatch(friendSessionUpserted(envelope.data));
        break;
      case "FRIEND_SESSION_ENDED": {
        const hostUserId = envelope.data?.hostUserId;
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
