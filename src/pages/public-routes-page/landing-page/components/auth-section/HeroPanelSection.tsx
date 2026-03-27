import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  MessageCircle,
  Music2,
  Clapperboard,
  Zap,
  Shield,
  Globe,
  Heart,
  Star,
  Sparkles,
  TrendingUp,
  Share2,
  Film,
} from "lucide-react";

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

/* ── Slide data (i18n-aware) ─────────────────────── */
function getSlides(t: (key: string) => string) {
  const p = "auth.login.heroPanel";
  return [
    {
      id: "chat",
      gradient: "linear-gradient(135deg, oklch(0.22 0.18 280) 0%, oklch(0.30 0.20 305) 100%)",
      accentColor: "oklch(0.80 0.18 290)",
      glowColor: "oklch(0.65 0.22 280 / 0.5)",
      icon: MessageCircle,
      tabLabel: t(`${p}.tab0`),
      headline1: t(`${p}.slide0.headline1`),
      headline2: t(`${p}.slide0.headline2`),
      body: t(`${p}.slide0.body`),
      tags: [
        { icon: Zap,    label: t(`${p}.slide0.tag1`) },
        { icon: Shield, label: t(`${p}.slide0.tag2`) },
        { icon: Globe,  label: t(`${p}.slide0.tag3`) },
      ],
      bubbles: [
        { text: t(`${p}.slide0.bubble1`), side: "left"  as const },
        { text: t(`${p}.slide0.bubble2`), side: "right" as const },
        { text: t(`${p}.slide0.bubble3`), side: "left"  as const },
      ],
      stat: { value: t(`${p}.slide0.statValue`), label: t(`${p}.slide0.statLabel`) },
    },
    {
      id: "music",
      gradient: "linear-gradient(135deg, oklch(0.20 0.18 340) 0%, oklch(0.26 0.20 310) 100%)",
      accentColor: "oklch(0.82 0.18 345)",
      glowColor: "oklch(0.65 0.22 340 / 0.5)",
      icon: Music2,
      tabLabel: t(`${p}.tab1`),
      headline1: t(`${p}.slide1.headline1`),
      headline2: t(`${p}.slide1.headline2`),
      body: t(`${p}.slide1.body`),
      tags: [
        { icon: Heart,    label: t(`${p}.slide1.tag1`) },
        { icon: Star,     label: t(`${p}.slide1.tag2`) },
        { icon: Sparkles, label: t(`${p}.slide1.tag3`) },
      ],
      bubbles: [
        { text: t(`${p}.slide1.bubble1`), side: "left"  as const },
        { text: t(`${p}.slide1.bubble2`), side: "right" as const },
        { text: t(`${p}.slide1.bubble3`), side: "left"  as const },
      ],
      stat: { value: t(`${p}.slide1.statValue`), label: t(`${p}.slide1.statLabel`) },
    },
    {
      id: "reels",
      gradient: "linear-gradient(135deg, oklch(0.22 0.18 20) 0%, oklch(0.28 0.20 350) 100%)",
      accentColor: "oklch(0.82 0.18 25)",
      glowColor: "oklch(0.65 0.22 15 / 0.5)",
      icon: Clapperboard,
      tabLabel: t(`${p}.tab2`),
      headline1: t(`${p}.slide2.headline1`),
      headline2: t(`${p}.slide2.headline2`),
      body: t(`${p}.slide2.body`),
      tags: [
        { icon: Film,       label: t(`${p}.slide2.tag1`) },
        { icon: Share2,     label: t(`${p}.slide2.tag2`) },
        { icon: TrendingUp, label: t(`${p}.slide2.tag3`) },
      ],
      bubbles: [
        { text: t(`${p}.slide2.bubble1`), side: "left"  as const },
        { text: t(`${p}.slide2.bubble2`), side: "right" as const },
        { text: t(`${p}.slide2.bubble3`), side: "left"  as const },
      ],
      stat: { value: t(`${p}.slide2.statValue`), label: t(`${p}.slide2.statLabel`) },
    },
  ];
}

/* ── Props ───────────────────────────────────────── */
interface HeroPanelSectionProps {
  activeFeature: number;
  onSelectFeature: (index: number) => void;
}

