import { m } from "framer-motion";
import { MessageSquare, Music, Users } from "lucide-react";
import FeaturePill from "./ui/FeaturePill";

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

interface HeroPanelSectionProps {
  currentImage: string;
  activeFeature: number;
  onSelectFeature: (index: number) => void;
}

export default function HeroPanelSection({
  currentImage,
  activeFeature,
  onSelectFeature,
}: Readonly<HeroPanelSectionProps>) {
  return (
    <m.div
      className="hidden md:flex md:w-[50%] lg:w-[55%] relative flex-col justify-center items-center p-8 lg:p-12 xl:p-16 z-10 flex-shrink-0"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: EASE_OUT_QUART }}
    >
      <div className="relative w-full max-w-[680px]">
        {/* Decorative background glow behind image */}
        <div className="absolute inset-0 bg-purple-400/20 blur-[60px] translate-y-10 rounded-full" />

        {/* Main Image Frame */}
        <m.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: EASE_OUT_QUART }}
          className="relative aspect-square lg:aspect-[16/10] w-full rounded-[24px] overflow-hidden border-[8px] bg-zinc-50 border-white/60 shadow-[0_32px_80px_rgba(147,51,234,0.15)] ring-1 ring-black/5"
        >
          <img
            key={currentImage}
            src={currentImage}
            alt="PingMe app feature"
            className="absolute inset-0 w-full h-full object-cover object-center z-10 transition-transform duration-[3s] animate-in fade-in zoom-in-95 duration-700"
          />
          {/* Soft interior shadow overlay */}
          <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.08)] pointer-events-none z-20" />
        </m.div>

        {/* Feature pills */}
        <div className="absolute -left-6 sm:-left-12 top-12 flex flex-col gap-3 z-30 pointer-events-auto">
          <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <FeaturePill
              icon={MessageSquare}
              label="Instant Chat"
              isActive={activeFeature === 0}
              onClick={() => onSelectFeature(0)}
            />
          </m.div>
          <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <FeaturePill
              icon={Music}
              label="Music"
              isActive={activeFeature === 1}
              onClick={() => onSelectFeature(1)}
            />
          </m.div>
          <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <FeaturePill
              icon={Users}
              label="Social"
              isActive={activeFeature === 2}
              onClick={() => onSelectFeature(2)}
            />
          </m.div>
        </div>

        {/* Social Proof floating card */}
        <m.div
          className="absolute -right-2 sm:-right-8 -bottom-4 sm:-bottom-8 bg-white/90 backdrop-blur-2xl px-6 py-5 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white flex flex-col sm:flex-row items-start sm:items-center gap-4 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: EASE_OUT_QUART }}
        >
          <div className="flex -space-x-3 shrink-0">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-[3px] shadow-sm"
                style={{
                  background: `oklch(${0.6 + i * 0.05} 0.15 ${292 + i * 15})`,
                  borderColor: "white",
                }}
              />
            ))}
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight" style={{ color: "oklch(0.12 0.03 292)" }}>
              2M+
            </p>
          </div>
        </m.div>
      </div>
    </m.div>
  );
}
