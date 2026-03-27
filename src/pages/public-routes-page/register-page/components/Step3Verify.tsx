import Field from "@/pages/public-routes-page/shared/auth-ui/Field";
import TurnstileField from "@/pages/public-routes-page/shared/auth-ui/TurnstileField";
import { CheckCircle2 } from "lucide-react";

interface Props {
  t: (key: string) => string;
  isLoading: boolean;
  turnstileToken: string;
  onTurnstileSuccess: (token: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function Step3Verify({
  t, isLoading, turnstileToken, onTurnstileSuccess, onBack, onSubmit,
}: Readonly<Props>) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-1" style={{ color: "oklch(0.12 0.03 292)" }}>
          {t("auth.register.step3.title")}
        </h2>
        <p className="text-sm" style={{ color: "oklch(0.52 0.04 292)" }}>
          {t("auth.register.step3.subtitle")}
        </p>
      </div>

      <div className="space-y-4">
        {/* Summary */}
        <Field delay={0.04}>
          <div className="rounded-2xl px-4 py-3.5 border flex gap-3"
            style={{ background: "oklch(0.97 0.01 292)", borderColor: "oklch(0.88 0.04 292)" }}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.55 0.2 292)" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "oklch(0.25 0.1 292)" }}>
                {t("auth.register.step3.summaryTitle")}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "oklch(0.52 0.04 292)" }}>
                {t("auth.register.step3.summaryDesc")}
              </p>
            </div>
          </div>
        </Field>

        {/* Turnstile */}
        <Field delay={0.08}>
          <TurnstileField
            onSuccess={onTurnstileSuccess}
            onError={() => onTurnstileSuccess("")}
            onExpire={() => onTurnstileSuccess("")}
          />
        </Field>

        {/* Buttons */}
        <Field delay={0.12}>
          <div className="flex gap-2.5">
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
              type="button"
              onClick={onSubmit}
              disabled={isLoading || !turnstileToken}
              className="flex-1 h-11 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: isLoading || !turnstileToken
                  ? "oklch(0.9 0.02 292)"
                  : "oklch(0.55 0.2 292)",
                color: isLoading || !turnstileToken
                  ? "oklch(0.58 0.04 292)"
                  : "white",
                cursor: isLoading || !turnstileToken ? "not-allowed" : "pointer",
                boxShadow: isLoading || !turnstileToken
                  ? "none"
                  : "0 4px 12px oklch(0.55 0.2 292 / 0.3)",
              }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("auth.register.loading")}
                </>
              ) : (
                t("auth.register.btn")
              )}
            </button>
          </div>
        </Field>
      </div>
    </div>
  );
}
