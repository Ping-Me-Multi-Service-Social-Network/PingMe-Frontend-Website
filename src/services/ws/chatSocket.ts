import type {
  MessageRecalledResponse,
  MessageResponse,
} from "@/types/chat/message";
import type { RoomResponse } from "@/types/chat/room";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { toast } from "sonner";

// =================================================================
// Type
// =================================================================
export type ChatEventType =
  | "MESSAGE_CREATED"
  | "MESSAGE_RECALLED"
  | "READ_STATE_CHANGED"
  | "ROOM_CREATED"
  | "ROOM_UPDATED"
  | "MEMBER_ADDED"
  | "MEMBER_REMOVED"
  | "MEMBER_ROLE_CHANGED";

export interface MessageCreatedEventPayload {
  chatEventType: "MESSAGE_CREATED";
  messageResponse: MessageResponse;
}

export interface MessageRecalledEventPayload {
  chatEventType: "MESSAGE_RECALLED";
  messageRecalledResponse: MessageRecalledResponse;
}

export interface ReadStateChangedEvent {
  chatEventType: "READ_STATE_CHANGED";
  roomId: number;
  userId?: number;
  lastReadMessageId: number;
  lastReadAt: string;
}

export interface RoomCreatedEventPayload {
  chatEventType: "ROOM_CREATED";
  roomResponse: RoomResponse;
}

export interface RoomUpdatedEventPayload {
  chatEventType: "ROOM_UPDATED";
  roomResponse: RoomResponse;
  systemMessage?: MessageResponse;
}

export interface RoomMemberAddedEventPayload {
  chatEventType: "MEMBER_ADDED";
  roomResponse: RoomResponse;
  targetUserId: number;
  actorUserId: number;
  systemMessage?: MessageResponse;
}

export interface RoomMemberRemovedEventPayload {
  chatEventType: "MEMBER_REMOVED";
  roomResponse: RoomResponse;
  targetUserId: number;
  actorUserId: number;
  systemMessage?: MessageResponse;
}

export interface RoomMemberRoleChangedEventPayload {
  chatEventType: "MEMBER_ROLE_CHANGED";
  roomResponse: RoomResponse;
  targetUserId: number;
  oldRole: "OWNER" | "ADMIN" | "MEMBER";
  newRole: "OWNER" | "ADMIN" | "MEMBER";
  actorUserId: number;
  systemMessage?: MessageResponse;
}

export interface ChatWSOptions {
  baseUrl: string;

  onDisconnect?: (reason?: string) => void;

  // message events
  onMessageCreated?: (ev: MessageCreatedEventPayload) => void;
  onMessageRecalled?: (ev: MessageRecalledEventPayload) => void;

  // room events
  onRoomCreated?: (ev: RoomCreatedEventPayload) => void;
  onRoomUpdated?: (ev: RoomUpdatedEventPayload) => void;

  // member events
  onMemberAdded?: (ev: RoomMemberAddedEventPayload) => void;
  onMemberRemoved?: (ev: RoomMemberRemovedEventPayload) => void;
  onMemberRoleChanged?: (ev: RoomMemberRoleChangedEventPayload) => void;

  // read state
  onReadStateChanged?: (ev: ReadStateChangedEvent) => void;
}
// =================================================================
// Internal State
// =================================================================
let client: Client | null = null;
let manualDisconnect = false;
let lastOpts: ChatWSOptions | null = null;

let userRoomsSub: StompSubscription | null = null;

let currentRoomIdRef: number | null = null;
let roomMsgSub: StompSubscription | null = null;
let roomReadSub: StompSubscription | null = null;

// ================================================================
// Connect / Disconnect
// ================================================================
export function isConnected(): boolean {
  return !!client?.connected;
}

