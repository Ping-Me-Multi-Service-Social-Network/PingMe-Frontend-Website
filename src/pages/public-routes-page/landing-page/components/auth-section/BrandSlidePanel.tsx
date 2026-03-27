import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Music2,
  Users,
  Sparkles,
  Zap,
  Globe,
  Star,
  Heart,
  Shield,
} from "lucide-react";

const EASE_QUART = [0.25, 1, 0.5, 1] as const;
const SLIDE_INTERVAL = 4500;

const SLIDES = [
  {
    id: "chat",
    gradient: ["oklch(0.28 0.18 275)", "oklch(0.20 0.16 305)"],
    accentColor: "oklch(0.75 0.18 280)",
    glowColor: "oklch(0.60 0.22 280 / 0.45)",
    icon: MessageCircle,
    badge: "Instant Messaging",
    headline: ["Connect with", "anyone,", "anywhere."],
    accentWord: "anywhere.",
    desc: "Send messages, share moments, and stay close with the people who matter most — all in real time.",
    tags: [
      { icon: Zap, text: "Real-time delivery" },
      { icon: Shield, text: "End-to-end encrypted" },
      { icon: Globe, text: "Works worldwide" },
    ],
    stats: [
      { value: "2M+", label: "Active users" },
      { value: "<50ms", label: "Message latency" },
    ],
    bubbles: [
      {
        text: "Hey! Are you free tonight? 🎉",
        align: "left" as const,
        top: "22%",
      },
      {
        text: "Absolutely! Let's catch up 😊",
        align: "right" as const,
        top: "38%",
      },
      {
        text: "Just pinged you the details!",
        align: "left" as const,
        top: "54%",
      },
    ],
  },
  {
    id: "music",
    gradient: ["oklch(0.22 0.16 330)", "oklch(0.18 0.14 295)"],
    accentColor: "oklch(0.80 0.18 340)",
    glowColor: "oklch(0.65 0.22 340 / 0.45)",
    icon: Music2,
    badge: "Music Sharing",
    headline: ["Share the", "rhythm of", "your world."],
    accentWord: "your world.",
    desc: "Discover, share, and vibe to music with friends. Let your playlist tell the story only music can.",
    tags: [
      { icon: Heart, text: "Share your mood" },
      { icon: Star, text: "Curated playlists" },
      { icon: Sparkles, text: "AI recommendations" },
    ],
    stats: [
      { value: "50M+", label: "Tracks available" },
      { value: "120+", label: "Genres covered" },
    ],
    bubbles: [
      {
        text: "🎵 Now playing: Blinding Lights",
        align: "left" as const,
        top: "22%",
      },
      {
        text: "This track is 🔥 adding to playlist!",
        align: "right" as const,
        top: "38%",
      },
      {
        text: "Check this new drop 🎧",
        align: "left" as const,
        top: "54%",
      },
    ],
  },
  {
    id: "social",
    gradient: ["oklch(0.20 0.14 292)", "oklch(0.16 0.18 260)"],
    accentColor: "oklch(0.78 0.18 292)",
    glowColor: "oklch(0.60 0.22 260 / 0.45)",
    icon: Users,
    badge: "Social Network",
    headline: ["Build your", "community,", "grow together."],
    accentWord: "grow together.",
    desc: "Connect with communities that share your passion. Make new friends, collaborate, and create lasting bonds.",
    tags: [
      { icon: Users, text: "Group spaces" },
      { icon: Globe, text: "Global communities" },
      { icon: Sparkles, text: "Discover new people" },
    ],
    stats: [
      { value: "500K+", label: "Communities" },
      { value: "98%", label: "User satisfaction" },
    ],
    bubbles: [
      {
        text: "Just joined the Design community! 🎨",
        align: "left" as const,
        top: "22%",
      },
      {
        text: "Welcome! Great to have you 🙌",
        align: "right" as const,
        top: "38%",
      },
      {
        text: "Let's collab on something awesome",
        align: "left" as const,
        top: "54%",
      },
    ],
  },
];


