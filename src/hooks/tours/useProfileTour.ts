import { useTourFactory, type TourStepConfig } from "./useTourFactory";

const USER_INFO = "/app/profile/user-info";
const CHANGE_PW = "/app/profile/change-password";
const DEVICE_MG = "/app/profile/device-management";

const steps: TourStepConfig[] = [
    {
        route: USER_INFO,
        step: {
            element: "#profile-avatar-panel",
            popover: {
                title: "👋 Chào mừng đến trang Hồ sơ!",
                description:
                    "Đây là nơi bạn quản lý tài khoản.<br><br>📸 Nhấn vào <b>ảnh đại diện</b> để thay đổi avatar (JPG/PNG, tối đa 5MB).",
                side: "bottom",
                align: "center",
            },
        },
    },
    {
        route: USER_INFO,
        step: {
            element: "#profile-nav-user-info",
            popover: {
                title: "📋 Thông tin cá nhân",
                description:
                    "Xem và chỉnh sửa <b>thông tin cá nhân</b> của bạn. Cùng xem chi tiết nhé!",
                side: "right",
                align: "center",
            },
        },
    },
    {
        route: USER_INFO,
        step: {
            element: "#profile-info-fields",
            popover: {
                title: "✏️ Chỉnh sửa thông tin",
                description:
                    "Tại đây bạn có thể cập nhật:<br><br>• <b>Họ tên, Giới tính, Ngày sinh, Địa chỉ</b><br>• Email <b>không thể thay đổi</b> sau khi đăng ký<br><br>Nhấn <b>\"Cập nhật thông tin\"</b> bên dưới để lưu.",
                side: "left",
                align: "start",
            },
        },
    },
    {
        route: USER_INFO,
        step: {
            element: "#profile-nav-change-password",
            popover: {
                title: "🔐 Đổi mật khẩu",
                description:
                    "Đổi mật khẩu định kỳ để <b>bảo mật tài khoản</b>. Cùng xem chi tiết nhé!",
                side: "right",
                align: "center",
            },
        },
    },
    {
        route: CHANGE_PW,
        step: {
            element: "#profile-password-form",
            popover: {
                title: "🔐 Đổi mật khẩu",
                description:
                    "Nhập <b>mật khẩu hiện tại</b>, <b>mật khẩu mới</b> (ít nhất 6 ký tự) và <b>xác nhận</b>.<br><br>💡 Hệ thống kiểm tra <b>độ mạnh mật khẩu</b> tự động.",
                side: "left",
                align: "start",
            },
        },
    },
    {
        route: CHANGE_PW,
        step: {
            element: "#profile-nav-device-management",
            popover: {
                title: "📱 Quản lý thiết bị",
                description:
                    "Xem và quản lý <b>các thiết bị</b> đang đăng nhập vào tài khoản. Cùng xem chi tiết nhé!",
                side: "right",
                align: "center",
            },
        },
    },
    {
        route: DEVICE_MG,
        step: {
            element: "#profile-device-section",
            popover: {
                title: "📱 Quản lý thiết bị",
                description:
                    "Xem <b>tất cả thiết bị</b> đang đăng nhập, kiểm tra hệ điều hành và trình duyệt.<br><br>🗑️ Nhấn <b>\"Xóa phiên\"</b> để đăng xuất từ xa nếu nghi ngờ truy cập bất thường.<br><br>🟢 Phiên hiện tại đánh dấu <b>xanh</b> và không thể xóa.",
                side: "left",
                align: "start",
            },
        },
    },
];

export function useProfileTour() {
    return useTourFactory({
        storageKey: "pingme_profile_tour_completed",
        prerequisiteKey: "pingme_global_tour_completed",
        steps,
        returnRoute: USER_INFO,
    });
}
