import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LazyMotion, domAnimation, m } from "framer-motion";
import LanguageSwitcher from "@/pages/commons/LanguageSwitcher";
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
import { vi, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import type { LoginRequest, RegisterRequest } from "@/types/authentication";
import { useAppDispatch } from "@/features/hooks";
import { login } from "@/features/auth/authThunk";
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
}: Readonly<AuthSectionProps>) {
  const { t } = useTranslation("landing");
  const isLogin = mode === "login";

  return (
    <LazyMotion features={domAnimation}>
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

        <div className="absolute top-6 right-6 z-50">
          <LanguageSwitcher />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 h-full">
          <div className="grid md:grid-cols-2 gap-10 items-center h-full py-3">
            {/* LEFT: Image + content */}
            <m.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-white"
            >
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                PingMe
              </h1>

              <p className="mt-4 text-lg text-purple-100 leading-relaxed max-w-xl">
                {t("auth.slogan")}
              </p>

              <div className="mt-8 relative">
                <div className="absolute inset-0 bg-linear-to-br from-pink-400 to-purple-400 rounded-3xl blur-3xl opacity-50" />
                <img
                  src={heroImageSrc}
                  alt="PingMe Preview"
                  className="relative rounded-3xl shadow-2xl w-full h-auto object-cover"
                />
              </div>
            </m.div>

            {/* RIGHT: Auth form */}
            <m.div
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
            </m.div>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}

function LoginFormContent() {
  const { t } = useTranslation("landing");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const loginRequestDto: LoginRequest = { email, password };

    try {
      await dispatch(login(loginRequestDto));
    } catch (error) {
      toast.error(getErrorMessage(error, t("auth.login.fail")));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log("[PingMe] Forgot password clicked");
    navigate("/forgot-password");
  };

  return (
    <m.div
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
        <h2 className="text-2xl font-bold text-gray-900">{t("auth.login.title")}</h2>
        <p className="text-gray-500 text-sm">
          {t("auth.login.subtitle")}
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            {t("auth.fields.email")}
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
            {t("auth.fields.password")}
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.fields.passwordPlaceholder")}
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
            onClick={handleForgotPassword}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors"
          >
            {t("auth.login.forgotPassword")}
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
              <span>{t("auth.login.loading")}</span>
            </div>
          ) : (
            t("auth.login.btn")
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">{t("auth.or")}</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600">
          {t("auth.login.noAccount")}{" "}
          <Link
            to="/?mode=register"
            className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
          >
            {t("auth.login.registerNow")}
          </Link>
        </p>
      </div>
    </m.div>
  );
}

function RegisterFormContent() {
  const { t, i18n } = useTranslation("landing");
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
      toast.success(t("auth.register.success"));
      navigate("/?mode=login");
    } catch (err) {
      toast.error(getErrorMessage(err, t("auth.register.fail")));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <m.div
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
        <h2 className="text-2xl font-bold text-gray-900">{t("auth.register.title")}</h2>
        <p className="text-gray-500 text-sm">
          {t("auth.register.subtitle")}
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            {t("auth.fields.name")} <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="name"
              type="text"
              placeholder={t("auth.fields.namePlaceholder")}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="pl-12 h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            {t("auth.fields.email")} <span className="text-red-500">*</span>
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
            {t("auth.fields.password")} <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.fields.pwdMinLength")}
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
              {t("auth.fields.gender")} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleInputChange("gender", value)}
              required
            >
              <SelectTrigger className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg">
                <SelectValue placeholder={t("auth.fields.genderPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">{t("auth.fields.genderMale")}</SelectItem>
                <SelectItem value="FEMALE">{t("auth.fields.genderFemale")}</SelectItem>
                <SelectItem value="OTHER">{t("auth.fields.genderOther")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {t("auth.fields.dob")}
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
                    ? format(dob, "dd/MM/yyyy", { locale: i18n.language === 'vi' ? vi : enUS })
                    : t("auth.fields.dobPlaceholder")}
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
                  locale={i18n.language === 'vi' ? vi : enUS}
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
            {t("auth.fields.address")}
          </Label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="address"
              type="text"
              placeholder={t("auth.fields.addressPlaceholder")}
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
              <span>{t("auth.register.loading")}</span>
            </div>
          ) : (
            t("auth.register.btn")
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-gray-600">
          {t("auth.register.hasAccount")}{" "}
          <Link
            to="/?mode=login"
            className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
          >
            {t("auth.register.loginNow")}
          </Link>
        </p>
      </div>
    </m.div>
  );
}
