// =================================================================
// Socket Manager - Singleton quản lý tất cả WebSocket connections
// =================================================================
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import { logout } from "@/features/auth/authThunk";
import { refreshAccessToken } from "@/lib/refreshTokenManager";

function isJwtExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;
    const decodedJson = atob(payloadBase64);
    const payload = JSON.parse(decodedJson);
    if (!payload.exp) return false;
    // Add 15 seconds margin
    return payload.exp * 1000 < Date.now() + 15000;
  } catch {
    return true;
  }
}
import {
  messageCreated,
  messageRecalled,
  readStateChanged,
  userTyping,
} from "@/features/websocket/chat";
import type {
  MessageCreatedEventPayload,
  MessageRecalledEventPayload,
  ReadStateChangedEvent,
  RoomCreatedEventPayload,
  RoomUpdatedEventPayload,
  RoomMemberAddedEventPayload,
  RoomMemberRemovedEventPayload,
  RoomMemberRoleChangedEventPayload,
  TypingSignalPayload,
} from "@/features/websocket/chat";

import type {
  FriendshipEventPayload,
  UserStatusPayload,
  SignalingPayload,
} from "@/features/websocket/system";
import type { TitleUpdate } from "@/types/ai/titleUpdate";

// =================================================================
// Event Emitter Types
// =================================================================
export interface SocketEventMap {
  // Global events
  FRIENDSHIP: FriendshipEventPayload;
  USER_STATUS: UserStatusPayload;
  SIGNALING: SignalingPayload;
  AI_CHAT_ROOM_TITLE: TitleUpdate;
  
  // Chat events
  MESSAGE_CREATED: MessageCreatedEventPayload;
  MESSAGE_RECALLED: MessageRecalledEventPayload;
  READ_STATE_CHANGED: ReadStateChangedEvent;
  USER_TYPING: TypingSignalPayload;
  
  ROOM_CREATED: RoomCreatedEventPayload;
  ROOM_UPDATED: RoomUpdatedEventPayload;
  ROOM_MEMBER_ADDED: RoomMemberAddedEventPayload;
  ROOM_MEMBER_REMOVED: RoomMemberRemovedEventPayload;
  ROOM_MEMBER_ROLE_CHANGED: RoomMemberRoleChangedEventPayload;
}

// =================================================================
// Types
// =================================================================
export interface SocketManagerOptions {
  baseUrl: string;
  dispatch: (action: unknown) => void;
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
  private aiChatRoomTitleSub: StompSubscription | null = null;
  private statusSub: StompSubscription | null = null;
  private signalingSub: StompSubscription | null = null;

  // =================================================================
  // EventEmitter Methods (Cơ chế Phát Thanh - Lắng Nghe)
  // =================================================================

  // 'listeners' là cuốn sổ tay lưu danh sách các hàm (callbacks) đang đăng ký nghe sự kiện.
  // Ví dụ: { "MESSAGE_CREATED": [hàm_cập_nhật_UI_của_ChatPage, hàm_phát_âm_thanh_TingTing] }
  private listeners: { [K in keyof SocketEventMap]?: Array<(payload: SocketEventMap[K]) => void> } = {};

  /**
   * ĐĂNG KÝ (Khán giả):
   * Các Component gọi hàm `on` để đăng ký lắng nghe 1 sự kiện.
   * @returns Trả về 1 hàm chức năng dùng để hủy đăng ký (Gọi hàm này lúc Component tắt đi)
   */
  public on<K extends keyof SocketEventMap>(event: K, listener: (payload: SocketEventMap[K]) => void) {
    // Nếu chưa có ngăn chứa cho chuyên mục này, tạo mảng rỗng
    if (!this.listeners[event]) {
      (this.listeners as Record<string, unknown[]>)[event as string] = [];
    }
    // Ghi tên hàm của Component vào sổ theo dõi
    ((this.listeners as Record<string, unknown[]>)[event as string]).push(listener);
    // Hàm rút tên khỏi sổ (unsubscribe)
    return () => this.off(event, listener);
  }

  /**
   * HỦY ĐĂNG KÝ:
   * Xóa hàm của Component ra khỏi sổ tay để giải phóng bộ nhớ.
   */
  public off<K extends keyof SocketEventMap>(event: K, listener: (payload: SocketEventMap[K]) => void) {
    if (!this.listeners[event]) return;
    (this.listeners as Record<string, unknown[]>)[event as string] = ((this.listeners as Record<string, unknown[]>)[event as string]).filter(l => l !== listener);
  }