export default function BrandSlidePanel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = SLIDES[current];
  const Icon = slide.icon;

  return (
    <m.aside
      className="hidden md:flex md:w-[50%] lg:w-[55%] flex-shrink-0 relative overflow-hidden"
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE_QUART }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Animated background */}
      <AnimatePresence mode="wait">
        <m.div
          key={slide.id + "-bg"}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(145deg, ${slide.gradient[0]} 0%, ${slide.gradient[1]} 100%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      </AnimatePresence>

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, oklch(1 0 0 / 0.06) 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Glow blob */}
      <AnimatePresence mode="wait">
        <m.div
          key={slide.id + "-glow"}
          className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${slide.glowColor} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>
      <m.div
        className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(0.55 0.2 320 / 0.2) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full w-full p-10 lg:p-14">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 rounded-xl blur-md" />
            <img
              src="/icons/logo.webp"
              alt="PingMe"
              className="w-10 h-10 rounded-xl relative z-10 border border-white/20"
            />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">PingMe</span>
        </div>

        {/* Slide content */}
        <div className="flex-1 flex flex-col justify-center py-8 min-h-0">
          <AnimatePresence mode="wait">
            <m.div
              key={slide.id}
              className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -28 }}
              transition={{ duration: 0.55, ease: EASE_QUART }}
            >
              {/* Badge */}
              <m.div
                className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{
                  background: "oklch(1 0 0 / 0.12)",
                  border: "1px solid oklch(1 0 0 / 0.2)",
                  color: slide.accentColor,
                  backdropFilter: "blur(12px)",
                }}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
              >
                <Icon className="w-3.5 h-3.5" />
                {slide.badge}
              </m.div>

              {/* Headline */}
              <m.h2
                className="text-white font-black leading-[1.08]"
                style={{ fontSize: "clamp(2rem, 3.2vw, 2.8rem)" }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
              >
                {slide.headline.slice(0, -1).join(" ")}{" "}
                <br />
                <span style={{ color: slide.accentColor }}>{slide.accentWord}</span>
              </m.h2>

              {/* Description */}
              <m.p
                className="text-base leading-relaxed max-w-[340px]"
                style={{ color: "oklch(0.78 0.06 292)" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.45 }}
              >
                {slide.desc}
              </m.p>

              {/* Tags */}
              <m.div
                className="flex flex-wrap gap-2.5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.45 }}
              >
                {slide.tags.map((tag) => {
                  const TagIcon = tag.icon;
                  return (
                    <div
                      key={tag.text}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold"
                      style={{
                        background: "oklch(1 0 0 / 0.1)",
                        border: "1px solid oklch(1 0 0 / 0.15)",
                        color: "oklch(0.88 0.06 292)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <TagIcon className="w-3.5 h-3.5" style={{ color: slide.accentColor }} />
                      {tag.text}
                    </div>
                  );
                })}
              </m.div>

              {/* Mock chat bubbles */}
              <m.div
                className="relative h-[160px] mt-2 rounded-2xl overflow-hidden"
                style={{
                  background: "oklch(1 0 0 / 0.07)",
                  border: "1px solid oklch(1 0 0 / 0.12)",
                  backdropFilter: "blur(12px)",
                }}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                {slide.bubbles.map((bubble, i) => (
                  <m.div
                    key={bubble.text}
                    className="absolute"
                    style={{
                      top: bubble.top,
                      left: bubble.align === "left" ? "12px" : "auto",
                      right: bubble.align === "right" ? "12px" : "auto",
                      maxWidth: "72%",
                    }}
                    initial={{ opacity: 0, x: bubble.align === "left" ? -12 : 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.12, duration: 0.4 }}
                  >
                    <div
                      className="px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-snug"
                      style={
                        bubble.align === "right"
                          ? {
                              background: slide.accentColor,
                              color: "white",
                              borderBottomRightRadius: "6px",
                            }
                          : {
                              background: "oklch(1 0 0 / 0.18)",
                              color: "oklch(0.92 0.04 292)",
                              border: "1px solid oklch(1 0 0 / 0.12)",
                              borderBottomLeftRadius: "6px",
                            }
                      }
                    >
                      {bubble.text}
                    </div>
                  </m.div>
                ))}
              </m.div>

              {/* Stats */}
              <m.div
                className="flex gap-8"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.45 }}
              >
                {slide.stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-white font-black text-2xl tracking-tight">{s.value}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: "oklch(0.68 0.06 292)" }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </m.div>
            </m.div>
          </AnimatePresence>
        </div>

        {/* Bottom: dots + progress */}
        <div className="shrink-0 flex items-center gap-4">
          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                className="relative focus:outline-none"
                aria-label={`Go to slide ${i + 1}`}
              >
                <m.div
                  className="rounded-full"
                  animate={{
                    width: i === current ? 28 : 8,
                    height: 8,
                    background:
                      i === current
                        ? slide.accentColor
                        : "oklch(1 0 0 / 0.35)",
                  }}
                  transition={{ duration: 0.35, ease: EASE_QUART }}
                />
              </button>
            ))}
          </div>

          {/* Auto-progress bar */}
          {!isPaused && (
            <div
              className="flex-1 h-0.5 rounded-full overflow-hidden"
              style={{ background: "oklch(1 0 0 / 0.15)" }}
            >
              <m.div
                key={current + "-progress"}
                className="h-full rounded-full"
                style={{ background: slide.accentColor }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: SLIDE_INTERVAL / 1000,
                  ease: "linear",
                }}
              />
            </div>
          )}

          {isPaused && (
            <p className="text-[11px] font-medium" style={{ color: "oklch(0.6 0.04 292)" }}>
              Paused
            </p>
          )}
        </div>
      </div>
    </m.aside>
  );
}