export function connectChatWS(opts: ChatWSOptions) {
  if (isConnected()) return;
  manualDisconnect = false;
  lastOpts = opts;

  // ---------------------------------------------------------------------------------------------------------
  // WebSocket STOMP Client Configuration
  //
  // 1. Gửi HTTP Request yêu cầu nâng cấp kết nối thành kênh hai chiều (Bi-directional connection)
  //    hay còn gọi là WebSocket connection.
  //
  // 2. Gửi kèm param `access_token` của người dùng để Backend xác định session tương ứng.
  //
  // 3. Các thông số điều chỉnh quan trọng:
  //    - heartbeatIncoming:  FE mong đợi nhận heartbeat từ BE (server → client)
  //    - heartbeatOutgoing:  FE sẽ gửi heartbeat về BE (client → server)
  //    - reconnectDelay:     Thời gian (ms) chờ trước khi tự động thử kết nối lại sau khi bị disconnect
  //    - maxWebSocketChunkSize: Giới hạn kích thước tối đa mỗi chunk khi gửi message qua WS (bytes)
  //
  client = new Client({
    webSocketFactory: () => {
      const token = localStorage.getItem("access_token") ?? "";
      const url = `${opts.baseUrl}/ws?access_token=${encodeURIComponent(
        token
      )}`;
      return new SockJS(url);
    },
    heartbeatIncoming: 15000,
    heartbeatOutgoing: 15000,
    reconnectDelay: 3000,
    maxWebSocketChunkSize: 8 * 1024,
  });
  //
  // ---------------------------------------------------------------------------------------------------------
  // WebSocket Connection Handler
  //
  // 1. Hàm được gọi khi kết nối STOMP giữa FE ↔ BE được thiết lập thành công.
  //
  // 2. Quy trình thực hiện:
  //    - Unsubscribe kênh cũ (nếu còn tồn tại) để tránh trùng lặp đăng ký.
  //    - Subscribe lại kênh /user/queue/rooms để lắng nghe các event ROOM_UPDATED từ Backend.
  //    - Nếu người dùng đang mở một phòng cụ thể, thực hiện resubscribe lại
  //      các kênh messages và read-states cho phòng đó.
  //
  // 3. Hành vi:
  //    - Khi nhận event ROOM_UPDATED → gọi callback onRoomUpdated để cập nhật danh sách phòng.
  //    - Khi parse JSON lỗi → hiển thị thông báo lỗi bằng toast.
  //
  client.onConnect = () => {
    // Unsubscribe kênh
    if (client?.connected && userRoomsSub) userRoomsSub.unsubscribe();

    // Subscribe lại kênh /user/queue/rooms để nhận event từ BE
    userRoomsSub = client!.subscribe("/user/queue/rooms", (msg: IMessage) => {
      try {
        const ev = JSON.parse(msg.body);

        switch (ev.chatEventType as ChatEventType) {
          // ============================================
          // ROOM EVENTS
          // ============================================
          case "ROOM_CREATED":
            lastOpts?.onRoomCreated?.(ev);
            break;

          case "ROOM_UPDATED":
            lastOpts?.onRoomUpdated?.(ev);
            break;

          // ============================================
          // MEMBER EVENTS
          // ============================================
          case "MEMBER_ADDED":
            lastOpts?.onMemberAdded?.(ev);
            break;

          case "MEMBER_REMOVED":
            lastOpts?.onMemberRemoved?.(ev);
            break;

          case "MEMBER_ROLE_CHANGED":
            lastOpts?.onMemberRoleChanged?.(ev);
            break;

          // ============================================
          // FALLBACK
          // ============================================
          default:
            console.warn("[PingMe] Unknown event:", ev);
        }
      } catch (err) {
        toast.error(getErrorMessage(err, "Lỗi xử lý dữ liệu từ máy chủ"));
      }
    });

    // Nếu trước đó đang mở 1 phòng, khi reconnect thì resubscribe lại
    if (currentRoomIdRef != null) {
      _subscribeRoomMessages(currentRoomIdRef);
      _subscribeRoomReadStates(currentRoomIdRef);
    }
  };
  // ---------------------------------------------------------------------------------------------------------
  // Chưa hoàn thiện
  client.onStompError = (frame) => {
    console.error(
      "[PingMe] STOMP error:",
      frame.headers["message"],
      frame.body
    );
  };

  client.onWebSocketError = (ev) => {
    console.error("[PingMe] WebSocket error:", ev);
  };
  // ---------------------------------------------------------------------------------------------------------

  client.onDisconnect = (frame) => {
    // không clear currentRoomIdRef để reconnect còn biết phòng đang mở
    userRoomsSub = null;
    lastOpts?.onDisconnect?.(frame?.headers?.message);

    if (manualDisconnect) {
      try {
        roomMsgSub?.unsubscribe();
        roomReadSub?.unsubscribe();
      } catch (e) {
        console.warn("[PingMe] cleanup subs err:", e);
      }
      roomMsgSub = null;
      roomReadSub = null;
      currentRoomIdRef = null;
    }
  };

  client.activate();
}

