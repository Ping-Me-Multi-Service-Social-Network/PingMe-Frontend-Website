import type { LucideIcon } from "lucide-react";
import {
  MessageCircle,
  Contact,
  MessageSquare,
  Music,
  ArrowRight,
} from "lucide-react";
import {
  LazyMotion,
  domAnimation,
  m,
  useInView,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

// ─── Easing ───────────────────────────────────────────────────────────────────
const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
  tag: string;
}

export default function IntroSection() {
  const { t } = useTranslation("landing");
  return (
    <div id="intro-section">
      <BentoFeaturesSection t={t} />
      <CTASection t={t} />
    </div>
  );
}

// ─── Bento Features ───────────────────────────────────────────────────────────
function BentoFeaturesSection({ t }: Readonly<{ t: any }>) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const springY = useSpring(yBg, { stiffness: 60, damping: 20 });

  const features: Feature[] = [
    {
      id: "chat",
      icon: MessageSquare,
      title: t("features.chat.title"),
      description: t("features.chat.desc"),
      image: "/images/feature-chat.webp",
      tag: "Real-time",
    },
    {
      id: "contacts",
      icon: Contact,
      title: t("features.contacts.title"),
      description: t("features.contacts.desc"),
      image: "/images/feature-contacts.webp",
      tag: "Social",
    },
    {
      id: "reels",
      icon: MessageCircle,
      title: t("features.reels.title"),
      description: t("features.reels.desc"),
      image: "/images/feature-reels.webp",
      tag: "Moments",
    },
    {
      id: "music",
      icon: Music,
      title: t("features.music.title"),
      description: t("features.music.desc"),
      image: "/images/feature-music.webp",
      tag: "Audio",
    },
  ];

  return (
    <section
      ref={ref}
      className="relative py-28 overflow-hidden"
      style={{ background: "oklch(0.97 0.012 292)" }}
    >
      {/* Subtle parallax blob */}
      <m.div
        style={{
          y: springY,
          position: "absolute",
          top: "10%",
          right: "-12%",
          width: 640,
          height: 640,
          borderRadius: "50%",
          background: `radial-gradient(circle, oklch(0.55 0.2 292 / 0.15) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section header — left-aligned, editorial */}
        <LazyMotion features={domAnimation}>
          <m.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE_OUT_QUART }}
            className="mb-20"
          >
            <m.p
              className="text-sm font-semibold uppercase tracking-widest mb-4"
              style={{ color: "oklch(0.12 0.03 292)" }}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE_OUT_QUART }}
            >
              {t("features.title")}
            </m.p>
            <m.h2
              className="text-5xl md:text-6xl font-black tracking-tight leading-none max-w-2xl"
              style={{ color: "oklch(0.12 0.03 292)" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6, ease: EASE_OUT_QUART }}
            >
              {t("features.subtitle")}
            </m.h2>
          </m.div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-auto">
            {/* Large card — Chat */}
            <BentoCard
              feature={features[0]}
              onNavigate={scrollToTop}
              spanClass="md:col-span-7 md:row-span-2"
              imageHeight="h-64 md:h-80"
              large
              index={0}
            />

            {/* Tall card — Contacts */}
            <BentoCard
              feature={features[1]}
              onNavigate={scrollToTop}
              spanClass="md:col-span-5"
              imageHeight="h-48"
              index={1}
            />

            {/* Wide card — Reels */}
            <BentoCard
              feature={features[2]}
              onNavigate={scrollToTop}
              spanClass="md:col-span-5"
              imageHeight="h-44"
              index={2}
            />

            {/* Full-width card — Music */}
            <BentoCard
              feature={features[3]}
              onNavigate={scrollToTop}
              spanClass="md:col-span-12"
              imageHeight="h-56 md:h-72"
              wide
              index={3}
            />
          </div>
        </LazyMotion>
      </div>
    </section>
  );
}

function BentoCard({
  feature,
  onNavigate,
  spanClass,
  imageHeight,
  large = false,
  wide = false,
  index,
}: Readonly<{
  feature: Feature;
  onNavigate: () => void;
  spanClass: string;
  imageHeight: string;
  large?: boolean;
  wide?: boolean;
  index: number;
}>) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = feature.icon;

  return (
    <m.div
      ref={ref}
      className={`${spanClass} group`}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6, ease: EASE_OUT_QUART }}
      whileHover={{ y: -4 }}
    >
      <div
        onClick={onNavigate}
        className="h-full rounded-2xl overflow-hidden cursor-pointer flex flex-col"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
          border: "1px solid rgba(255,255,255,0.9)",
          transition: "box-shadow 0.3s ease, transform 0.3s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 20px 60px rgba(147,51,234,0.15), 0 4px 16px rgba(0,0,0,0.06)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)";
        }}
      >
        {/* Image */}
        {!wide && (
          <div className={`relative ${imageHeight} overflow-hidden shrink-0`}>
            <img
              src={feature.image}
              alt={feature.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, transparent 40%, oklch(0.13 0.03 292 / 0.9) 100%)`,
              }}
            />
            {/* Tag chip */}
            <span
              className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold tracking-wide"
              style={{ background: "rgba(255,255,255,0.9)", color: "oklch(0.12 0.03 292)", backdropFilter: "blur(8px)" }}
            >
              {feature.tag}
            </span>
          </div>
        )}

        {/* Text content */}
        <div className={`flex flex-col gap-3 ${wide ? "md:flex-row" : ""} p-6 flex-1`}>
          {wide && (
            <div
              className={`relative ${imageHeight} overflow-hidden rounded-xl shrink-0 md:w-2/5`}
            >
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: "rgba(255,255,255,0.9)", color: "oklch(0.12 0.03 292)" }}
              >
                {feature.tag}
              </span>
            </div>
          )}

          <div className={`flex flex-col justify-center ${wide ? "md:px-8" : ""} gap-3`}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `rgba(147,51,234,0.05)` }}
            >
              <Icon className="w-5 h-5" style={{ color: "oklch(0.12 0.03 292)" }} />
            </div>

            <div>
              <h3
                className={`font-bold tracking-tight leading-tight ${large ? "text-2xl" : "text-xl"}`}
                style={{ color: "oklch(0.12 0.03 292)" }}
              >
                {feature.title}
              </h3>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: "oklch(0.45 0.05 292)" }}
              >
                {feature.description}
              </p>
            </div>

            <m.div
              className="flex items-center gap-1.5 text-sm font-semibold mt-1 w-fit"
              style={{ color: "oklch(0.12 0.03 292)" }}
              whileHover={{ gap: "10px" }}
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </m.div>
          </div>
        </div>
      </div>
    </m.div>
  );
}