  /**
   * PHÁT THANH (Đài chủ):
   * Khi Server có tin mới, SocketManager dùng `emit` để gọi tất cả các hàm trong sổ tay chạy.
   */
  private emit<K extends keyof SocketEventMap>(event: K, payload: SocketEventMap[K]) {
    // Không có ai ngóng tin này thì thôi
    if (!this.listeners[event]) return;
    
    // Nếu có người ngóng, lôi lần lượt từng hàm ra thực thi và đưa cục 'payload' vào hàm đó
    this.listeners[event]!.forEach(l => {
      try {
        l(payload);
      } catch (err) {
        console.error(`[PingMe] Error in event listener for ${event}:`, err);
      }
    });
  }

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
        const url = `${opts.baseUrl}/core-service/ws`;
        console.log("[PingMe] Creating WebSocket to:", url);
        return new SockJS(url);
      },

      beforeConnect: () => {
        return new Promise<void>((resolve, reject) => {
          const connectAsync = async () => {
            let token = localStorage.getItem("access_token");

            if (isJwtExpired(token)) {
              console.log("[PingMe] Token expired before WS connect, refreshing...");
              try {
                token = await refreshAccessToken(
                  import.meta.env.VITE_BACKEND_BASE_URL,
                );
              } catch (err) {
                console.error("[PingMe] Failed to refresh token before WS connect", err);
                this.disconnect();
                this.options?.dispatch(logout() as unknown);
                reject();
                return;
              }
            }

            if (this.client) {
              this.client.connectHeaders = {
                Authorization: `Bearer ${token}`,
              };
            }
            resolve();
          };
          connectAsync().catch(reject);
        });
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
        frame.body,
      );

      const msg = frame.headers["message"]?.toLowerCase() || "";
      if (msg.includes("expired") || msg.includes("401") || msg.includes("forbidden") || msg.includes("security")) {
        console.error("[PingMe] Token expired or forbidden from STOMP error, triggering logout...");
        this.disconnect();
        this.options?.dispatch(logout() as unknown);
      }
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
    onError?: (err: unknown) => void,
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
    context: string,
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
    onParseError?: (err: unknown) => void,
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
    if (!this.client) return;

    console.log("[PingMe] Setting up chat subscriptions");

    // Subscribe to user rooms
    this.userRoomsSub = this.client.subscribe(
      "/user/queue/rooms",
      (msg: IMessage) => {
        try {
          const ev = JSON.parse(msg.body);

          switch (ev.chatEventType) {
            case "ROOM_CREATED":
              this.emit("ROOM_CREATED", ev);
              break;
            case "ROOM_UPDATED":
              this.emit("ROOM_UPDATED", ev);
              break;
            case "MEMBER_ADDED":
              this.emit("ROOM_MEMBER_ADDED", ev);
              break;
            case "MEMBER_REMOVED":
              this.emit("ROOM_MEMBER_REMOVED", ev);
              break;
            case "MEMBER_ROLE_CHANGED":
              this.emit("ROOM_MEMBER_ROLE_CHANGED", ev);
              break;
            default:
              console.warn("[PingMe] Unknown chat event:", ev);
          }
        } catch (err) {
          console.error("[PingMe] Error parsing chat event:", err);
          toast.error(getErrorMessage(err, "Lỗi xử lý dữ liệu từ máy chủ"));
        }
      },
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
      (ev) => {
        this.emit("FRIENDSHIP", ev);
      },
    );

    // Subscribe to user status events
    this.statusSub = this.subscribeQueueEvent<UserStatusPayload>(
      "/user/queue/status",
      "status event",
      (ev) => {
        this.emit("USER_STATUS", ev);
      },
    );

    // Subscribe to AI chat room title update events
    this.aiChatRoomTitleSub = this.client.subscribe(
      "/user/queue/title-update",
      (msg: IMessage) => {
        try {
          const ev = JSON.parse(msg.body) as TitleUpdate;
          this.emit("AI_CHAT_ROOM_TITLE", ev);
        } catch (err) {
          console.error("[PingMe] Error parsing AI chat room title update event:", err);
        }
      },
    );

    // Subscribe to signaling events
    this.signalingSub = this.subscribeQueueEvent<SignalingPayload>(
      "/user/queue/signaling",
      "signaling event",
      (ev) => {
        console.log("[PingMe] Received signaling event:", ev);
        this.emit("SIGNALING", ev);
      },
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
        const ev = this.parsePayload<
          MessageCreatedEventPayload | MessageRecalledEventPayload
        >(msg, "message event");
        if (!ev) return;

        switch (ev.chatEventType) {
          case "MESSAGE_CREATED":
            this.options?.dispatch(messageCreated(ev as MessageCreatedEventPayload));
            this.emit("MESSAGE_CREATED", ev as MessageCreatedEventPayload);
            break;
          case "MESSAGE_RECALLED":
            this.options?.dispatch(messageRecalled(ev as MessageRecalledEventPayload));
            this.emit("MESSAGE_RECALLED", ev as MessageRecalledEventPayload);
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
        "read state event",
      );
      if (!ev || ev.chatEventType !== "READ_STATE_CHANGED") return;

      this.options?.dispatch(readStateChanged(ev));
      this.emit("READ_STATE_CHANGED", ev);
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

      this.options?.dispatch(userTyping(ev));
      this.emit("USER_TYPING", ev);
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
    this.safeUnsubscribe(this.aiChatRoomTitleSub, "ai chat room title");
    this.safeUnsubscribe(this.signalingSub, "signaling");

    this.userRoomsSub = null;
    this.roomMsgSub = null;
    this.roomReadSub = null;
    this.friendshipSub = null;
    this.statusSub = null;
    this.signalingSub = null;
    this.aiChatRoomTitleSub = null;
    this.roomTypingSub = null;
  }
}

export const SocketManager = new SocketManagerClass();
