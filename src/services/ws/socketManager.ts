// =================================================================
// Socket Manager - Singleton quản lý tất cả WebSocket connections
// =================================================================
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import { store } from "@/features/store";
import {
  messageCreated,
  messageRecalled,
  readStateChanged,
  userTyping,
  roomCreated,
  roomUpdated,
  memberAdded,
  memberRemoved,
  memberRoleChanged,
} from "@/features/slices/chatSlice";

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
  TypingSignalPayload,
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
  private roomTypingSub: StompSubscription | null = null;

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
      console.log("[PingMe] Already connected, skipping connect");
      return;
    }

    this.manualDisconnect = false;
    this.options = opts;

    console.log("[PingMe] Initializing WebSocket connection...");

    this.client = new Client({
      webSocketFactory: () => {
        const url = `${opts.baseUrl}/ws`;
        console.log("[PingMe] Creating WebSocket to:", url);
        return new SockJS(url);
      },

      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },

      heartbeatIncoming: 15000,
      heartbeatOutgoing: 15000,
      reconnectDelay: 3000,
      maxWebSocketChunkSize: 8 * 1024,
    });

    this.client.onConnect = () => {
      console.log("[PingMe] Connected successfully!");
      this.setupSubscriptions();
    };

    this.client.onStompError = (frame) => {
      console.error(
        "[PingMe] STOMP error:",
        frame.headers["message"],
        frame.body
      );
    };

    this.client.onWebSocketError = (ev) => {
      console.error("[PingMe] WebSocket error:", ev);
    };

    this.client.onDisconnect = (frame) => {
      console.log("[PingMe] Disconnected");
      this.options?.onDisconnect?.(frame?.headers?.message);

      if (this.manualDisconnect) {
        this.cleanupAllSubscriptions();
        this.currentRoomIdRef = null;
      }
    };

    this.client.activate();
  }

  disconnect(): void {
    console.log("[PingMe] Manual disconnect initiated");
    this.manualDisconnect = true;
    this.cleanupAllSubscriptions();
    this.currentRoomIdRef = null;
    this.client?.deactivate();
    this.client = null;
  }

  sendTyping(roomId: number, isTyping: boolean): void {
    if (!this.isConnected() || !this.client) return;

    this.client.publish({
      destination: `/app/rooms/${roomId}/typing`,
      body: JSON.stringify({ isTyping }),
    });
  }

  // =================================================================
  // Chat-specific Methods
  // =================================================================

  enterRoom(roomId: number): void {
    if (!this.isConnected() || !this.client) {
      console.warn("[PingMe] Cannot enter room: not connected");
      return;
    }

    if (this.currentRoomIdRef === roomId) {
      console.log("[PingMe] Already in room:", roomId);
      return;
    }

    console.log("[PingMe] Entering room:", roomId);

    // Unsubscribe from old room
    this.unsubscribeRoom();

    // Subscribe to new room
    this.subscribeRoomMessages(roomId);
    this.subscribeRoomReadStates(roomId);
    this.subscribeRoomTyping(roomId);
    this.currentRoomIdRef = roomId;
  }

  leaveRoom(): void {
    console.log("[PingMe] Leaving current room");
    this.unsubscribeRoom();
    this.currentRoomIdRef = null;
  }

  // =================================================================
  // Private Methods - Subscription Management
  // =================================================================

  private setupSubscriptions(): void {
    console.log("[PingMe] Setting up subscriptions...");

    // Clean up old subscriptions first
    this.cleanupAllSubscriptions();

    // Setup Chat subscriptions
    this.setupChatSubscriptions();

    // Setup Global subscriptions
    this.setupGlobalSubscriptions();

    // Resubscribe to current room if exists
    if (this.currentRoomIdRef !== null) {
      this.resubscribeCurrentRoom();
    }
  }

  // Re-attach room-level listeners after reconnect to keep UI state continuous.
  private resubscribeCurrentRoom(): void {
    if (this.currentRoomIdRef === null) return;

    console.log("[PingMe] Resubscribing to room:", this.currentRoomIdRef);
    this.subscribeRoomMessages(this.currentRoomIdRef);
    this.subscribeRoomReadStates(this.currentRoomIdRef);
    this.subscribeRoomTyping(this.currentRoomIdRef);
  }

  // Shared JSON parser for all incoming frames. Returns null on invalid payload.
  private parsePayload<T>(
    message: IMessage,
    context: string,
    onError?: (err: unknown) => void
  ): T | null {
    try {
      return JSON.parse(message.body) as T;
    } catch (err) {
      console.error(`[PingMe] Error parsing ${context}:`, err);
      onError?.(err);
      return null;
    }
  }

  // Unsubscribe defensively because STOMP may throw when subscription is stale.
  private safeUnsubscribe(
    subscription: StompSubscription | null,
    context: string
  ): void {
    try {
      subscription?.unsubscribe();
    } catch (err) {
      console.warn(`[PingMe] Error unsubscribing ${context}:`, err);
    }
  }

  // Generic wrapper for /user/queue subscriptions to avoid repeating parse + guard logic.
  private subscribeQueueEvent<T>(
    destination: string,
    context: string,
    handler: ((payload: T) => void) | undefined,
    onParseError?: (err: unknown) => void
  ): StompSubscription | null {
    if (!this.client || !handler) return null;

    return this.client.subscribe(destination, (msg: IMessage) => {
      const payload = this.parsePayload<T>(msg, context, onParseError);
      if (!payload) return;
      handler(payload);
    });
  }

  // Setup user-level chat stream (room lifecycle events).
  private setupChatSubscriptions(): void {
    if (!this.client || !this.options?.chat) return;

    console.log("[PingMe] Setting up chat subscriptions");

    // Subscribe to user rooms
    this.userRoomsSub = this.client.subscribe(
      "/user/queue/rooms",
      (msg: IMessage) => {
        try {
          const ev = JSON.parse(msg.body);

          switch (ev.chatEventType) {
            case "ROOM_CREATED":
              store.dispatch(roomCreated(ev as RoomCreatedEventPayload));
              this.options?.chat?.onRoomCreated?.(
                ev as RoomCreatedEventPayload
              );
              break;
            case "ROOM_UPDATED":
              store.dispatch(roomUpdated(ev as RoomUpdatedEventPayload));
              this.options?.chat?.onRoomUpdated?.(
                ev as RoomUpdatedEventPayload
              );
              break;
            case "MEMBER_ADDED":
              store.dispatch(memberAdded(ev as RoomMemberAddedEventPayload));
              this.options?.chat?.onMemberAdded?.(
                ev as RoomMemberAddedEventPayload
              );
              break;
            case "MEMBER_REMOVED":
              store.dispatch(
                memberRemoved(ev as RoomMemberRemovedEventPayload)
              );
              this.options?.chat?.onMemberRemoved?.(
                ev as RoomMemberRemovedEventPayload
              );
              break;
            case "MEMBER_ROLE_CHANGED":
              store.dispatch(
                memberRoleChanged(ev as RoomMemberRoleChangedEventPayload)
              );
              this.options?.chat?.onMemberRoleChanged?.(
                ev as RoomMemberRoleChangedEventPayload
              );
              break;
            default:
              console.warn("[PingMe] Unknown chat event:", ev);
          }
        } catch (err) {
          console.error("[PingMe] Error parsing chat event:", err);
          toast.error(getErrorMessage(err, "Lỗi xử lý dữ liệu từ máy chủ"));
        }
      }
    );
  }

  // Setup non-room global streams (friendship, presence, signaling).
  private setupGlobalSubscriptions(): void {
    if (!this.client) return;

    console.log("[PingMe] Setting up global subscriptions");

    // Subscribe to friendship events
    this.friendshipSub = this.subscribeQueueEvent<FriendshipEventPayload>(
      "/user/queue/friendship",
      "friendship event",
      this.options?.onFriendEvent
    );

    // Subscribe to user status events
    this.statusSub = this.subscribeQueueEvent<UserStatusPayload>(
      "/user/queue/status",
      "status event",
      this.options?.onUserStatus
    );

    // Subscribe to signaling events
    this.signalingSub = this.subscribeQueueEvent<SignalingPayload>(
      "/user/queue/signaling",
      "signaling event",
      (ev) => {
        console.log("[PingMe] Received signaling event:", ev);
        this.options?.onSignaling?.(ev);
      }
    );
  }

  // Room message stream: new messages + recall updates.
  private subscribeRoomMessages(roomId: number): void {
    if (!this.isConnected() || !this.client) return;

    this.safeUnsubscribe(this.roomMsgSub, "room messages");

    const dest = `/topic/rooms/${roomId}/messages`;
    console.log("[PingMe] Subscribing to:", dest);

    this.roomMsgSub = this.client.subscribe(dest, (msg: IMessage) => {
      try {
        const ev = this.parsePayload<MessageCreatedEventPayload | MessageRecalledEventPayload>(
          msg,
          "message event"
        );
        if (!ev) return;

        switch (ev.chatEventType) {
          case "MESSAGE_CREATED":
            store.dispatch(messageCreated(ev as MessageCreatedEventPayload));
            this.options?.chat?.onMessageCreated?.(
              ev as MessageCreatedEventPayload
            );
            break;
          case "MESSAGE_RECALLED":
            store.dispatch(messageRecalled(ev as MessageRecalledEventPayload));
            this.options?.chat?.onMessageRecalled?.(
              ev as MessageRecalledEventPayload
            );
            break;
        }
      } catch (err) {
        console.error("[PingMe] Error handling message event:", err);
      }
    });
  }

  // Room read-state stream: updates seen/read markers per message.
  private subscribeRoomReadStates(roomId: number): void {
    if (!this.isConnected() || !this.client) return;

    this.safeUnsubscribe(this.roomReadSub, "room read states");

    const dest = `/topic/rooms/${roomId}/read-states`;
    console.log("[PingMe] Subscribing to:", dest);

    this.roomReadSub = this.client.subscribe(dest, (msg: IMessage) => {
      const ev = this.parsePayload<ReadStateChangedEvent>(
        msg,
        "read state event"
      );
      if (!ev || ev.chatEventType !== "READ_STATE_CHANGED") return;

      store.dispatch(readStateChanged(ev));
      this.options?.chat?.onReadStateChanged?.(ev);
    });
  }

  // Room typing stream: emits typing indicators for active participants.
  private subscribeRoomTyping(roomId: number): void {
    if (!this.isConnected() || !this.client) return;

    this.safeUnsubscribe(this.roomTypingSub, "room typing");

    const dest = `/topic/rooms/${roomId}/typing`;

    this.roomTypingSub = this.client.subscribe(dest, (msg: IMessage) => {
      const ev = this.parsePayload<TypingSignalPayload>(msg, "typing event");
      if (!ev) return;

      store.dispatch(userTyping(ev));
      this.options?.chat?.onTyping?.(ev);
    });
  }

  // Remove all room-scoped listeners before switching/leaving a room.
  private unsubscribeRoom(): void {
    this.safeUnsubscribe(this.roomMsgSub, "room messages");
    this.safeUnsubscribe(this.roomReadSub, "room read states");
    this.safeUnsubscribe(this.roomTypingSub, "room typing");

    this.roomMsgSub = null;
    this.roomReadSub = null;
    this.roomTypingSub = null;
  }

  // Global cleanup used by manual disconnect and reconnect preparation.
  private cleanupAllSubscriptions(): void {
    console.log("[PingMe] Cleaning up all subscriptions");

    this.safeUnsubscribe(this.userRoomsSub, "user rooms");
    this.safeUnsubscribe(this.roomMsgSub, "room messages");
    this.safeUnsubscribe(this.roomReadSub, "room read states");
    this.safeUnsubscribe(this.roomTypingSub, "room typing");
    this.safeUnsubscribe(this.friendshipSub, "friendship");
    this.safeUnsubscribe(this.statusSub, "status");
    this.safeUnsubscribe(this.signalingSub, "signaling");

    this.userRoomsSub = null;
    this.roomMsgSub = null;
    this.roomReadSub = null;
    this.friendshipSub = null;
    this.statusSub = null;
    this.signalingSub = null;
    this.roomTypingSub = null;
  }
}

export const SocketManager = new SocketManagerClass();
