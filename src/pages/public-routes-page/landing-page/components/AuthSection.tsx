import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "@/pages/commons/LanguageSwitcher";
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
  ArrowRight,
  MessageSquare,
  Music,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import type {
  DefaultLoginRequest,
  RegisterRequest,
} from "@/types/authentication";
import { useAppDispatch } from "@/features/hooks";
import { login } from "@/features/auth/authThunk";
import { registerLocalApi } from "@/services/authentication";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import PasswordStrengthMeter from "@/pages/commons/PasswordStrengthMeter";
import { Turnstile } from "@marsidev/react-turnstile";

// ─── Design tokens ────────────────────────────────────────────────────────────
// Harmonized based on "frontend-design" & "arrange" principles
const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

interface AuthSectionProps {
  mode: string;
  heroImageSrc?: string;
}

// ─── Feature pill for hero panel ─────────────────────────────────────────────
function FeaturePill({ 
  icon: Icon, 
  label,
  isActive = false,
  onClick
}: { 
  icon: React.ElementType; 
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <m.div
      onClick={onClick}
      className="cursor-pointer flex items-center gap-2.5 px-4 py-3 rounded-2xl text-[12px] font-bold uppercase tracking-wider transition-all shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
      style={{
        background: isActive ? "oklch(0.55 0.2 292)" : "rgba(255, 255, 255, 0.95)",
        color: isActive ? "white" : "oklch(0.2 0.05 292)",
        border: isActive ? "1px solid transparent" : "1px solid rgba(255,255,255,0.6)",
        backdropFilter: "blur(16px)",
      }}
      whileHover={{ scale: 1.05, background: isActive ? "oklch(0.55 0.2 292)" : "#fff", y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300", isActive ? "bg-white/20 text-white" : "bg-purple-50 text-purple-600")}>
        <Icon className="w-4 h-4" />
      </div>
      {label}
    </m.div>
  );
}

// ─── Animated form field ──────────────────────────────────────────────────────
function Field({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: EASE_OUT_QUART }}
    >
      {children}
    </m.div>
  );
}

// ─── Styled input wrapper ─────────────────────────────────────────────────────
function StyledInputWrap({ children }: { children: React.ReactNode }) {
  return <div className="relative mt-2">{children}</div>;
}

