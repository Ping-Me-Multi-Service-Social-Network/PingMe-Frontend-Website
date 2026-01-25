import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  MapPin,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import type { LoginRequest, RegisterRequest } from "@/types/authentication";
import { useAppDispatch } from "@/features/hooks";
import { login } from "@/features/slices/authThunk";
import { registerLocalApi } from "@/services/authentication";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import PasswordStrengthMeter from "@/pages/commons/PasswordStrengthMeter";

interface AuthSectionProps {
  mode: string;
  heroImageSrc?: string;
}

export default function AuthSection({
  mode,
  heroImageSrc = "/images/hero-chat.webp",
}: AuthSectionProps) {
  const isLogin = mode === "login";

  return (
    <section className="relative overflow-hidden h-full bg-linear-to-br from-purple-600 via-purple-700 to-pink-600">
      {/* pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 h-full">
        <div className="grid md:grid-cols-2 gap-10 items-center h-full py-3">
          {/* LEFT: Image + content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-white"
          >
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              PingMe
            </h1>

            <p className="mt-4 text-lg text-purple-100 leading-relaxed max-w-xl">
              Kết nối bạn bè, nhắn tin nhanh, chia sẻ khoảnh khắc và khám phá
              nội dung theo cách hiện đại — ưu tiên bảo mật và trải nghiệm mượt.
            </p>

            <div className="mt-8 relative">
              <div className="absolute inset-0 bg-linear-to-br from-pink-400 to-purple-400 rounded-3xl blur-3xl opacity-50" />
              <img
                src={heroImageSrc}
                alt="PingMe Preview"
                className="relative rounded-3xl shadow-2xl w-full h-auto object-cover"
              />
            </div>
          </motion.div>

          {/* RIGHT: Auth form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex justify-center md:justify-end"
          >
            <div className="w-full max-w-lg">
              <div className="bg-white rounded-2xl shadow-2xl border border-white/20 p-8">
                {isLogin ? <LoginFormContent /> : <RegisterFormContent />}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LoginFormContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const loginRequestDto: LoginRequest = { email, password };

    try {
      await dispatch(login(loginRequestDto));
    } catch (error) {
      toast.error(getErrorMessage(error, "Đăng nhập thất bại"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img
            src="/icons/logo.webp"
            alt="PingMe"
            className="w-10 h-10 rounded-xl"
          />
          <h1 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            PingMe
          </h1>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
        <p className="text-gray-500 text-sm">
          Nhập thông tin để truy cập tài khoản của bạn
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Mật khẩu
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 pr-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors"
          >
            Quên mật khẩu?
          </button>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang đăng nhập...</span>
            </div>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">hoặc</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600">
          Chưa có tài khoản?{" "}
          <Link
            to="/?mode=register"
            className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

function RegisterFormContent() {
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
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/?mode=login");
    } catch (err) {
      toast.error(getErrorMessage(err, "Đăng ký thất bại"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-5"
    >
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img
            src="/icons/logo.webp"
            alt="PingMe"
            className="w-10 h-10 rounded-xl"
          />
          <h1 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            PingMe
          </h1>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Tạo tài khoản</h2>
        <p className="text-gray-500 text-sm">
          Điền thông tin để bắt đầu sử dụng PingMe
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Họ và tên <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="name"
              type="text"
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="pl-12 h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="pl-12 h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Mật khẩu <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Tối thiểu 6 ký tự"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="pl-12 pr-12 h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
          <div className="space-y-2">
            <Label
              htmlFor="gender"
              className="text-sm font-medium text-gray-700"
            >
              Giới tính <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleInputChange("gender", value)}
              required
            >
              <SelectTrigger className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg">
                <SelectValue placeholder="Chọn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Nam</SelectItem>
                <SelectItem value="FEMALE">Nữ</SelectItem>
                <SelectItem value="OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Ngày sinh
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-11 justify-start text-left font-normal border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg bg-transparent",
                    !dob && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dob
                    ? format(dob, "dd/MM/yyyy", { locale: vi })
                    : "Chọn ngày"}
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

        <div className="space-y-2">
          <Label
            htmlFor="address"
            className="text-sm font-medium text-gray-700"
          >
            Địa chỉ
          </Label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="address"
              type="text"
              placeholder="Thành phố, Quốc gia"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="pl-12 h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang tạo tài khoản...</span>
            </div>
          ) : (
            "Tạo tài khoản"
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/?mode=login"
            className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
