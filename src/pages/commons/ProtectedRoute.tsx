import { useAppSelector } from "@/features/hooks.ts";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  to?: string;
}

export const ProtectedRoute = ({
  children,
  to = "/auth", // Mặc định sẽ điều hướng về trang /auth
}: ProtectedRouteProps) => {
  // isLogin phản ánh trạng thái xác thực của người dùng.
  // Giá trị isLogin vẫn luôn true khi người dùng refresh
  // session.
  //
  // nên là biến này đáng tin cậy để kiểm tra
  // người dùng đã đăng nhập hay chưa.
  const { isLogin, logoutReason } = useAppSelector((state) => state.auth);

  // Nếu chưa đăng nhập thì hiển thị thông báo và chuyển hướng sang trang chỉ định
  if (!isLogin) {
    if (logoutReason === "EXPIRED") toast.error("Phiên đăng nhập đã hết hạn");

    return <Navigate to={to} />;
  }

  // Nếu đã đăng nhập thì cho phép render nội dung được bảo vệ
  return <>{children}</>;
};
