import { useTourFactory, type TourStepConfig } from "./useTourFactory";

const steps: TourStepConfig[] = [
    {
        step: {
            popover: {
                title: "👋 Chào mừng đến PingMe!",
                description:
                    "PingMe là mạng xã hội đa dịch vụ với nhiều tính năng hấp dẫn.<br><br>Hãy cùng tìm hiểu nhanh các chức năng chính nhé!",
                align: "center",
                side: "bottom",
            },
        },
    },
    {
        step: {
            element: "#nav-chat",
            popover: {
                title: "💬 Tin Nhắn",
                description:
                    "Trò chuyện <b>1-1</b> hoặc <b>nhóm</b> với bạn bè.<br><br>Gửi tin nhắn, ảnh, file và thực hiện cuộc gọi video.",
                side: "right",
                align: "center",
            },
        },
    },
    {
        step: {
            element: "#nav-contacts",
            popover: {
                title: "👥 Danh Bạ",
                description:
                    "Quản lý <b>danh sách bạn bè</b>.<br><br>Tìm kiếm, thêm bạn mới và quản lý lời mời kết bạn.",
                side: "right",
                align: "center",
            },
        },
    },
    {
        step: {
            element: "#nav-music",
            popover: {
                title: "🎵 Nghe Nhạc",
                description:
                    "Nghe nhạc trực tuyến, tạo <b>playlist</b> riêng.<br><br>Khám phá nghệ sĩ, album và bảng xếp hạng.",
                side: "right",
                align: "center",
            },
        },
    },
    {
        step: {
            element: "#nav-reels",
            popover: {
                title: "🎬 Thước Phim",
                description:
                    "Xem và chia sẻ <b>video ngắn</b> thú vị.<br><br>Tìm kiếm video và quản lý video của bạn.",
                side: "right",
                align: "center",
            },
        },
    },
    {
        step: {
            element: "#nav-ping-ai",
            popover: {
                title: "🤖 Ping AI",
                description:
                    "Trợ lý <b>AI thông minh</b> hỗ trợ bạn.<br><br>Đặt câu hỏi, nhờ tư vấn hoặc trò chuyện cùng AI.",
                side: "right",
                align: "center",
            },
        },
    },
    {
        step: {
            element: "#nav-user-menu",
            popover: {
                title: "⚙️ Tài khoản",
                description:
                    "Quản lý <b>hồ sơ cá nhân</b>, đổi mật khẩu và đăng xuất.<br><br>Nhấn vào avatar để mở menu tài khoản.",
                side: "right",
                align: "center",
            },
        },
    },
];

export function useGlobalTour() {
    return useTourFactory({
        storageKey: "pingme_global_tour_completed",
        steps,
        doneText: "Bắt đầu khám phá! 🚀",
    });
}
