import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  MapPin,
  CalendarIcon,
  UserPlus,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils.ts";
import { Link, useNavigate } from "react-router-dom";
import type { RegisterRequest } from "@/types/authentication";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import { registerLocalApi } from "@/services/authentication";
import { toast } from "sonner";
import PasswordStrengthMeter from "@/pages/commons/PasswordStrengthMeter";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterRequest>({
    email: "",
    password: "",
    name: "",
    gender: "OTHER",
    address: "",
  });
  const [dob, setDob] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const payload: RegisterRequest = {
        ...formData,
        dob: dob?.toLocaleDateString("en-CA"),
      };

      await registerLocalApi(payload);

      toast.success("Đăng ký thành công");
      navigate("/auth?mode=login");
    } catch (e) {
      toast.error(getErrorMessage(e, "Đăng ký thất bại"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Trái - Ảnh */}
        <div className="relative hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-pink-500 via-purple-500 to-purple-600">
          <div className="absolute inset-0 bg-black/10" />

          <div className="relative z-10 text-center space-y-6">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <img src="/logo.png" alt="PingMe" className="w-16 h-16" />
              <h1 className="text-4xl font-bold text-white">PingMe</h1>
            </div>

            <img
              src="/images/register-illustration.jpg"
              alt="Register illustration"
              className="w-full max-w-md rounded-lg shadow-xl"
            />

            <div className="space-y-3 mt-8">
              <h2 className="text-3xl font-bold text-white">
                Tham gia cộng đồng!
              </h2>
              <p className="text-purple-100 text-lg">
                Bắt đầu hành trình kết nối và chia sẻ của bạn ngay hôm nay
              </p>
            </div>

            <div className="flex items-center justify-center space-x-8 mt-8 text-white/90">
              <div className="text-center">
                <UserPlus className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Miễn phí</p>
              </div>
              <div className="text-center">
                <UserPlus className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Dễ dàng</p>
              </div>
              <div className="text-center">
                <UserPlus className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">An toàn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phải - Register Form */}
        <div className="flex flex-col justify-center p-8 lg:p-12 max-h-screen overflow-y-auto">
          <div className="w-full max-w-md mx-auto space-y-6">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-6">
              <img src="/logo.png" alt="PingMe" className="w-12 h-12" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                PingMe
              </h1>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">Đăng ký</h2>
              <p className="text-gray-600">
                Điền thông tin để tạo tài khoản PingMe
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Name Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-11 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
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
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
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
                <PasswordStrengthMeter password={formData.password} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Gender Select */}
                <div className="space-y-2">
                  <Label
                    htmlFor="gender"
                    className="text-sm font-medium text-gray-700"
                  >
                    Giới tính <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                    required
                  >
                    <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg">
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Ngày sinh
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg",
                          !dob && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dob
                          ? format(dob, "dd/MM/yyyy", { locale: vi })
                          : "Chọn"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dob}
                        onSelect={setDob}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        locale={vi}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Address Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="text-sm font-medium text-gray-700"
                >
                  Địa chỉ
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="Nhập địa chỉ của bạn"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="pl-11 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                  />
                </div>
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang tạo tài khoản...</span>
                  </div>
                ) : (
                  "Tạo tài khoản"
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                  to="/auth?mode=login"
                  className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
