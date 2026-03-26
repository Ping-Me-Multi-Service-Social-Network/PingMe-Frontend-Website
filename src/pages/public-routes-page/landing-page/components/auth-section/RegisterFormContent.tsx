import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, MapPin, CalendarIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { Turnstile } from "@marsidev/react-turnstile";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import { registerLocalApi } from "@/services/authentication";
import PasswordStrengthMeter from "@/pages/commons/PasswordStrengthMeter";
import type { RegisterRequest } from "@/types/authentication";
import Field from "./ui/Field";
import FieldLabel from "./ui/FieldLabel";
import StyledInputWrap from "./ui/StyledInputWrap";
import PrimaryButton from "./ui/PrimaryButton";

interface RegisterFormContentProps {
  t: (key: string) => string;
}

const INPUT_CLASS =
  "pl-11 pr-4 h-12 rounded-[16px] text-[15px] bg-zinc-50/80 border border-zinc-200 text-black placeholder:text-black/40 focus-visible:ring-1 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 transition-all hover:bg-zinc-100/80 w-full";

const SELECT_TRIGGER_CLASS =
  "h-12 rounded-[16px] text-[15px] bg-black/20 border border-white/5 text-[oklch(0.12_0.03_292)] focus-visible:ring-1 focus-visible:ring-purple-500/50 transition-all hover:bg-zinc-100/80 w-full";

export default function RegisterFormContent({ t }: Readonly<RegisterFormContentProps>) {
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

  const dateLocale = i18n.language === "vi" ? vi : enUS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-[oklch(0.12_0.03_292)] mb-2">
          {t("auth.register.title")}
        </h2>
        <p className="text-[15px] text-black/60">{t("auth.register.subtitle")}</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Name */}
        <Field delay={0.05}>
          <FieldLabel htmlFor="r-name">
            {t("auth.fields.name")} <span className="text-purple-400">*</span>
          </FieldLabel>
          <StyledInputWrap>
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-black/40" />
            <Input
              id="r-name"
              type="text"
              placeholder={t("auth.fields.namePlaceholder")}
              value={formData.name}
              onChange={(e) => set("name", e.target.value)}
              className={INPUT_CLASS}
              required
            />
          </StyledInputWrap>
        </Field>

        {/* Email */}
        <Field delay={0.08}>
          <FieldLabel htmlFor="r-email">
            {t("auth.fields.email")} <span className="text-purple-400">*</span>
          </FieldLabel>
          <StyledInputWrap>
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-black/40" />
            <Input
              id="r-email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => set("email", e.target.value)}
              className={INPUT_CLASS}
              required
            />
          </StyledInputWrap>
        </Field>

        {/* Password */}
        <Field delay={0.11}>
          <FieldLabel htmlFor="r-password">
            {t("auth.fields.password")} <span className="text-purple-400">*</span>
          </FieldLabel>
          <StyledInputWrap>
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-black/40" />
            <Input
              id="r-password"
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.fields.pwdMinLength")}
              value={formData.password}
              onChange={(e) => set("password", e.target.value)}
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
          <div className="mt-2 pl-1">
            <PasswordStrengthMeter password={formData.password} />
          </div>
        </Field>

        {/* Gender & DOB */}
        <Field delay={0.14}>
          <div className="grid grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <FieldLabel htmlFor="r-gender">
                {t("auth.fields.gender")} <span className="text-purple-400">*</span>
              </FieldLabel>
              <div className="mt-2">
                <Select value={formData.gender} onValueChange={(v) => set("gender", v)} required>
                  <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                    <SelectValue placeholder={t("auth.fields.genderPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-black/5 text-[oklch(0.12_0.03_292)]">
                    <SelectItem className="focus:bg-black/5" value="MALE">
                      {t("auth.fields.genderMale")}
                    </SelectItem>
                    <SelectItem className="focus:bg-black/5" value="FEMALE">
                      {t("auth.fields.genderFemale")}
                    </SelectItem>
                    <SelectItem className="focus:bg-black/5" value="OTHER">
                      {t("auth.fields.genderOther")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date of birth */}
            <div>
              <FieldLabel>{t("auth.fields.dob")}</FieldLabel>
              <div className="mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-full flex items-center gap-2 px-3 justify-start font-normal focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-500/50",
                        SELECT_TRIGGER_CLASS,
                        !dob && "text-black/40"
                      )}
                    >
                      <CalendarIcon className="h-[18px] w-[18px] shrink-0 text-black/40" />
                      <span className="truncate text-left flex-1 border-none focus:outline-none">
                        {dob
                          ? format(dob, "dd/MM/yyyy", { locale: dateLocale })
                          : t("auth.fields.dobPlaceholder")}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-white border-black/5 text-[oklch(0.12_0.03_292)]"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={dob}
                      onSelect={setDob}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      locale={dateLocale}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </Field>

        {/* Address */}
        <Field delay={0.17}>
          <FieldLabel htmlFor="r-address">{t("auth.fields.address")}</FieldLabel>
          <StyledInputWrap>
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-black/40" />
            <Input
              id="r-address"
              type="text"
              placeholder={t("auth.fields.addressPlaceholder")}
              value={formData.address}
              onChange={(e) => set("address", e.target.value)}
              className={INPUT_CLASS}
            />
          </StyledInputWrap>
        </Field>

        {/* Turnstile */}
        <Field delay={0.2}>
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

        {/* Submit */}
        <Field delay={0.23}>
          <PrimaryButton
            type="submit"
            disabled={isLoading || !turnstileToken}
            loading={isLoading}
            loadingText={t("auth.register.loading")}
          >
            {t("auth.register.btn")}
          </PrimaryButton>
        </Field>
      </form>

      {/* Footer link */}
      <Field delay={0.27}>
        <div className="text-center pt-2">
          <p className="text-[15px] text-black/60">
            {t("auth.register.hasAccount")}{" "}
            <Link
              to="/?mode=login"
              className="text-[oklch(0.12_0.03_292)] font-semibold hover:text-purple-300 transition-colors ml-1"
            >
              {t("auth.register.loginNow")}
            </Link>
          </p>
        </div>
      </Field>
    </div>
  );
}
