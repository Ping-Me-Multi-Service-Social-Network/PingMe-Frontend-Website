import { useState, useRef, useCallback } from "react";
import { m } from "framer-motion";
import { Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import PasswordStrengthMeter from "@/pages/commons/PasswordStrengthMeter";
import type { RegisterRequest } from "@/types/authentication";
import { checkEmailExistsApi } from "@/services/authentication";
import Field from "@/pages/public-routes-page/shared/auth-ui/Field";
import FieldLabel from "@/pages/public-routes-page/shared/auth-ui/FieldLabel";
import StyledInputWrap from "@/pages/public-routes-page/shared/auth-ui/StyledInputWrap";
import PasswordToggleButton from "@/pages/public-routes-page/shared/auth-ui/PasswordToggleButton";
import { INPUT_CLASS } from "@/pages/public-routes-page/shared/auth-ui/authConstants";

interface Props {
  t: (key: string) => string;
  formData: RegisterRequest;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}

interface Errors {
  name?: string;
  email?: string;
  password?: string;
}

type EmailStatus = "idle" | "checking" | "available" | "taken" | "invalid";
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,63}(?:\.[^\s@]{1,63})*\.[^\s@]{2,24}$/;
const DEBOUNCE_MS = 600;

function EmailStatusIcon({ email, status }: Readonly<{ email: string; status: EmailStatus }>) {
  if (!email || status === "idle") return null;
  if (status === "checking") return (
    <span className="absolute right-4 top-1/2 -translate-y-1/2">
      <Loader2 className="h-4 w-4 animate-spin" style={{ color: "oklch(0.55 0.2 292)" }} />
    </span>
  );
  if (status === "available") return (
    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
  if (status === "taken") return (
    <span className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.55 0.2 25)" }}>
      <AlertCircle className="h-4 w-4" />
    </span>
  );
  return null;
}

function validateStep1(
  name: string,
  email: string,
  password: string,
  emailStatus: EmailStatus,
  t: (key: string) => string,
): Errors {
  const e: Errors = {};
  if (!name.trim()) e.name = t("auth.register.validation.nameRequired");
  else if (name.trim().length < 2) e.name = t("auth.register.validation.nameMinLength");

  if (!email.trim()) e.email = t("auth.register.validation.emailRequired");
  else if (!EMAIL_RE.test(email)) e.email = t("auth.register.validation.emailInvalid");
  else if (emailStatus === "taken") e.email = t("auth.register.validation.emailTaken");

  if (!password) e.password = t("auth.register.validation.passwordRequired");
  else if (password.length < 6) e.password = t("auth.register.validation.passwordMinLength");

  return e;
}