export default function AuthSection({
  mode,
  heroImageSrc = "/images/hero-chat.webp",
}: AuthSectionProps) {
  const [activeFeature, setActiveFeature] = useState(0);
  const imagesForFeatures = [
    heroImageSrc,
    "/images/feature-music.webp",
    "/images/feature-reels.webp"
  ];
  const currentImage = imagesForFeatures[activeFeature];
  
  const { t } = useTranslation("landing");
  const isLogin = mode === "login";

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative min-h-[100dvh] flex flex-col md:flex-row items-stretch overflow-hidden">
        {/* Soft magical background gradients */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-10%", left: "50%", transform: "translateX(-50%)",
            width: 800, height: 800,
            background: `radial-gradient(ellipse at center, oklch(0.55 0.2 292 / 0.15) 0%, transparent 65%)`,
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-10%", left: "-10%",
            width: 700, height: 700,
            background: `radial-gradient(circle, oklch(0.55 0.2 340 / 0.15) 0%, transparent 65%)`,
            filter: "blur(80px)",
          }}
        />

        {/* Global Nav & Controls */}
        <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
          <LanguageSwitcher className="!bg-white/80 !border-zinc-200 !text-zinc-800 hover:!bg-white !shadow-sm backdrop-blur-md" />
        </div>
        <div className="absolute top-6 left-8 z-50 flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 rounded-xl blur-md opacity-40"></div>
            <img src="/icons/logo.webp" alt="PingMe" className="w-10 h-10 rounded-xl relative z-10 border border-black/5" />
          </div>
          <span className="text-2xl font-black tracking-tight text-[oklch(0.12_0.03_292)]">PingMe</span>
        </div>

        {/* ── LEFT HERO PANEL ── */}
        <m.div
          className="hidden md:flex md:w-[50%] lg:w-[55%] relative flex-col justify-center items-center p-8 lg:p-12 xl:p-16 z-10 flex-shrink-0"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT_QUART }}
        >
          <div className="relative w-full max-w-[680px]">
            {/* Decorative background glow behind image */}
            <div className="absolute inset-0 bg-purple-400/20 blur-[60px] translate-y-10 rounded-full"></div>
            
            {/* Main Image Frame (Ambient Glassmorphism layout) */}
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: EASE_OUT_QUART }}
              className="relative aspect-square lg:aspect-[16/10] w-full rounded-[24px] overflow-hidden border-[8px] bg-zinc-50 border-white/60 shadow-[0_32px_80px_rgba(147,51,234,0.15)] ring-1 ring-black/5"
            >
              {/* Actual image - fills frame fully, corners clipped by frame */}
              <img
                key={currentImage}
                src={currentImage}
                alt="PingMe app feature"
                className="absolute inset-0 w-full h-full object-cover object-center z-10 transition-transform duration-[3s] animate-in fade-in zoom-in-95 duration-700"
              />
              {/* Soft interior shadow overlay */}
              <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.08)] pointer-events-none z-20" />
            </m.div>

            <div className="absolute -left-6 sm:-left-12 top-12 flex flex-col gap-3 z-30 pointer-events-auto">
              <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <FeaturePill icon={MessageSquare} label="Instant Chat" isActive={activeFeature === 0} onClick={() => setActiveFeature(0)} />
              </m.div>
              <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <FeaturePill icon={Music} label="Music" isActive={activeFeature === 1} onClick={() => setActiveFeature(1)} />
              </m.div>
              <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                <FeaturePill icon={Users} label="Social" isActive={activeFeature === 2} onClick={() => setActiveFeature(2)} />
              </m.div>
            </div>

            {/* Social Proof - Floating Glass Card overlapping bottom right */}
            <m.div
              className="absolute -right-2 sm:-right-8 -bottom-4 sm:-bottom-8 bg-white/90 backdrop-blur-2xl px-6 py-5 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white flex flex-col sm:flex-row items-start sm:items-center gap-4 z-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6, ease: EASE_OUT_QUART }}
            >
              <div className="flex -space-x-3 shrink-0">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-[3px] shadow-sm"
                    style={{
                      background: `oklch(${0.6 + i * 0.05} 0.15 ${292 + i * 15})`,
                      borderColor: "white",
                    }}
                  />
                ))}
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight" style={{ color: "oklch(0.12 0.03 292)" }}>
                  2M+
                </p>
              </div>
            </m.div>
          </div>
        </m.div>

        {/* ── RIGHT FORM PANEL ── */}
        <div
          className="flex-1 flex flex-col justify-center p-6 md:p-12 z-20 relative overflow-y-auto"
          style={{ background: "oklch(0.96 0.018 292)" }}
        >
          <m.div
            className="w-full max-w-[440px] mx-auto rounded-[32px] border p-8 sm:p-12"
            style={{
              background: "oklch(0.985 0.012 292)",
              borderColor: "oklch(0.9 0.025 292)",
              boxShadow: "0 24px 64px -12px oklch(0.55 0.2 292 / 0.12), 0 4px 16px rgba(0,0,0,0.04)",
            }}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT_QUART }}
          >
            <AnimatePresence mode="wait">
              <m.div
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
              >
                {isLogin ? <LoginFormContent t={t} /> : <RegisterFormContent t={t} />}
              </m.div>
            </AnimatePresence>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}

// ─── Shared label style ───────────────────────────────────────────────────────
function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-xs font-semibold uppercase tracking-wider text-black/60 ml-1"
    >
      {children}
    </Label>
  );
}

