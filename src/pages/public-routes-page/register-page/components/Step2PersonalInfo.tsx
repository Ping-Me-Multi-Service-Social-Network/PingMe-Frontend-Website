import { m } from "framer-motion";
import { MapPin, CalendarIcon, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { useState } from "react";
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
import type { RegisterRequest } from "@/types/authentication";
import Field from "@/pages/public-routes-page/shared/auth-ui/Field";
import FieldLabel from "@/pages/public-routes-page/shared/auth-ui/FieldLabel";
import StyledInputWrap from "@/pages/public-routes-page/shared/auth-ui/StyledInputWrap";
import { INPUT_CLASS, SELECT_TRIGGER_CLASS } from "@/pages/public-routes-page/shared/auth-ui/authConstants";

interface Props {
  t: (key: string) => string;
  formData: RegisterRequest;
  dob: Date | undefined;
  onChange: (field: string, value: string) => void;
  onChangeDob: (date: Date | undefined) => void;
  onBack: () => void;
  onNext: () => void;
}

interface Errors {
  gender?: string;
}

export default function Step2PersonalInfo({
  t, formData, dob, onChange, onChangeDob, onBack, onNext,
}: Readonly<Props>) {
  const { i18n } = useTranslation("landing");
  const dateLocale = i18n.language === "vi" ? vi : enUS;
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): Errors => {
    const e: Errors = {};
    if (!formData.gender) e.gender = t("auth.register.validation.genderRequired");
    return e;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-1" style={{ color: "oklch(0.12 0.03 292)" }}>
          {t("auth.register.step2.title")}
        </h2>
        <p className="text-sm" style={{ color: "oklch(0.52 0.04 292)" }}>
          {t("auth.register.step2.subtitle")}
        </p>
      </div>

      <form onSubmit={handleNext} noValidate className="space-y-4">
        {/* Gender & DOB side by side */}
        <Field delay={0.04}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel htmlFor="r-gender">
                {t("auth.fields.gender")} <span className="text-purple-400">*</span>
              </FieldLabel>
              <div className="mt-2">
                <Select
                  value={formData.gender}
                  onValueChange={(v) => { onChange("gender", v); setErrors({}); }}
                  required
                >
                  <SelectTrigger className={cn(SELECT_TRIGGER_CLASS, errors.gender && "border-red-300")}>
                    <SelectValue placeholder={t("auth.fields.genderPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-black/5 text-[oklch(0.12_0.03_292)]">
                    <SelectItem className="focus:bg-black/5" value="MALE">{t("auth.fields.genderMale")}</SelectItem>
                    <SelectItem className="focus:bg-black/5" value="FEMALE">{t("auth.fields.genderFemale")}</SelectItem>
                    <SelectItem className="focus:bg-black/5" value="OTHER">{t("auth.fields.genderOther")}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: "oklch(0.5 0.2 25)" }}>
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {errors.gender}
                  </p>
                )}
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
                        SELECT_TRIGGER_CLASS,
                        !dob && "text-black/40"
                      )}
                    >
                      <CalendarIcon className="h-[17px] w-[17px] shrink-0 text-black/40" />
                      <span className="truncate text-left flex-1 text-sm">
                        {dob ? format(dob, "dd/MM/yyyy", { locale: dateLocale }) : t("auth.fields.dobPlaceholder")}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-black/5 text-[oklch(0.12_0.03_292)]" align="start">
                    <Calendar
                      mode="single"
                      selected={dob}
                      onSelect={onChangeDob}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
        <Field delay={0.07}>
          <FieldLabel htmlFor="r-address">{t("auth.fields.address")}</FieldLabel>
          <StyledInputWrap>
            <m.span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none">
              <MapPin className="h-[17px] w-[17px]" />
            </m.span>
            <Input
              id="r-address"
              type="text"
              placeholder={t("auth.fields.addressPlaceholder")}
              value={formData.address}
              onChange={(e) => onChange("address", e.target.value)}
              className={INPUT_CLASS}
            />
          </StyledInputWrap>
        </Field>

        {/* Navigation buttons — equal width, compact */}
        <Field delay={0.1}>
          <div className="flex gap-2.5 mt-1">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 h-11 rounded-2xl font-semibold text-sm border-2 transition-all"
              style={{
                borderColor: "oklch(0.82 0.05 292)",
                color: "oklch(0.35 0.1 292)",
                background: "transparent",
              }}
            >
              {t("auth.register.nav.back")}
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: "oklch(0.55 0.2 292)",
                color: "white",
                boxShadow: "0 4px 12px oklch(0.55 0.2 292 / 0.3)",
              }}
            >
              {t("auth.register.nav.next")}
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </Field>
      </form>
    </div>
  );
}
