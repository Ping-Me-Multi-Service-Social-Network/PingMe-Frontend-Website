import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Turnstile } from "@marsidev/react-turnstile";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/features/hooks";
import { login } from "@/features/auth/authThunk";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import type { DefaultLoginRequest } from "@/types/authentication";
import Field from "./ui/Field";
import FieldLabel from "./ui/FieldLabel";
import StyledInputWrap from "./ui/StyledInputWrap";
import PrimaryButton from "./ui/PrimaryButton";

interface LoginFormContentProps {
  t: (key: string) => string;
}

const INPUT_CLASS =
  "pl-11 pr-4 h-12 rounded-[16px] text-[15px] bg-zinc-50/80 border border-zinc-200 text-black placeholder:text-black/40 focus-visible:ring-1 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 transition-all hover:bg-zinc-100/80";

export default function LoginFormContent({ t }: Readonly<LoginFormContentProps>) {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-[oklch(0.12_0.03_292)] mb-2">
          {t("auth.login.title")}
        </h2>
        <p className="text-[15px] text-black/60">{t("auth.login.subtitle")}</p>
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
              className={INPUT_CLASS}
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
              className={cn(INPUT_CLASS, "pr-12")}
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
            <Link
              to="/?mode=register"
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
