// =================================================================
// Socket Manager - Singleton quản lý tất cả WebSocket connections
// =================================================================
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler";

// Import các type từ module con
import type {
  ChatEventHandlers,
  MessageCreatedEventPayload,
  MessageRecalledEventPayload,
  ReadStateChangedEvent,
  RoomCreatedEventPayload,
  RoomUpdatedEventPayload,
  RoomMemberAddedEventPayload,
  RoomMemberRemovedEventPayload,
  RoomMemberRoleChangedEventPayload,
} from "./module/chatSocket";

import type {
  FriendshipEventPayload,
  UserStatusPayload,
  SignalingPayload,
} from "./module/globalSocket";

// =================================================================
// Types
// =================================================================
export interface SocketManagerOptions {
  baseUrl: string;

  // Chat event handlers
  chat?: ChatEventHandlers;

  // Global event handlers
  onFriendEvent?: (ev: FriendshipEventPayload) => void;
  onUserStatus?: (ev: UserStatusPayload) => void;
  onSignaling?: (ev: SignalingPayload) => void;

  // Disconnect handler
  onDisconnect?: (reason?: string) => void;
}

// =================================================================
// Singleton State
// =================================================================
class SocketManagerClass {
  private client: Client | null = null;
  private manualDisconnect = false;
  private options: SocketManagerOptions | null = null;

  // Chat subscriptions
  private userRoomsSub: StompSubscription | null = null;
  private currentRoomIdRef: number | null = null;
  private roomMsgSub: StompSubscription | null = null;
  private roomReadSub: StompSubscription | null = null;

  // Global subscriptions
  private friendshipSub: StompSubscription | null = null;
  private statusSub: StompSubscription | null = null;
  private signalingSub: StompSubscription | null = null;

  // =================================================================
  // Public Methods
  // =================================================================

  isConnected(): boolean {
    return !!this.client?.connected;
  }

  connect(opts: SocketManagerOptions): void {
    if (this.isConnected()) {
      console.log("[PingMe SocketManager] Already connected, skipping connect");
      return;
    }

    this.manualDisconnect = false;
    this.options = opts;

    console.log("[PingMe SocketManager] Initializing WebSocket connection...");

    this.client = new Client({
      webSocketFactory: () => {
        const token = localStorage.getItem("access_token") ?? "";
        const url = `${opts.baseUrl}/ws?access_token=${encodeURIComponent(
          token
        )}`;
        console.log("[PingMe SocketManager] Creating WebSocket to:", url);
        return new SockJS(url);
      },
      heartbeatIncoming: 15000,
      heartbeatOutgoing: 15000,
      reconnectDelay: 3000,
      maxWebSocketChunkSize: 8 * 1024,
    });

    this.client.onConnect = () => {
      console.log("[PingMe SocketManager] Connected successfully!");
      this.setupSubscriptions();
    };

    this.client.onStompError = (frame) => {
      console.error(
        "[PingMe SocketManager] STOMP error:",
        frame.headers["message"],
        frame.body
      );
    };

    this.client.onWebSocketError = (ev) => {
      console.error("[PingMe SocketManager] WebSocket error:", ev);
    };

    this.client.onDisconnect = (frame) => {
      console.log("[PingMe SocketManager] Disconnected");
      this.options?.onDisconnect?.(frame?.headers?.message);

      if (this.manualDisconnect) {
        this.cleanupAllSubscriptions();
        this.currentRoomIdRef = null;
      }
    };

    this.client.activate();
  }

  disconnect(): void {
    console.log("[PingMe SocketManager] Manual disconnect initiated");
    this.manualDisconnect = true;
    this.cleanupAllSubscriptions();
    this.currentRoomIdRef = null;
    this.client?.deactivate();
    this.client = null;
  }

  // =================================================================
  // Chat-specific Methods
  // =================================================================

