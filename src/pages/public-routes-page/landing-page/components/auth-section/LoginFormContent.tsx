import { useState } from "react";
import { m } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/features/hooks";
import { login } from "@/features/auth/authThunk";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import type { DefaultLoginRequest } from "@/types/authentication";
import Field from "@/pages/public-routes-page/shared/auth-ui/Field";
import FieldLabel from "@/pages/public-routes-page/shared/auth-ui/FieldLabel";
import StyledInputWrap from "@/pages/public-routes-page/shared/auth-ui/StyledInputWrap";
import PrimaryButton from "@/pages/public-routes-page/shared/auth-ui/PrimaryButton";
import PasswordToggleButton from "@/pages/public-routes-page/shared/auth-ui/PasswordToggleButton";
import TurnstileField from "@/pages/public-routes-page/shared/auth-ui/TurnstileField";
import { INPUT_CLASS } from "@/pages/public-routes-page/shared/auth-ui/authConstants";

interface LoginFormContentProps {
  t: (key: string) => string;
}

export default function LoginFormContent({ t }: Readonly<LoginFormContentProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) return;
    setIsLoading(true);
    const payload: DefaultLoginRequest = { email, password, turnstileToken };
    try {
      const resultAction = await dispatch(login(payload));
      if (login.rejected.match(resultAction)) {
        if (resultAction.payload === "REQUIRE_ACTIVATION") {
          toast.warning("Tài khoản chưa được kích hoạt. Bạn cần nhập OTP để làm điều này.");
          navigate("/auth/verify-otp", {
            state: { email, type: "ACCOUNT_ACTIVATION", fromPublic: true },
          });
        }
        setTurnstileToken("");
        setTurnstileKey((prev) => prev + 1);
      }
    } catch (error) {
      // Fallback cho runtime error
      toast.error(getErrorMessage(error, t("auth.login.fail")));
      setTurnstileToken("");
      setTurnstileKey((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-[oklch(0.12_0.03_292)] mb-2">
          {t("auth.login.title")}
        </h2>
        <p className="text-[15px] text-black/60">{t("auth.login.subtitle")}</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email */}
        <Field delay={0.05}>
          <FieldLabel htmlFor="email">{t("auth.fields.email")}</FieldLabel>
          <StyledInputWrap>
            <m.span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none">
              <Mail className="h-[18px] w-[18px]" />
            </m.span>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
              required
            />
          </StyledInputWrap>
        </Field>

        {/* Password */}
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
            <m.span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none">
              <Lock className="h-[18px] w-[18px]" />
            </m.span>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.fields.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(INPUT_CLASS, "pr-12")}
              required
            />
            <PasswordToggleButton
              isVisible={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
            />
          </StyledInputWrap>
        </Field>

        {/* Turnstile */}
        <Field delay={0.15}>
          <TurnstileField
            key={turnstileKey}
            onSuccess={(token) => setTurnstileToken(token)}
            onError={() => setTurnstileToken("")}
            onExpire={() => setTurnstileToken("")}
          />
        </Field>

        {/* Submit */}
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
            <Link
              to="/register"
              className="text-[oklch(0.12_0.03_292)] font-semibold hover:text-purple-300 transition-colors ml-1"
            >
              {t("auth.login.registerNow")}
            </Link>
          </p>
        </div>
      </Field>
    </div>
  );
}
