import type { IMessage, StompSubscription } from "@stomp/stompjs";
import type {
  MusicSessionCommandRequest,
  MusicSessionEventType,
  MusicSessionState,
  MusicCommandError,
} from "@/types/music/musicSession";
import {
  joinSessionSuccess,
  joinSessionFailed,
  sessionStateReceived,
  presenceChanged,
  queueChanged,
  commandErrorReceived,
} from "@/features/music/musicSessionSlice";
import { MusicStompSharedClient } from "./musicStompSharedClient";

export interface MusicSocketManagerOptions {
  baseUrl: string;
  dispatch: (action: unknown) => void;
  onSessionEnded?: (hostUserId: string) => void;
  sessionToken?: string;
}

function normalizeJoinError(raw: string, usingSessionToken: boolean): string {
  const msg = (raw || "").toString();
  const lower = msg.toLowerCase();

  // Friendly message for expired/invalid invite links.
  if (
    usingSessionToken &&
    (lower.includes("access denied") ||
      lower.includes("forbidden") ||
      lower.includes("khong co quyen") ||
      lower.includes("không có quyền") ||
      lower.includes("token") ||
      lower.includes("het han") ||
      lower.includes("hết hạn") ||
      lower.includes("invalid"))
  ) {
    return "Link moi da het han hoac khong con hop le. Hay yeu cau host tao link moi.";
  }

  return msg || "Khong the ket noi phien nghe chung";
}

class MusicSocketManagerClass {
  private sessionSub: StompSubscription | null = null;
  private errorSub: StompSubscription | null = null;
  private options: MusicSocketManagerOptions | null = null;
  private currentHostUserId: string | null = null;
  private commandQueue: { hostUserId: string; request: MusicSessionCommandRequest }[] = [];
  private readonly consumerId = "music-session";

  isConnected(): boolean {
    return MusicStompSharedClient.isConnected();
  }

  connect(hostUserId: string, opts: MusicSocketManagerOptions): void {
    if (this.isConnected() && this.currentHostUserId === hostUserId) {
      return;
    }

    if (this.currentHostUserId && this.currentHostUserId !== hostUserId) {
      this.disconnect();
    }

    this.options = opts;
    this.currentHostUserId = hostUserId;

    MusicStompSharedClient.acquire(this.consumerId, opts.baseUrl, {
      onConnect: () => {
        opts.dispatch(joinSessionSuccess());
        this.subscribeToSession(hostUserId);
        this.subscribeToErrors();
        this.flushQueue();
      },
      onStompError: (frame) => {
        const raw = frame.body || frame.headers["message"] || "Khong the ket noi phien nghe chung";
        const message = normalizeJoinError(raw, Boolean(opts.sessionToken));
        opts.dispatch(joinSessionFailed(message));
        opts.dispatch(commandErrorReceived(message));
      },
      onWebSocketError: () => {
        const message = "Khong the ket noi WebSocket nghe chung";
        opts.dispatch(joinSessionFailed(message));
        opts.dispatch(commandErrorReceived(message));
      },
    });
  }

  disconnect(): void {
    this.safeUnsubscribe(this.sessionSub);
    this.safeUnsubscribe(this.errorSub);
    this.sessionSub = null;
    this.errorSub = null;
    this.currentHostUserId = null;
    this.commandQueue = [];
    MusicStompSharedClient.release(this.consumerId);
  }

  sendCommand(hostUserId: string, request: MusicSessionCommandRequest): void {
    if (!this.isConnected()) {
      this.commandQueue.push({ hostUserId, request });
      return;
    }

    const destination = `/app/music/users/${hostUserId}/command`;
    MusicStompSharedClient.publish(destination, JSON.stringify(request));
  }

  private flushQueue(): void {
    if (!this.isConnected() || this.commandQueue.length === 0) return;

    const pending = [...this.commandQueue];
    this.commandQueue = [];

    pending.forEach(({ hostUserId, request }) => {
      this.sendCommand(hostUserId, request);
    });
  }

  private subscribeToSession(hostUserId: string): void {
    this.safeUnsubscribe(this.sessionSub);
    this.sessionSub = MusicStompSharedClient.subscribe(
      `/topic/music/users/${hostUserId}/session`,
      (msg: IMessage) => this.handleSessionMessage(msg, hostUserId),
      this.options?.sessionToken ? { "X-Session-Token": this.options.sessionToken } : {}
    );
  }

  private subscribeToErrors(): void {
    this.safeUnsubscribe(this.errorSub);
    this.errorSub = MusicStompSharedClient.subscribe("/user/queue/music/errors", (msg: IMessage) => {
      try {
        const err = JSON.parse(msg.body) as MusicCommandError;
        const message = normalizeJoinError(err.message, Boolean(this.options?.sessionToken));
        this.options?.dispatch(commandErrorReceived(message));
      } catch {
        this.options?.dispatch(commandErrorReceived("Co loi xay ra khi xu ly lenh"));
      }
    });
  }

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
            "MUSIC_SESSION_STATE" | "MUSIC_PLAYBACK_CHANGED" | "MUSIC_QUEUE_CHANGED" | "MUSIC_PRESENCE_CHANGED"
          >;
          data: unknown;
          serverTimeMs: number;
        };

    try {
      envelope = JSON.parse(msg.body) as typeof envelope;
    } catch {
      return;
    }

    switch (envelope.eventType) {
      case "MUSIC_SESSION_STATE":
      case "MUSIC_PLAYBACK_CHANGED":
        this.options?.dispatch(sessionStateReceived(envelope.data));
        break;
      case "MUSIC_QUEUE_CHANGED":
        this.options?.dispatch(queueChanged(envelope.data));
        break;
      case "MUSIC_PRESENCE_CHANGED":
        this.options?.dispatch(presenceChanged(envelope.data));
        break;
      case "MUSIC_SESSION_ENDED":
        this.options?.onSessionEnded?.(hostUserId);
        break;
      default:
        break;
    }
  }

  private safeUnsubscribe(sub: StompSubscription | null): void {
    try {
      sub?.unsubscribe();
    } catch {
      // ignore stale subscription errors
    }
  }
}

export const MusicSocketManager = new MusicSocketManagerClass();

