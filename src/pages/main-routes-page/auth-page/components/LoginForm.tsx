import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Eye, EyeOff, Mail, Lock, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { LoginRequest } from "@/types/authentication";
import { useAppDispatch } from "@/features/hooks.ts";
import { login } from "@/features/slices/authThunk.ts";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useAppDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const loginRequestDto: LoginRequest = {
      email,
      password,
    };

    try {
      await dispatch(login(loginRequestDto));
    } catch (error) {
      toast.error(getErrorMessage(error, "Đăng nhập thất bại"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log("[PingMe] Forgot password clicked");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Trái - Ảnh */}
        <div className="relative hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500">
          <div className="absolute inset-0 bg-black/10" />

          <div className="relative z-10 text-center space-y-6">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <img src="/logo.png" alt="PingMe" className="w-16 h-16" />
              <h1 className="text-4xl font-bold text-white">PingMe</h1>
            </div>

            <img
              src="/images/login-illustration.jpg"
              alt="Login illustration"
              className="w-full max-w-md rounded-lg shadow-xl"
            />

            <div className="space-y-3 mt-8">
              <h2 className="text-3xl font-bold text-white">
                Chào mừng trở lại!
              </h2>
              <p className="text-purple-100 text-lg">
                Kết nối với bạn bè và chia sẻ những khoảnh khắc đáng nhớ
              </p>
            </div>

            <div className="flex items-center justify-center space-x-8 mt-8 text-white/90">
              <div className="text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Tin nhắn nhanh</p>
              </div>
              <div className="text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Chia sẻ blog</p>
              </div>
              <div className="text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Nhật ký cá nhân</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phải - Login form */}
        <div className="flex flex-col justify-center p-8 lg:p-12">
          <div className="w-full max-w-md mx-auto space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-6">
              <img src="/logo.png" alt="PingMe" className="w-12 h-12" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                PingMe
              </h1>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">Đăng nhập</h2>
              <p className="text-gray-600">
                Nhập thông tin để truy cập tài khoản của bạn
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Chưa có tài khoản?{" "}
                <Link
                  to="/auth?mode=register"
                  className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
