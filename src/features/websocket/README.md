# Kiến trúc và Luồng hoạt động của Module WebSocket

Thư mục này chịu trách nhiệm khởi tạo kết nối WebSocket với server, sau đó lắng nghe, bóc tách và phân phối các loại sự kiện real-time (như có tin nhắn mới, yêu cầu kết bạn, người kia đang gõ phím, hay các luồng Video Call) đến đúng các Component đang cần.

Kiến trúc hiện tại đi theo mô hình **Singleton (tạo 1 kết nối duy nhất) + Pub/Sub (người đăng ký - người phát tin)** thông qua Event Emitter, đồng bộ nhẹ với Redux để quản trị State.

---

## Cấu trúc các file và thư mục

### 1. `socketManager.ts` (Trái tim của hệ thống)

Đây là tập tin quan trọng nhất vì nó giữ cái "ống nước" (connection) thông qua thư viện `@stomp/stompjs` với Server. Tại đây áp dụng mô hình thiết kế **Pub/Sub (Publisher/Subscriber)** bằng Event Emitter nội bộ thông qua thuộc tính `listeners` (Cuốn sổ ghi chép hàm chức năng).

- **Công dụng:**
  - Đóng vai trò là Singleton Class `SocketManagerClass`, duy trì một kết nối STOMP/SockJS duy nhất cho toàn app.
  - Sẽ thực hiện **Subscribe** (đăng ký) vào nhiều topic hay queue khác nhau từ Server gửi về (ví dụ `/user/queue/rooms`, `/user/queue/friendship`).
  - Đóng vai trò làm môt **Hệ thống Phát thanh (Đài chủ):**
    - `on('TÊN_EVENT', hàm_của_component)`: Khi Component cần lấy data Socket, nó gọi lệnh `on` để **Đăng ký** hàm (callback) của chính Component đó vào mảng `listeners` (Sổ tay hệ thống).
    - `emit('TÊN_EVENT', data_json)`: Khi Server báo có tin mới trả về, SocketManager lật "Sổ tay hệ thống" dò tìm các hàm của Component nào đang nghe `TÊN_EVENT` đó, rồi bơm data_json vào tất cả các hàm và kích hoạt chúng cùng một lúc.
    - `off('TÊN_EVENT', hàm_của_component)`: Xóa cái hàm khỏi sổ tay để ngăn rò rỉ bộ nhớ lúc Component bị tắt/chuyển trang.

### 2. `useSocket.ts` (Nút nguồn báo hiệu ứng dụng kết nối)

- **Công dụng:**
  - Là chiếc Hook khởi tạo quá trình gọi điện. File này sẽ gọi `SocketManager.connect()` ngay khi ứng dụng PingMe xác định được `userSession` (người dùng đã đăng nhập).
  - Nó định nghĩa một vài hàm nghe (`SocketManager.on()`) cấp ứng dụng. Ví dụ: Để hiện nhanh Toast thông báo góc phải khi có người mời kết bạn hoặc khi ai đó thêm bạn vào nhóm (Vì những Toast kiểu này luôn cần xuất hiện kể cả bạn đang ở bất kỳ trang nào).

### 3. Thư mục `models/` (Các DTOs quy định hợp đồng Data bằng Types)

Chứa `chatEvents.ts` và `systemEvents.ts`.

- **Công dụng:** Khai báo bằng Typescript định hình khuôn dáng chuẩn xác cho các object JSON được Server ném qua WebSocket (Ví dụ `FriendshipEventPayload` hay `MessageCreatedEventPayload`).

### 4. Thư mục `slices/` (Trạm lưu trữ Dữ liệu Tĩnh bằng Redux)

Mặc dù có EventEmitter để tung sự kiện đi các nơi, song có những sự kiện rất cần được lưu trữ cứng (lên Store) để Component mới nhảy vào sau này có thể thấy được data lịch sử.
Chứa `chatSlice.ts`.

- **Công dụng:**
  - Khai báo các Action và Reducer cho Redux (State Management).
  - Tự động ghim data của các luồng chat vào Global State. Ví dụ như khi có một `MESSAGE_CREATED` qua emit thì đồng thời gửi Action lên Redux `chatSlice.ts` để nhét tin nhắn đó vào mảng `state.messages`, lúc này giao diện `ChatBox` tự lấy dữ liệu hiển thị, thay vì phải tự quản lý Array ở Local State.

### 5. Thư mục `hooks/` (Phễu lọc rẽ nhánh giao diện)

Đây là tầng trung gian nhận Event và State từ Redux rồi xử lý ra giao diện React (Component).
Gồm `useChatSocketHandler.ts`, `useFriendshipSocketHandler.ts`, và `useCall.tsx`.

