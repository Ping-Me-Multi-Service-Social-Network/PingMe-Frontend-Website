import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/features/hooks";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import { registerLocalApi } from "@/services/authentication";
import type { RegisterRequest } from "@/types/authentication";
import LanguageSwitcher from "@/pages/commons/LanguageSwitcher";
import Step1BasicInfo from "./components/Step1BasicInfo";
import Step2PersonalInfo from "./components/Step2PersonalInfo";
import Step3Verify from "./components/Step3Verify";

const EASE_QUART = [0.25, 1, 0.5, 1] as const;

const BUBBLES = [
  { size: 56, x: "12%", y: "18%", hue: 292, delay: 0 },
  { size: 40, x: "72%", y: "10%", hue: 320, delay: 0.15 },
  { size: 72, x: "80%", y: "55%", hue: 260, delay: 0.3 },
  { size: 32, x: "25%", y: "72%", hue: 340, delay: 0.1 },
  { size: 48, x: "55%", y: "82%", hue: 280, delay: 0.25 },
  { size: 24, x: "88%", y: "30%", hue: 300, delay: 0.4 },
];

const EMPTY_FORM: RegisterRequest = {
  email: "",
  password: "",
  name: "",
  gender: "OTHER",
  address: "",
  turnstileToken: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("landing");
  const { isLogin } = useAppSelector((state) => state.auth);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<RegisterRequest>(EMPTY_FORM);
  const [dob, setDob] = useState<Date>();
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLogin) navigate("/app/chat", { replace: true });
  }, [isLogin, navigate]);

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const nextStep = () => setStep((s) => Math.min(s + 1, 2));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!turnstileToken) return;
    setIsLoading(true);
    try {
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

  const STEPS = [
    t("auth.register.steps.step1"),
    t("auth.register.steps.step2"),
    t("auth.register.steps.step3"),
  ];

  return (
    <LazyMotion features={domAnimation}>
      <div
        className="min-h-screen flex flex-col md:flex-row overflow-hidden"
        style={{ background: "oklch(0.985 0.008 292)" }}
      >
        {/* ── Left Visual Panel ── */}
        <m.aside
          className="hidden md:flex md:w-[42%] lg:w-[45%] flex-shrink-0 flex-col justify-between p-10 lg:p-14 relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, oklch(0.25 0.18 292) 0%, oklch(0.18 0.14 320) 100%)",
          }}
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE_QUART }}
        >
          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, oklch(1 0 0 / 0.06) 1px, transparent 0)`,
              backgroundSize: "28px 28px",
            }}
          />
          {/* Glow blobs */}
          <div className="absolute top-[-15%] right-[-10%] w-[420px] h-[420px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, oklch(0.65 0.22 280 / 0.35) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, oklch(0.55 0.2 340 / 0.3) 0%, transparent 70%)", filter: "blur(80px)" }} />

          {/* Floating bubbles */}
          {BUBBLES.map((b, i) => (
            <m.div key={i} className="absolute rounded-full pointer-events-none"
              style={{
                width: b.size, height: b.size, left: b.x, top: b.y,
                background: `oklch(0.7 0.18 ${b.hue} / 0.25)`,
                border: `1px solid oklch(0.8 0.1 ${b.hue} / 0.3)`,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: b.delay + 0.4, duration: 0.6, ease: EASE_QUART }}
            />
          ))}

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-xl blur-md" />
              <img src="/icons/logo.webp" alt="PingMe" className="w-10 h-10 rounded-xl relative z-10 border border-white/20" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">PingMe</span>
          </div>

          {/* Hero text */}
          <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
            <m.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: EASE_QUART }}>
              <p className="text-[oklch(0.85_0.08_292)] text-sm font-semibold uppercase tracking-[0.15em] mb-4">
                {t("auth.register.hero.greeting")}
              </p>
              <h1 className="text-white font-black leading-[1.1] mb-6"
                style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)" }}>
                {t("auth.register.hero.line1")}<br />
                {t("auth.register.hero.line2")}<br />
                <span style={{ color: "oklch(0.82 0.16 320)" }}>
                  {t("auth.register.hero.line3")}
                </span>
              </h1>
              <p className="text-[oklch(0.78_0.06_292)] text-base leading-relaxed max-w-[340px]">
                {t("auth.register.hero.desc")}
              </p>
            </m.div>

            {/* Stats */}
            <m.div className="mt-10 flex gap-8"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6, ease: EASE_QUART }}>
              {[
                { value: t("auth.register.hero.stat1Value"), label: t("auth.register.hero.stat1Label") },
                { value: t("auth.register.hero.stat2Value"), label: t("auth.register.hero.stat2Label") },
                { value: t("auth.register.hero.stat3Value"), label: t("auth.register.hero.stat3Label") },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-white font-black text-2xl tracking-tight">{s.value}</p>
                  <p className="text-[oklch(0.72_0.06_292)] text-xs font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </m.div>
          </div>

          {/* Footer CTA */}
          <m.div className="relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <p className="text-base" style={{ color: "oklch(0.72 0.06 292)" }}>
              {t("auth.register.hero.haveAccount")}{" "}
              <Link to="/" className="font-bold hover:text-white transition-colors" style={{ color: "oklch(0.88 0.14 320)" }}>
                {t("auth.register.hero.loginLink")}
              </Link>
            </p>
          </m.div>

        </m.aside>

        {/* ── Right Form Panel ── */}
        <div className="flex-1 flex flex-col min-h-screen md:min-h-0">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 pt-6 md:px-10 md:pt-8 flex-shrink-0">
            <div className="flex md:hidden items-center gap-2.5">
              <img src="/icons/logo.webp" alt="PingMe" className="w-8 h-8 rounded-xl border border-black/5" />
              <span className="text-xl font-black tracking-tight" style={{ color: "oklch(0.12 0.03 292)" }}>PingMe</span>
            </div>
            <div className="hidden md:block" />
            <LanguageSwitcher className="!bg-white/80 !border-zinc-200 !text-zinc-800 hover:!bg-white !shadow-sm backdrop-blur-md" />
          </div>

          {/* Form area */}
          <div className="flex-1 flex items-center justify-center px-6 py-8 md:px-10">
            <div className="w-full max-w-[480px]">

              {/* ── Step Indicator ── */}
              <m.div className="mb-8" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="flex items-center">
                  {STEPS.map((label, i) => (
                    <div key={label} className="flex items-center flex-1 last:flex-none">
                      <button
                        type="button"
                        onClick={() => i < step && setStep(i)}
                        className="flex items-center gap-2.5 flex-shrink-0"
                      >
                        <m.div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 transition-all"
                          animate={{
                            background: i < step ? "oklch(0.55 0.2 292)" : i === step ? "white" : "transparent",
                            borderColor: i <= step ? "oklch(0.55 0.2 292)" : "oklch(0.82 0.04 292)",
                            color: i < step ? "white" : i === step ? "oklch(0.35 0.15 292)" : "oklch(0.65 0.04 292)",
                            scale: i === step ? 1.1 : 1,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {i < step ? (
                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                              <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : i + 1}
                        </m.div>
                        <m.span
                          className="text-sm font-semibold hidden sm:block"
                          animate={{
                            color: i === step ? "oklch(0.2 0.1 292)" : i < step ? "oklch(0.55 0.2 292)" : "oklch(0.65 0.04 292)",
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {label}
                        </m.span>
                      </button>

                      {i < STEPS.length - 1 && (
                        <div className="flex-1 mx-3 h-0.5 relative overflow-hidden rounded-full"
                          style={{ background: "oklch(0.88 0.03 292)" }}>
                          <m.div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{ background: "oklch(0.55 0.2 292)" }}
                            animate={{ width: step > i ? "100%" : "0%" }}
                            transition={{ duration: 0.4, ease: EASE_QUART }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </m.div>

              {/* ── Step Content ── */}
              <AnimatePresence mode="wait">
                <m.div
                  key={step}
                  initial={{ opacity: 0, x: 24, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -24, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: EASE_QUART }}
                >
                  {step === 0 && (
                    <Step1BasicInfo t={t} formData={formData} onChange={update} onNext={nextStep} />
                  )}
                  {step === 1 && (
                    <Step2PersonalInfo
                      t={t} formData={formData} dob={dob}
                      onChange={update} onChangeDob={setDob}
                      onBack={prevStep} onNext={nextStep}
                    />
                  )}
                  {step === 2 && (
                    <Step3Verify
                      t={t} isLoading={isLoading} turnstileToken={turnstileToken}
                      onTurnstileSuccess={setTurnstileToken}
                      onBack={prevStep} onSubmit={handleSubmit}
                    />
                  )}
                </m.div>
              </AnimatePresence>

              {/* Mobile login link */}
              <p className="md:hidden text-center text-sm mt-6" style={{ color: "oklch(0.6 0.04 292)" }}>
                {t("auth.register.hero.haveAccount")}{" "}
                <Link to="/" className="font-semibold" style={{ color: "oklch(0.45 0.18 292)" }}>
                  {t("auth.register.nav.mobileLogin")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}
