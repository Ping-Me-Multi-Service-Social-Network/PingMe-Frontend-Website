// src/pages/public-routes-page/forget-password-page/index.tsx
import { Outlet } from "react-router-dom";

export default function ForgetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8">
        <Outlet />
      </div>
    </div>
  );
}
