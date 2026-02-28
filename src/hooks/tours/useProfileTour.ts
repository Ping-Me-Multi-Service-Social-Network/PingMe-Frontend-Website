import { useTourFactory, createTourStep, type TourStepConfig } from "./useTourFactory";

const USER_INFO = "/app/profile/user-info";
const CHANGE_PW = "/app/profile/change-password";
const DEVICE_MG = "/app/profile/device-management";

const steps: TourStepConfig[] = [
    createTourStep(
        "👋 Chào mừng đến trang Hồ sơ!",
        "Đây là nơi bạn quản lý tài khoản.<br><br>📸 Nhấn vào <b>ảnh đại diện</b> để thay đổi avatar (JPG/PNG, tối đa 5MB).",
        "#profile-avatar-panel",
        "bottom",
        "center",
        USER_INFO
    ),
    createTourStep(
        "📋 Thông tin cá nhân",
        "Xem và chỉnh sửa <b>thông tin cá nhân</b> của bạn. Cùng xem chi tiết nhé!",
        "#profile-nav-user-info",
        "right",
        "center",
        USER_INFO
    ),
    createTourStep(
        "✏️ Chỉnh sửa thông tin",
        "Tại đây bạn có thể cập nhật:<br><br>• <b>Họ tên, Giới tính, Ngày sinh, Địa chỉ</b><br>• Email <b>không thể thay đổi</b> sau khi đăng ký<br><br>Nhấn <b>\"Cập nhật thông tin\"</b> bên dưới để lưu.",
        "#profile-info-fields",
        "left",
        "start",
        USER_INFO
    ),
    createTourStep(
        "🔐 Đổi mật khẩu",
        "Đổi mật khẩu định kỳ để <b>bảo mật tài khoản</b>. Cùng xem chi tiết nhé!",
        "#profile-nav-change-password",
        "right",
        "center",
        USER_INFO
    ),
    createTourStep(
        "🔐 Đổi mật khẩu",
        "Nhập <b>mật khẩu hiện tại</b>, <b>mật khẩu mới</b> (ít nhất 6 ký tự) và <b>xác nhận</b>.<br><br>💡 Hệ thống kiểm tra <b>độ mạnh mật khẩu</b> tự động.",
        "#profile-password-form",
        "left",
        "start",
        CHANGE_PW
    ),
    createTourStep(
        "📱 Quản lý thiết bị",
        "Xem và quản lý <b>các thiết bị</b> đang đăng nhập vào tài khoản. Cùng xem chi tiết nhé!",
        "#profile-nav-device-management",
        "right",
        "center",
        CHANGE_PW
    ),
    createTourStep(
        "📱 Quản lý thiết bị",
        "Xem <b>tất cả thiết bị</b> đang đăng nhập, kiểm tra hệ điều hành và trình duyệt.<br><br>🗑️ Nhấn <b>\"Xóa phiên\"</b> để đăng xuất từ xa nếu nghi ngờ truy cập bất thường.<br><br>🟢 Phiên hiện tại đánh dấu <b>xanh</b> và không thể xóa.",
        "#profile-device-section",
        "left",
        "start",
        DEVICE_MG
    ),
];

export function useProfileTour() {
    return useTourFactory({
        storageKey: "pingme_profile_tour_completed",
        prerequisiteKey: "pingme_global_tour_completed",
        steps,
        returnRoute: USER_INFO,
    });
}
