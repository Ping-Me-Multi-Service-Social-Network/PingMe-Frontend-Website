import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "@/pages/commons/LanguageSwitcher";
import HeroPanelSection from "./HeroPanelSection";
import LoginFormContent from "./LoginFormContent";
import RegisterFormContent from "./RegisterFormContent";

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

interface AuthSectionProps {
  mode: string;
  heroImageSrc?: string;
}

export default function AuthSection({
  mode,
  heroImageSrc = "/images/hero-chat.webp",
}: Readonly<AuthSectionProps>) {
  const [activeFeature, setActiveFeature] = useState(0);
  const { t } = useTranslation("landing");
  const isLogin = mode === "login";

  const imagesForFeatures = [
    heroImageSrc,
    "/images/feature-music.webp",
    "/images/feature-reels.webp",
  ];
  const currentImage = imagesForFeatures[activeFeature];

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative min-h-[100dvh] flex flex-col md:flex-row items-stretch overflow-hidden">
        {/* Background gradient blobs */}
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

        {/* Top-right: language switcher */}
        <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
          <LanguageSwitcher className="!bg-white/80 !border-zinc-200 !text-zinc-800 hover:!bg-white !shadow-sm backdrop-blur-md" />
        </div>

        {/* Top-left: logo */}
        <div className="absolute top-6 left-8 z-50 flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 rounded-xl blur-md opacity-40" />
            <img
              src="/icons/logo.webp"
              alt="PingMe"
              className="w-10 h-10 rounded-xl relative z-10 border border-black/5"
            />
          </div>
          <span className="text-2xl font-black tracking-tight text-[oklch(0.12_0.03_292)]">
            PingMe
          </span>
        </div>

        {/* Left hero panel */}
        <HeroPanelSection
          currentImage={currentImage}
          activeFeature={activeFeature}
          onSelectFeature={setActiveFeature}
        />

        {/* Right form panel */}
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