// ─── CTA Section ─────────────────────────────────────────────────────────────
function CTASection({ t }: Readonly<{ t: any }>) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <LazyMotion features={domAnimation}>
      <section
        ref={ref}
        className="py-32 relative overflow-hidden"
        style={{ background: "oklch(0.14 0.04 292)" }}
      >
        {/* Textured noise overlay */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Glow blobs using inline styles to bypass CSS override */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 600,
            background: `radial-gradient(ellipse at center, oklch(0.55 0.2 292 / 0.3) 0%, transparent 60%)`,
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-20%",
            right: "10%",
            width: 400,
            height: 400,
            background: `radial-gradient(circle, oklch(0.65 0.22 340 / 0.25) 0%, transparent 60%)`,
            filter: "blur(30px)",
          }}
        />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-12 md:gap-20">
            {/* Left: Main copy */}
            <div className="flex-1">
              <m.p
                className="text-sm font-semibold uppercase tracking-widest mb-6"
                style={{ color: `oklch(0.75 0.15 292)` }}
                initial={{ opacity: 0, x: -12 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, ease: EASE_OUT_QUART }}
              >
                Get started
              </m.p>

              <m.h2
                className="text-5xl md:text-6xl font-black leading-none tracking-tight"
                style={{ color: "oklch(0.96 0.01 292)" }}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1, duration: 0.6, ease: EASE_OUT_QUART }}
              >
                {t("cta.title")}
              </m.h2>

              <m.p
                className="mt-6 text-lg leading-relaxed max-w-md"
                style={{ color: "oklch(0.72 0.06 292)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.5, ease: EASE_OUT_QUART }}
              >
                {t("cta.desc")}
              </m.p>
            </div>

            {/* Right: CTA buttons */}
            <m.div
              className="flex flex-col gap-3 shrink-0 w-full md:w-auto"
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6, ease: EASE_OUT_QUART }}
            >
              <m.button
                onClick={scrollToTop}
                className="px-8 py-4 rounded-2xl font-bold text-base tracking-tight whitespace-nowrap"
                style={{
                  background: `oklch(0.55 0.2 292)`,
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
                whileHover={{ scale: 1.03, background: `oklch(0.6 0.2 292)` }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                {t("cta.btnRegister")}
              </m.button>

              <m.button
                onClick={scrollToTop}
                className="px-8 py-4 rounded-2xl font-semibold text-base tracking-tight whitespace-nowrap"
                style={{
                  background: "transparent",
                  color: "oklch(0.85 0.04 292)",
                  border: "1px solid oklch(0.4 0.08 292)",
                  cursor: "pointer",
                }}
                whileHover={{
                  background: "oklch(0.22 0.05 292)",
                  borderColor: "oklch(0.55 0.15 292)",
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                {t("cta.btnLogin")}
              </m.button>

              {/* Social proof */}
              <m.p
                className="text-xs text-center"
                style={{ color: "oklch(0.55 0.05 292)" }}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 }}
              >
                No credit card required · Free forever
              </m.p>
            </m.div>
          </div>

          {/* Horizontal divider + tagline */}
          <m.div
            className="mt-20 pt-8"
            style={{ borderTop: "1px solid oklch(0.3 0.06 292)" }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/icons/logo.webp"
                  alt="PingMe"
                  className="w-7 h-7 rounded-lg"
                />
                <span className="font-bold text-sm" style={{ color: "oklch(0.9 0.08 292)" }}>
                  PingMe
                </span>
              </div>
              <p className="text-xs" style={{ color: "oklch(0.45 0.04 292)" }}>
                {t("footer.copyright")}
              </p>
            </div>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}
