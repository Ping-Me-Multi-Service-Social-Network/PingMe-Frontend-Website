# WebSocket feature

Feature này gom toàn bộ logic realtime của frontend website.

## Cấu trúc

- `core/`
  - `socketManager.ts`: singleton giữ kết nối STOMP/SockJS, subscribe destination và phát event nội bộ.
- `events/`
  - `chatEvents.ts`: DTO cho chat room, message, typing, read-state.
  - `systemEvents.ts`: DTO cho friendship, status, signaling.
- `state/`
  - `chatSlice.ts`: Redux state cho message hiện tại và typing indicator.
- `hooks/`
  - `useSocket.ts`: mở kết nối cấp app.
  - `useChatSocketHandler.ts`: gắn chat page với các chat event.
- `providers/`
  - `CallProvider.tsx`: state và UI adapter cho signaling/call.
- entrypoint:
  - `index.ts`: export `SocketManager`, `useSocket`, `useCall`, `CallProvider`
  - `chat.ts`: export chat event types + chat Redux API
  - `system.ts`: export system event types

## Luồng chính

1. `useSocket()` kết nối một lần sau khi có session.
2. `SocketManager` subscribe các queue dùng chung như friendship, status, signaling, rooms.
3. Khi mở room chat, `useChatSocketHandler` gọi `enterRoom(roomId)` để subscribe message, read-state, typing của room đó.
4. Event từ socket được:
   - dispatch vào Redux nếu cần state dùng chung
   - emit ra listener để UI đang mount xử lý thêm

## Hướng dùng

- Component thường chỉ import từ:
  - `@/features/websocket`
  - `@/features/websocket/chat`
  - `@/features/websocket/system`
- Không import sâu vào `core/`, `events/`, `state/` trừ khi đang sửa chính feature này.
- Cách này giữ API dùng ở app ổn định hơn nếu sau này tách phần transport/UI adapter cho React Native.
