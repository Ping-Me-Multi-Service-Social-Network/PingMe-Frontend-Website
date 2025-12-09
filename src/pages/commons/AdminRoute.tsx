import { useAppSelector } from "@/features/hooks.ts";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isLogin, userSession } = useAppSelector((state) => state.auth);

  if (!isLogin) {
    toast.error("Vui lòng đăng nhập");
    return <Navigate to="/auth" />;
  }

  console.log("[PingMe] User role:", userSession.roleName);

  if (userSession.roleName !== "ADMIN") {
    toast.error("Bạn không có quyền truy cập trang này");
    return <Navigate to="/home" />;
  }

  return <>{children}</>;
};