/* ── Component ───────────────────────────────────── */
export default function HeroPanelSection({
  activeFeature,
  onSelectFeature,
}: Readonly<HeroPanelSectionProps>) {
  const { t } = useTranslation("landing");
  const SLIDES = getSlides(t);
  const [current, setCurrent] = useState(activeFeature);
  const slide = SLIDES[current];

  /* Sync external pill clicks */
  useEffect(() => {
    setCurrent(activeFeature);
  }, [activeFeature]);

  return (
    <m.div
      className="hidden md:flex md:w-[50%] lg:w-[55%] relative flex-col justify-center items-center p-8 lg:p-12 xl:p-16 z-10 flex-shrink-0"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: EASE_OUT_QUART }}
    >
      <div className="relative w-full max-w-[680px]">
        {/* Outer glow behind the frame */}
        <m.div
          className="absolute inset-0 rounded-[32px] blur-[50px] -z-10"
          animate={{ background: slide.glowColor }}
          transition={{ duration: 0.8 }}
          style={{ transform: "scale(0.9) translateY(16px)" }}
        />

        {/* ── Main Content Frame  ── */}
        <m.div
          className="relative aspect-square lg:aspect-[16/10] w-full rounded-[24px] overflow-hidden border-[8px] border-white/60 shadow-[0_32px_80px_rgba(147,51,234,0.18)] ring-1 ring-black/5"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: EASE_OUT_QUART }}
        >
          {/* Animated gradient background — crossfade, no flash */}
          <AnimatePresence initial={false}>
            <m.div
              key={slide.id + "-bg"}
              className="absolute inset-0"
              style={{ background: slide.gradient }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            />
          </AnimatePresence>

          {/* Dot grid pattern */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, oklch(1 0 0 / 0.08) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Top-right glow blob */}
          <AnimatePresence initial={false}>
            <m.div
              key={slide.id + "-glow"}
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${slide.glowColor} 0%, transparent 70%)`,
                filter: "blur(32px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />
          </AnimatePresence>

          {/* ── Tab nav row ── */}
          <div
            className="relative z-20 flex shrink-0"
            style={{
              borderBottom: "1px solid oklch(1 0 0 / 0.12)",
            }}
          >
            {[
              { icon: MessageCircle, label: SLIDES[0].tabLabel, idx: 0 },
              { icon: Music2,        label: SLIDES[1].tabLabel, idx: 1 },
              { icon: Clapperboard,  label: SLIDES[2].tabLabel, idx: 2 },
            ].map(({ icon: TabIcon, label, idx }) => (
              <button
                key={label}
                onClick={() => { setCurrent(idx); onSelectFeature(idx); }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[12px] font-bold uppercase tracking-wider transition-colors relative"
                style={{
                  color: current === idx ? "white" : "oklch(0.70 0.06 292)",
                  background: current === idx ? "oklch(1 0 0 / 0.08)" : "transparent",
                }}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {label}
                {current === idx && (
                  <m.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                    style={{ background: slide.accentColor }}
                    transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Slide content ── */}
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={slide.id}
              className="relative z-10 flex flex-col flex-1 w-full p-7 lg:p-8 justify-between min-h-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
            >
              {/* Top: headline */}
              <div className="flex flex-col gap-4">

                {/* Headline */}
                <h2
                  className="text-white font-black leading-[1.06]"
                  style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)" }}
                >
                  {slide.headline1}
                  <br />
                  <span style={{ color: slide.accentColor }}>{slide.headline2}</span>
                </h2>

                {/* Body */}
                <p
                  className="text-[13px] leading-relaxed max-w-[300px]"
                  style={{ color: "oklch(0.80 0.06 292)" }}
                >
                  {slide.body}
                </p>

                {/* Feature tags */}
                <div className="flex flex-wrap gap-2">
                  {slide.tags.map((tag) => {
                    const TagIcon = tag.icon;
                    return (
                      <div
                        key={tag.label}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
                        style={{
                          background: "oklch(1 0 0 / 0.1)",
                          border: "1px solid oklch(1 0 0 / 0.15)",
                          color: "oklch(0.90 0.05 292)",
                        }}
                      >
                        <TagIcon className="w-3 h-3" style={{ color: slide.accentColor }} />
                        {tag.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom: mock chat bubbles */}
              <div
                className="rounded-2xl overflow-hidden p-3 flex flex-col gap-2"
                style={{
                  background: "oklch(1 0 0 / 0.08)",
                  border: "1px solid oklch(1 0 0 / 0.12)",
                }}
              >
                {slide.bubbles.map((b, i) => (
                  <div
                    key={i}
                    className="flex"
                    style={{ justifyContent: b.side === "right" ? "flex-end" : "flex-start" }}
                  >
                    <div
                      className="px-3.5 py-2 rounded-2xl text-[12px] font-medium leading-snug max-w-[80%]"
                      style={
                        b.side === "right"
                          ? {
                              background: slide.accentColor,
                              color: "white",
                              borderBottomRightRadius: "5px",
                            }
                          : {
                              background: "oklch(1 0 0 / 0.18)",
                              color: "oklch(0.93 0.04 292)",
                              border: "1px solid oklch(1 0 0 / 0.12)",
                              borderBottomLeftRadius: "5px",
                            }
                      }
                    >
                      {b.text}
                    </div>
                  </div>
                ))}
              </div>
            </m.div>
          </AnimatePresence>


          {/* Inner shadow overlay */}
          <div className="absolute inset-0 shadow-[inset_0_0_24px_rgba(0,0,0,0.1)] pointer-events-none z-30" />
        </m.div>

        {/* ── Floating stat card ─────────────── */}
        <m.div
          className="absolute -right-2 sm:-right-8 -bottom-4 sm:-bottom-8 bg-white/90 backdrop-blur-2xl px-5 py-4 rounded-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white flex items-center gap-4 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: EASE_OUT_QUART }}
        >
          {/* Avatar circles */}
          <div className="flex -space-x-2.5 shrink-0">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full border-[2.5px] shadow-sm"
                style={{
                  background: `oklch(${0.58 + i * 0.06} 0.18 ${290 + i * 20})`,
                  borderColor: "white",
                }}
              />
            ))}
          </div>
          <div>
            <AnimatePresence mode="wait">
              <m.p
                key={slide.stat.value}
                className="text-xl font-black tracking-tight"
                style={{ color: "oklch(0.12 0.03 292)" }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                {slide.stat.value}
              </m.p>
            </AnimatePresence>
            <p className="text-[11px] font-medium" style={{ color: "oklch(0.55 0.04 292)" }}>
              {slide.stat.label}
            </p>
          </div>
        </m.div>


      </div>
    </m.div>
  );
}