- **Công dụng:**
  - **`useChatSocketHandler.ts`**: Khi ở `ChatPage`, hook này sẽ gọi `SocketManager.on("ROOM_UPDATED", ...)`... Khi nó nhận Event, nó sẽ sắp xếp nhảy mảng đưa Room vừa có tin nhắn nhất lên trên cùng bảng (Sidebar) và cập nhật thông tin _last message_. Nó sẽ "xào nấu" dữ liệu rồi đẩy vào biến React (`setRooms`, `setSelectedChat`).
  - **`useFriendshipSocketHandler.ts`**: Dùng bên trong `ContactsPage`, giúp page này chủ động gọi Event báo Server (ví dụ bấm từ chối hay bấm gửi lời mời), lúc có ai đó phản hồi một cái nó sẽ cập nhật luôn cục State Tổng số Bạn băm hiển thị (ví dụ Bạn bè: 21, Lời mời: 5).
  - **`useCall.tsx`**: Đây là Context/Hook cao nhất quản lý tín hiệu WebRTC. Khi rớt nhánh `signalingEvent` (`INVITE`, `ACCEPT`, `HANGUP`...), nó sẽ bật Modal gọi màn hình lên mặt người dùng hoặc gập màn hình xuống.

---

## Tóm tắt Luồng sự kiện

Dưới đây là một luồng (flow) ví dụ từ lúc Socket nhận tin hiệu có tin nhắn mới cho dến khi rớt giao diện:
1. **[Tầng Nguồn]** Server bắn 1 message tới `/user/queue/rooms` mang nhãn hiệu "MESSAGE_CREATED".
2. **[Tầng Cửa]** Cảm biến của `socketManager.ts` bắt được, parse từ raw string sang JSON và gọi hàm `.emit("MESSAGE_CREATED", data)` -> tiếng chuông reng. (Vì nó chung mâm nên có thể nó cũng chọt `dispatch()` đẩy thẳng Message data vào cho Redux cắm vào `state.messages`).
3. **[Tầng Logic UI]** Tiếng chuông reng thì chạy đến `useChatSocketHandler.ts` (Được mount sẵn lúc bạn mở `/chat-page`). Hook này gọi hàm callback `handleNewMessage()`, bèn đẩy đoạn preview tin nhắn vào mảng `rooms` đang cho hiện ở LocalState.
4. **[Tầng Hiển Thị]** `ChatPage` tự re-render và update một cái thẻ Contact bên trái in đậm vì vừa có tin mới, giao diện `ChatBox` re-render do redux `messages` được nối dài thêm ra.

---

## Vòng đời của các Threads (Đăng ký/Hủy đăng ký STOMP Subscriptions)
Kiến trúc này chia Subscriptions làm 2 cấp độ rõ ràng (Global và Room-scoped) để tối ưu bộ nhớ.

### 1. Global Subscriptions (Luồng tĩnh - Tự động tạo một lần)
**Lúc nào tạo (`subscribe`)?**
Khi đăng nhập thành công và mở App, `useSocket.ts` sẽ gọi `SocketManager.connect()`. Sau khi STOMP kết nối xong, nó tự động dán các "ống cắm" vào server thông qua `setupGlobalSubscriptions()` và `setupChatSubscriptions()`.
Tạo ra các luồng theo dõi độc lập (Threads):
- `/user/queue/rooms` (Theo dõi xem có ai tạo phòng hoặc mời vào room không).
- `/user/queue/friendship` (Theo dõi lời mời kết bạn).
- `/user/queue/status` (Trạng thái Online/Offline của mọi người).
- `/user/queue/signaling` (Lắng nghe ai gọi Video Call tới).

**Lúc nào hủy (`unsubscribe`)?**
Các luồng này sẽ **sống mãi** chừng nào bạn còn đang mở App. Chúng chỉ bị tắt đi khi bạn Đăng xuất (tháo Session) hoặc đóng App. Khi tắt, `useSocket` sẽ gọi `SocketManager.disconnect()` và chạy hàm `cleanupAllSubscriptions()` để xóa sạch toàn bộ.

### 2. Room Subscriptions (Luồng động - Xóa/Tạo liên tục theo phòng Chat)
**Lúc nào tạo (`subscribe`)?**
Khi bạn click chuột vào một phòng Chat bất kỳ (ví dụ Phòng A), component sẽ báo cho hệ thống biết thông qua đoạn code trong `useChatSocketHandler` để gọi `SocketManager.enterRoom(A)`. Khi đó `SocketManager` tự động tạo ra 3 sub-thread bắt tín hiệu của đúng phòng A:
- `/topic/rooms/A/messages` (Lắng nghe tin nhắn bay vào Phòng A).
- `/topic/rooms/A/read-states` (Trạng thái xem đã đọc tin nhắn trong Phòng A chưa).
- `/topic/rooms/A/typing` (Tiểu xảo hiển thị bong bóng "Ai đó đang gõ..." vào Phòng A).

**Lúc nào hủy (`unsubscribe`)?**
Ngay khi bạn **click sang phòng Chat B** (Hoặc thoát khỏi màn hình nhắn tin):
Trình quản lý `SocketManager` sẽ tự động gọi hàm phòng vệ `unsubscribeRoom()`. 
Hàm này sẽ "bóp cổ" triệt tiêu 3 luồng tin nhắn cũ của vòng lập Phòng A đi, sau đó nó mới an toàn gọi lệnh `subscribe()` lập ra 3 luồng kết nối mới hoàn toàn để theo dõi Phòng B. 
**Tại sao phải làm vậy?** Việc này giúp App nhẹ nhàng mượt mà, không bị rò rỉ hay phình bộ nhớ máy tính vì theo dõi lén cùng lúc 100 phòng chat mà bạn từng click qua, đồng thời tránh việc tin nhắn phòng nọ nhảy xộn xộn vào phòng kia!