  enterRoom(roomId: number): void {
    if (!this.isConnected() || !this.client) {
      console.warn("[PingMe SocketManager] Cannot enter room: not connected");
      return;
    }

    if (this.currentRoomIdRef === roomId) {
      console.log("[PingMe SocketManager] Already in room:", roomId);
      return;
    }

    console.log("[PingMe SocketManager] Entering room:", roomId);

    // Unsubscribe from old room
    this.unsubscribeRoom();

    // Subscribe to new room
    this.subscribeRoomMessages(roomId);
    this.subscribeRoomReadStates(roomId);
    this.currentRoomIdRef = roomId;
  }

  leaveRoom(): void {
    console.log("[PingMe SocketManager] Leaving current room");
    this.unsubscribeRoom();
    this.currentRoomIdRef = null;
  }

  // =================================================================
  // Private Methods - Subscription Management
  // =================================================================

  private setupSubscriptions(): void {
    console.log("[PingMe SocketManager] Setting up subscriptions...");

    // Clean up old subscriptions first
    this.cleanupAllSubscriptions();

    // Setup Chat subscriptions
    this.setupChatSubscriptions();

    // Setup Global subscriptions
    this.setupGlobalSubscriptions();

    // Resubscribe to current room if exists
    if (this.currentRoomIdRef !== null) {
      console.log(
        "[PingMe SocketManager] Resubscribing to room:",
        this.currentRoomIdRef
      );
      this.subscribeRoomMessages(this.currentRoomIdRef);
      this.subscribeRoomReadStates(this.currentRoomIdRef);
    }
  }

  private setupChatSubscriptions(): void {
    if (!this.client || !this.options?.chat) return;

    console.log("[PingMe SocketManager] Setting up chat subscriptions");

    // Subscribe to user rooms
    this.userRoomsSub = this.client.subscribe(
      "/user/queue/rooms",
      (msg: IMessage) => {
        try {
          const ev = JSON.parse(msg.body);

          switch (ev.chatEventType) {
            case "ROOM_CREATED":
              this.options?.chat?.onRoomCreated?.(
                ev as RoomCreatedEventPayload
              );
              break;
            case "ROOM_UPDATED":
              this.options?.chat?.onRoomUpdated?.(
                ev as RoomUpdatedEventPayload
              );
              break;
            case "MEMBER_ADDED":
              this.options?.chat?.onMemberAdded?.(
                ev as RoomMemberAddedEventPayload
              );
              break;
            case "MEMBER_REMOVED":
              this.options?.chat?.onMemberRemoved?.(
                ev as RoomMemberRemovedEventPayload
              );
              break;
            case "MEMBER_ROLE_CHANGED":
              this.options?.chat?.onMemberRoleChanged?.(
                ev as RoomMemberRoleChangedEventPayload
              );
              break;
            default:
              console.warn("[PingMe SocketManager] Unknown chat event:", ev);
          }
        } catch (err) {
          console.error(
            "[PingMe SocketManager] Error parsing chat event:",
            err
          );
          toast.error(getErrorMessage(err, "Lỗi xử lý dữ liệu từ máy chủ"));
        }
      }
    );
  }

  private setupGlobalSubscriptions(): void {
    if (!this.client) return;

    console.log("[PingMe SocketManager] Setting up global subscriptions");

    // Subscribe to friendship events
    if (this.options?.onFriendEvent) {
      this.friendshipSub = this.client.subscribe(
        "/user/queue/friendship",
        (msg: IMessage) => {
          try {
            const ev = JSON.parse(msg.body) as FriendshipEventPayload;
            this.options?.onFriendEvent?.(ev);
          } catch (err) {
            console.error(
              "[PingMe SocketManager] Error parsing friendship event:",
              err
            );
          }
        }
      );
    }

    // Subscribe to user status events
    if (this.options?.onUserStatus) {
      this.statusSub = this.client.subscribe(
        "/user/queue/status",
        (msg: IMessage) => {
          try {
            const ev = JSON.parse(msg.body) as UserStatusPayload;
            this.options?.onUserStatus?.(ev);
          } catch (err) {
            console.error(
              "[PingMe SocketManager] Error parsing status event:",
              err
            );
          }
        }
      );
    }

    // Subscribe to signaling events
    if (this.options?.onSignaling) {
      this.signalingSub = this.client.subscribe(
        "/user/queue/signaling",
        (msg: IMessage) => {
          try {
            const ev = JSON.parse(msg.body) as SignalingPayload;
            console.log("[PingMe SocketManager] Received signaling event:", ev);
            this.options?.onSignaling?.(ev);
          } catch (err) {
            console.error(
              "[PingMe SocketManager] Error parsing signaling event:",
              err
            );
          }
        }
      );
    }
  }