export function disconnectChatWS() {
  manualDisconnect = true;
  try {
    userRoomsSub?.unsubscribe();
    userRoomsSub = null;

    roomMsgSub?.unsubscribe();
    roomReadSub?.unsubscribe();
    roomMsgSub = null;
    roomReadSub = null;
    currentRoomIdRef = null;
  } catch (e) {
    console.warn("[PingMe] unsubscribe on disconnect err:", e);
  }
  client?.deactivate();
  client = null;
}

export function enterRoom(roomId: number) {
  if (!isConnected() || !client) return;
  if (currentRoomIdRef === roomId) return; // đã ở phòng này rồi

  // huỷ sub của phòng cũ (nếu có)
  try {
    roomMsgSub?.unsubscribe();
  } catch (e) {
    console.warn(e);
  }
  try {
    roomReadSub?.unsubscribe();
  } catch (e) {
    console.warn(e);
  }

  // sub phòng mới
  _subscribeRoomMessages(roomId);
  _subscribeRoomReadStates(roomId);
  currentRoomIdRef = roomId;
}

export function leaveRoom() {
  try {
    roomMsgSub?.unsubscribe();
  } catch (e) {
    console.warn(e);
  }
  try {
    roomReadSub?.unsubscribe();
  } catch (e) {
    console.warn(e);
  }
  roomMsgSub = null;
  roomReadSub = null;
  currentRoomIdRef = null;
}

// ================================================================
//  Subscribe helpers
// ================================================================
function _subscribeRoomMessages(roomId: number) {
  if (!isConnected() || !client) return;

  try {
    roomMsgSub?.unsubscribe();
  } catch (e) {
    console.warn("[PingMe] _subscribeRoomMessages old unsub err:", e);
  }

  const dest = `/topic/rooms/${roomId}/messages`;
  roomMsgSub = client.subscribe(dest, (msg: IMessage) => {
    try {
      const ev = JSON.parse(msg.body) as
        | MessageCreatedEventPayload
        | MessageRecalledEventPayload;

      switch (ev.chatEventType) {
        case "MESSAGE_CREATED":
          lastOpts?.onMessageCreated?.(ev);
          break;

        case "MESSAGE_RECALLED":
          lastOpts?.onMessageRecalled?.(ev);
          break;
      }
    } catch (e) {
      console.error("[PingMe] parse MESSAGE event error:", e, msg.body);
    }
  });
}

function _subscribeRoomReadStates(roomId: number) {
  if (!isConnected() || !client) return;

  try {
    roomReadSub?.unsubscribe();
  } catch (e) {
    console.warn("[PingMe] _subscribeRoomReadStates old unsub err:", e);
  }

  const dest = `/topic/rooms/${roomId}/read-states`;
  roomReadSub = client.subscribe(dest, (msg: IMessage) => {
    try {
      const ev = JSON.parse(msg.body) as ReadStateChangedEvent;
      if (ev?.chatEventType === "READ_STATE_CHANGED") {
        lastOpts?.onReadStateChanged?.(ev);
      }
    } catch (e) {
      console.error("[PingMe] parse READ_STATE_CHANGED error:", e, msg.body);
    }
  });
}