// ─── Primary button ───────────────────────────────────────────────────────────
function PrimaryButton({
  type = "button",
  disabled,
  loading,
  loadingText,
  children,
  onClick,
}: {
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <m.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full h-12 rounded-[16px] font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-lg",
        disabled ? "bg-black/5 text-black/40 cursor-not-allowed shadow-none" : "bg-purple-600 text-white hover:bg-purple-500 hover:shadow-purple-500/25"
      )}
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <m.span
            key="loading"
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <m.span
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
              style={{ display: "block" }}
            />
            {loadingText}
          </m.span>
        ) : (
          <m.span
            key="label"
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
            <ArrowRight className="w-4 h-4 opacity-70" />
          </m.span>
        )}
      </AnimatePresence>
    </m.button>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginFormContent({ t }: { t: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) return;
    setIsLoading(true);
    const payload: DefaultLoginRequest = { email, password, turnstileToken };
    try {
      await dispatch(login(payload));
    } catch (error) {
      toast.error(getErrorMessage(error, t("auth.login.fail")));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "pl-11 pr-4 h-12 rounded-[16px] text-[15px] bg-zinc-50/80 border border-zinc-200 text-black placeholder:text-black/40 focus-visible:ring-1 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 transition-all hover:bg-zinc-100/80";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-[oklch(0.12_0.03_292)] mb-2">
          {t("auth.login.title")}
        </h2>
        <p className="text-[15px] text-black/60">
          {t("auth.login.subtitle")}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        <Field delay={0.05}>
          <FieldLabel htmlFor="email">{t("auth.fields.email")}</FieldLabel>
          <StyledInputWrap>
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-black/40" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </StyledInputWrap>
        </Field>

        <Field delay={0.1}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">{t("auth.fields.password")}</FieldLabel>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
            >
              {t("auth.login.forgotPassword")}
            </button>
          </div>
          <StyledInputWrap>
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-black/40" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.fields.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(inputClass, "pr-12")}
              required
            />
            <m.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70 transition-colors"
              whileTap={{ scale: 0.85 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.span
                  key={String(showPassword)}
                  initial={{ opacity: 0, rotate: -45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </m.span>
              </AnimatePresence>
            </m.button>
          </StyledInputWrap>
        </Field>

        <Field delay={0.15}>
          <div className="flex justify-center rounded-[16px] overflow-hidden shadow-inner ring-1 ring-black/5 bg-black/5 p-1">
            <Turnstile
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token)}
              onError={() => setTurnstileToken("")}
              onExpire={() => setTurnstileToken("")}
              options={{ theme: "light" }}
            />
          </div>
        </Field>

        <Field delay={0.2}>
          <PrimaryButton
            type="submit"
            disabled={isLoading || !turnstileToken}
            loading={isLoading}
            loadingText={t("auth.login.loading")}
          >
            {t("auth.login.btn")}
          </PrimaryButton>
        </Field>
      </form>

      {/* Footer link */}
      <Field delay={0.25}>
        <div className="text-center pt-2">
          <p className="text-[15px] text-black/60">
            {t("auth.login.noAccount")}{" "}
            <Link to="/?mode=register" className="text-[oklch(0.12_0.03_292)] font-semibold hover:text-purple-300 transition-colors ml-1">
              {t("auth.login.registerNow")}
            </Link>
          </p>
        </div>
      </Field>
    </div>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────
function RegisterFormContent({ t }: { t: any }) {
  const { i18n } = useTranslation("landing");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterRequest>({
    email: "",
    password: "",
    name: "",
    gender: "OTHER",
    address: "",
    turnstileToken: "",
  });
  const [dob, setDob] = useState<Date>();
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) return;
    try {
      setIsLoading(true);
      await registerLocalApi({ ...formData, turnstileToken, dob: dob?.toLocaleDateString("en-CA") });
      toast.success(t("auth.register.success"));
      navigate("/?mode=login");
    } catch (err) {
      toast.error(getErrorMessage(err, t("auth.register.fail")));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "pl-11 pr-4 h-12 rounded-[16px] text-[15px] bg-zinc-50/80 border border-zinc-200 text-black placeholder:text-black/40 focus-visible:ring-1 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 transition-all hover:bg-zinc-100/80 w-full";
  const selectTriggerClass = "h-12 rounded-[16px] text-[15px] bg-black/20 border border-white/5 text-[oklch(0.12_0.03_292)] focus-visible:ring-1 focus-visible:ring-purple-500/50 transition-all hover:bg-zinc-100/80 w-full";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-[oklch(0.12_0.03_292)] mb-2">
          {t("auth.register.title")}
        </h2>
        <p className="text-[15px] text-black/60">
          {t("auth.register.subtitle")}
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <Field delay={0.05}>
          <FieldLabel htmlFor="r-name">{t("auth.fields.name")} <span className="text-purple-400">*</span></FieldLabel>
          <StyledInputWrap>
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-black/40" />
            <Input id="r-name" type="text" placeholder={t("auth.fields.namePlaceholder")} value={formData.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass} required />
          </StyledInputWrap>
        </Field>

        <Field delay={0.08}>
          <FieldLabel htmlFor="r-email">{t("auth.fields.email")} <span className="text-purple-400">*</span></FieldLabel>
          <StyledInputWrap>
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-black/40" />
            <Input id="r-email" type="email" placeholder="you@example.com" value={formData.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass} required />
          </StyledInputWrap>
        </Field>

        <Field delay={0.11}>
          <FieldLabel htmlFor="r-password">{t("auth.fields.password")} <span className="text-purple-400">*</span></FieldLabel>
          <StyledInputWrap>
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-black/40" />
            <Input id="r-password" type={showPassword ? "text" : "password"} placeholder={t("auth.fields.pwdMinLength")}
              value={formData.password} onChange={(e) => set("password", e.target.value)}
              className={cn(inputClass, "pr-12")} required />
            <m.button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70 transition-colors"
              whileTap={{ scale: 0.85 }}>
              <AnimatePresence mode="wait" initial={false}>
                <m.span key={String(showPassword)} initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 45 }} transition={{ duration: 0.15 }} className="block">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </m.span>
              </AnimatePresence>
            </m.button>
          </StyledInputWrap>
          <div className="mt-2 pl-1">
            <PasswordStrengthMeter password={formData.password} />
          </div>
        </Field>

        <Field delay={0.14}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel htmlFor="r-gender">{t("auth.fields.gender")} <span className="text-purple-400">*</span></FieldLabel>
              <div className="mt-2">
                <Select value={formData.gender} onValueChange={(v) => set("gender", v)} required>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder={t("auth.fields.genderPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-black/5 text-[oklch(0.12_0.03_292)]">
                    <SelectItem className="focus:bg-black/5" value="MALE">{t("auth.fields.genderMale")}</SelectItem>
                    <SelectItem className="focus:bg-black/5" value="FEMALE">{t("auth.fields.genderFemale")}</SelectItem>
                    <SelectItem className="focus:bg-black/5" value="OTHER">{t("auth.fields.genderOther")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <FieldLabel>{t("auth.fields.dob")}</FieldLabel>
              <div className="mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-full flex items-center gap-2 px-3 justify-start font-normal focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-500/50",
                        selectTriggerClass,
                        !dob && "text-black/40"
                      )}
                    >
                      <CalendarIcon className="h-[18px] w-[18px] shrink-0 text-black/40" />
                      <span className="truncate text-left flex-1 border-none focus:outline-none">
                        {dob ? format(dob, "dd/MM/yyyy", { locale: i18n.language === "vi" ? vi : enUS }) : t("auth.fields.dobPlaceholder")}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-black/5 text-[oklch(0.12_0.03_292)]" align="start">
                    <Calendar mode="single" selected={dob} onSelect={setDob}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      locale={i18n.language === "vi" ? vi : enUS} captionLayout="dropdown" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </Field>

        <Field delay={0.17}>
          <FieldLabel htmlFor="r-address">{t("auth.fields.address")}</FieldLabel>
          <StyledInputWrap>
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-black/40" />
            <Input id="r-address" type="text" placeholder={t("auth.fields.addressPlaceholder")} value={formData.address}
              onChange={(e) => set("address", e.target.value)}
              className={inputClass} />
          </StyledInputWrap>
        </Field>

        <Field delay={0.2}>
          <div className="flex justify-center rounded-[16px] overflow-hidden shadow-inner ring-1 ring-black/5 bg-black/5 p-1">
            <Turnstile siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token)} onError={() => setTurnstileToken("")}
              onExpire={() => setTurnstileToken("")} options={{ theme: "light" }} />
          </div>
        </Field>

        <Field delay={0.23}>
          <PrimaryButton type="submit" disabled={isLoading || !turnstileToken}
            loading={isLoading} loadingText={t("auth.register.loading")}>
            {t("auth.register.btn")}
          </PrimaryButton>
        </Field>
      </form>

      <Field delay={0.27}>
        <div className="text-center pt-2">
          <p className="text-[15px] text-black/60">
            {t("auth.register.hasAccount")}{" "}
            <Link to="/?mode=login" className="text-[oklch(0.12_0.03_292)] font-semibold hover:text-purple-300 transition-colors ml-1">
              {t("auth.register.loginNow")}
            </Link>
          </p>
        </div>
      </Field>
    </div>
  );
}