  private subscribeRoomMessages(roomId: number): void {
    if (!this.isConnected() || !this.client) return;

    try {
      this.roomMsgSub?.unsubscribe();
    } catch (e) {
      console.warn(
        "[PingMe SocketManager] Error unsubscribing room messages:",
        e
      );
    }

    const dest = `/topic/rooms/${roomId}/messages`;
    console.log("[PingMe SocketManager] Subscribing to:", dest);

    this.roomMsgSub = this.client.subscribe(dest, (msg: IMessage) => {
      try {
        const ev = JSON.parse(msg.body);

        switch (ev.chatEventType) {
          case "MESSAGE_CREATED":
            this.options?.chat?.onMessageCreated?.(
              ev as MessageCreatedEventPayload
            );
            break;
          case "MESSAGE_RECALLED":
            this.options?.chat?.onMessageRecalled?.(
              ev as MessageRecalledEventPayload
            );
            break;
        }
      } catch (err) {
        console.error(
          "[PingMe SocketManager] Error parsing message event:",
          err
        );
      }
    });
  }

  private subscribeRoomReadStates(roomId: number): void {
    if (!this.isConnected() || !this.client) return;

    try {
      this.roomReadSub?.unsubscribe();
    } catch (e) {
      console.warn(
        "[PingMe SocketManager] Error unsubscribing room read states:",
        e
      );
    }

    const dest = `/topic/rooms/${roomId}/read-states`;
    console.log("[PingMe SocketManager] Subscribing to:", dest);

    this.roomReadSub = this.client.subscribe(dest, (msg: IMessage) => {
      try {
        const ev = JSON.parse(msg.body) as ReadStateChangedEvent;
        if (ev?.chatEventType === "READ_STATE_CHANGED") {
          this.options?.chat?.onReadStateChanged?.(ev);
        }
      } catch (err) {
        console.error(
          "[PingMe SocketManager] Error parsing read state event:",
          err
        );
      }
    });
  }

  private unsubscribeRoom(): void {
    try {
      this.roomMsgSub?.unsubscribe();
      this.roomReadSub?.unsubscribe();
    } catch (e) {
      console.warn("[PingMe SocketManager] Error unsubscribing room:", e);
    }
    this.roomMsgSub = null;
    this.roomReadSub = null;
  }

  private cleanupAllSubscriptions(): void {
    console.log("[PingMe SocketManager] Cleaning up all subscriptions");

    try {
      // Chat subscriptions
      this.userRoomsSub?.unsubscribe();
      this.roomMsgSub?.unsubscribe();
      this.roomReadSub?.unsubscribe();

      // Global subscriptions
      this.friendshipSub?.unsubscribe();
      this.statusSub?.unsubscribe();
      this.signalingSub?.unsubscribe();
    } catch (e) {
      console.warn("[PingMe SocketManager] Error during cleanup:", e);
    }

    this.userRoomsSub = null;
    this.roomMsgSub = null;
    this.roomReadSub = null;
    this.friendshipSub = null;
    this.statusSub = null;
    this.signalingSub = null;
  }
}

// Export singleton instance
export const SocketManager = new SocketManagerClass();
