import { useTourFactory, createTourStep, type TourStepConfig } from "./useTourFactory";

const steps: TourStepConfig[] = [
    createTourStep(
        "👋 Chào mừng đến PingMe!",
        "PingMe là mạng xã hội đa dịch vụ với nhiều tính năng hấp dẫn.<br><br>Hãy cùng tìm hiểu nhanh các chức năng chính nhé!",
        undefined,
        "bottom",
        "center"
    ),
    createTourStep(
        "💬 Tin Nhắn",
        "Trò chuyện <b>1-1</b> hoặc <b>nhóm</b> với bạn bè.<br><br>Gửi tin nhắn, ảnh, file và thực hiện cuộc gọi video.",
        "#nav-chat"
    ),
    createTourStep(
        "👥 Danh Bạ",
        "Quản lý <b>danh sách bạn bè</b>.<br><br>Tìm kiếm, thêm bạn mới và quản lý lời mời kết bạn.",
        "#nav-contacts"
    ),
    createTourStep(
        "🎵 Nghe Nhạc",
        "Nghe nhạc trực tuyến, tạo <b>playlist</b> riêng.<br><br>Khám phá nghệ sĩ, album và bảng xếp hạng.",
        "#nav-music"
    ),
    createTourStep(
        "🎬 Thước Phim",
        "Xem và chia sẻ <b>video ngắn</b> thú vị.<br><br>Tìm kiếm video và quản lý video của bạn.",
        "#nav-reels"
    ),
    createTourStep(
        "🤖 Ping AI",
        "Trợ lý <b>AI thông minh</b> hỗ trợ bạn.<br><br>Đặt câu hỏi, nhờ tư vấn hoặc trò chuyện cùng AI.",
        "#nav-ping-ai"
    ),
    createTourStep(
        "⚙️ Tài khoản",
        "Quản lý <b>hồ sơ cá nhân</b>, đổi mật khẩu và đăng xuất.<br><br>Nhấn vào avatar để mở menu tài khoản.",
        "#nav-user-menu"
    ),
];

export function useGlobalTour() {
    return useTourFactory({
        storageKey: "pingme_global_tour_completed",
        steps,
        doneText: "Bắt đầu khám phá! 🚀",
    });
}
