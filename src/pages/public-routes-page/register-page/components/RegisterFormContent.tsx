import { useState } from "react";
import { m } from "framer-motion";
import { Mail, Lock, User, MapPin, CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
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
import Field from "@/pages/public-routes-page/shared/auth-ui/Field";
import FieldLabel from "@/pages/public-routes-page/shared/auth-ui/FieldLabel";
import StyledInputWrap from "@/pages/public-routes-page/shared/auth-ui/StyledInputWrap";
import PrimaryButton from "@/pages/public-routes-page/shared/auth-ui/PrimaryButton";
import PasswordToggleButton from "@/pages/public-routes-page/shared/auth-ui/PasswordToggleButton";
import TurnstileField from "@/pages/public-routes-page/shared/auth-ui/TurnstileField";
import { INPUT_CLASS, SELECT_TRIGGER_CLASS } from "@/pages/public-routes-page/shared/auth-ui/authConstants";

interface RegisterFormContentProps {
  t: (key: string) => string;
}

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
      await registerLocalApi({
        ...formData,
        turnstileToken,
        dob: dob?.toLocaleDateString("en-CA"),
      });
      toast.success(t("auth.register.success"));
      navigate("/");
    } catch (err) {
      toast.error(getErrorMessage(err, t("auth.register.fail")));
    } finally {
      setIsLoading(false);
    }
  };

  const dateLocale = i18n.language === "vi" ? vi : enUS;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "oklch(0.12 0.03 292)" }}>
          {t("auth.register.title")}
        </h2>
        <p className="text-sm" style={{ color: "oklch(0.48 0.04 292)" }}>{t("auth.register.subtitle")}</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-3.5">
        {/* Name */}
        <Field delay={0.05}>
          <FieldLabel htmlFor="r-name">
            {t("auth.fields.name")} <span className="text-purple-400">*</span>
          </FieldLabel>
          <StyledInputWrap>
            <m.span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none">
              <User className="h-[18px] w-[18px]" />
            </m.span>
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
            <m.span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none">
              <Mail className="h-[18px] w-[18px]" />
            </m.span>
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
            <m.span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none">
              <Lock className="h-[18px] w-[18px]" />
            </m.span>
            <Input
              id="r-password"
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.fields.pwdMinLength")}
              value={formData.password}
              onChange={(e) => set("password", e.target.value)}
              className={cn(INPUT_CLASS, "pr-12")}
              required
            />
            <PasswordToggleButton
              isVisible={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
            />
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
                <Select
                  value={formData.gender}
                  onValueChange={(v) => set("gender", v)}
                  required
                >
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
                      <span className="truncate text-left flex-1">
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
            <m.span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none">
              <MapPin className="h-[18px] w-[18px]" />
            </m.span>
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
          <TurnstileField
            onSuccess={(token) => setTurnstileToken(token)}
            onError={() => setTurnstileToken("")}
            onExpire={() => setTurnstileToken("")}
          />
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

    </div>
  );
}