export default function Step1BasicInfo({ t, formData, onChange, onNext }: Readonly<Props>) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkEmail = useCallback((email: string) => {
    if (!EMAIL_RE.test(email)) {
      setEmailStatus("invalid");
      return;
    }
    setEmailStatus("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await checkEmailExistsApi(email);
        setEmailStatus(res.data.data.exists ? "taken" : "available");
      } catch {
        // If API fails, don't block — let backend catch it on submit
        setEmailStatus("idle");
      }
    }, DEBOUNCE_MS);
  }, []);

  const handleEmailChange = (value: string) => {
    onChange("email", value);
    if (value.trim()) checkEmail(value.trim());
    else setEmailStatus("idle");
    if (touched.email) {
      const e = validateStep1(formData.name, value.trim(), formData.password, emailStatus, t);
      setErrors((prev) => ({ ...prev, email: e.email }));
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = { name: true, email: true, password: true };
    setTouched(allTouched);
    if (emailStatus === "checking") return; // wait for check
    const errs = validateStep1(formData.name, formData.email, formData.password, emailStatus, t);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onNext();
  };

  const blur = (field: string) => {
    setTouched((p) => ({ ...p, [field]: true }));
    const errs = validateStep1(formData.name, formData.email, formData.password, emailStatus, t);
    setErrors((prev) => ({ ...prev, [field]: errs[field as keyof Errors] }));
  };

  const changeField = (field: string, value: string) => {
    onChange(field, value);
    if (touched[field]) {
      setTimeout(() => {
        const errs = validateStep1(formData.name, formData.email, formData.password, emailStatus, t);
        setErrors((prev) => ({ ...prev, [field]: errs[field as keyof Errors] }));
      }, 0);
    }
  };


  const emailError = touched.email && (
    errors.email ??
    (emailStatus === "taken" ? t("auth.register.validation.emailTaken") : undefined)
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-1" style={{ color: "oklch(0.12 0.03 292)" }}>
          {t("auth.register.step1.title")}
        </h2>
        <p className="text-sm" style={{ color: "oklch(0.52 0.04 292)" }}>
          {t("auth.register.step1.subtitle")}
        </p>
      </div>

      <form onSubmit={handleNext} noValidate className="space-y-4">
        {/* Name */}
        <Field delay={0.04}>
          <FieldLabel htmlFor="r-name">
            {t("auth.fields.name")} <span className="text-purple-400">*</span>
          </FieldLabel>
          <StyledInputWrap>
            <m.span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: errors.name && touched.name ? "oklch(0.55 0.2 25)" : "oklch(0.6 0 0)" }}>
              <User className="h-[17px] w-[17px]" />
            </m.span>
            <Input
              id="r-name"
              type="text"
              placeholder={t("auth.fields.namePlaceholder")}
              value={formData.name}
              onChange={(e) => changeField("name", e.target.value)}
              onBlur={() => blur("name")}
              className={cn(INPUT_CLASS, touched.name && errors.name && "border-red-300 focus-visible:ring-red-300/50")}
            />
          </StyledInputWrap>
          {touched.name && errors.name && (
            <p className="flex items-center gap-1.5 mt-1.5 text-xs" style={{ color: "oklch(0.5 0.2 25)" }}>
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {errors.name}
            </p>
          )}
        </Field>

        {/* Email */}
        <Field delay={0.07}>
          <FieldLabel htmlFor="r-email">
            {t("auth.fields.email")} <span className="text-purple-400">*</span>
          </FieldLabel>
          <StyledInputWrap>
            <m.span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: emailError ? "oklch(0.55 0.2 25)" : "oklch(0.6 0 0)" }}>
              <Mail className="h-[17px] w-[17px]" />
            </m.span>
            <Input
              id="r-email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={() => blur("email")}
              className={cn(
                INPUT_CLASS,
                "pr-10",
                touched.email && emailError && "border-red-300 focus-visible:ring-red-300/50",
                touched.email && emailStatus === "available" && !emailError && "border-green-300 focus-visible:ring-green-300/50",
              )}
            />
            <EmailStatusIcon email={formData.email} status={emailStatus} />
          </StyledInputWrap>
          {touched.email && emailError && (
            <p className="flex items-center gap-1.5 mt-1.5 text-xs" style={{ color: "oklch(0.5 0.2 25)" }}>
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {emailError}
            </p>
          )}
          {touched.email && emailStatus === "available" && !emailError && (
            <p className="flex items-center gap-1.5 mt-1.5 text-xs text-green-600">
              <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("auth.register.emailStatus.available")}
            </p>
          )}
        </Field>

        {/* Password */}
        <Field delay={0.1}>
          <FieldLabel htmlFor="r-password">
            {t("auth.fields.password")} <span className="text-purple-400">*</span>
          </FieldLabel>
          <StyledInputWrap>
            <m.span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: errors.password && touched.password ? "oklch(0.55 0.2 25)" : "oklch(0.6 0 0)" }}>
              <Lock className="h-[17px] w-[17px]" />
            </m.span>
            <Input
              id="r-password"
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.fields.pwdMinLength")}
              value={formData.password}
              onChange={(e) => changeField("password", e.target.value)}
              onBlur={() => blur("password")}
              className={cn(INPUT_CLASS, "pr-12", touched.password && errors.password && "border-red-300 focus-visible:ring-red-300/50")}
            />
            <PasswordToggleButton isVisible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
          </StyledInputWrap>
          <div className="mt-1.5 pl-1">
            <PasswordStrengthMeter password={formData.password} />
          </div>
          {touched.password && errors.password && (
            <p className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: "oklch(0.5 0.2 25)" }}>
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {errors.password}
            </p>
          )}
        </Field>

        {/* Next button */}
        <Field delay={0.13}>
          <button
            type="submit"
            disabled={emailStatus === "checking"}
            className="w-full h-11 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all mt-1"
            style={{
              background: emailStatus === "checking" ? "oklch(0.8 0.05 292)" : "oklch(0.55 0.2 292)",
              color: "white",
              cursor: emailStatus === "checking" ? "not-allowed" : "pointer",
              boxShadow: emailStatus === "checking" ? "none" : "0 4px 12px oklch(0.55 0.2 292 / 0.3)",
            }}
          >
            {emailStatus === "checking" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("auth.register.nav.checking")}
              </>
            ) : (
              <>
                {t("auth.register.nav.next")}
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </Field>
      </form>
    </div>
  );
}
