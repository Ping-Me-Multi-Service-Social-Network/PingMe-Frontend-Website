import { useTranslation } from "react-i18next";
import { LazyMotion, domAnimation, m } from "framer-motion";

const PURPLE = "oklch(0.55 0.2 292)";
const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

export default function LandingFooter() {
  const { t } = useTranslation("landing");
  return (
    <LazyMotion features={domAnimation}>
      <m.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE_OUT_QUART }}
        className="py-6 px-6 border-t"
        style={{ borderColor: "oklch(0.9 0.025 292)", background: "transparent" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/icons/logo.webp" alt="PingMe" className="w-6 h-6 rounded-lg" />
            <span className="text-sm font-bold text-[oklch(0.12_0.03_292)]">
              PingMe
            </span>
          </div>
          <p className="text-xs" style={{ color: "oklch(0.5 0.05 292)" }}>
            {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs font-medium transition-opacity hover:opacity-60" style={{ color: PURPLE }}>
              Privacy
            </a>
            <a href="#" className="text-xs font-medium transition-opacity hover:opacity-60" style={{ color: PURPLE }}>
              Terms
            </a>
          </div>
        </div>
      </m.footer>
    </LazyMotion>
  );
}
