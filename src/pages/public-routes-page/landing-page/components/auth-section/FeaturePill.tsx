import { m } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeaturePillProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function FeaturePill({
  icon: Icon,
  label,
  isActive = false,
  onClick,
}: Readonly<FeaturePillProps>) {
  return (
    <m.div
      onClick={onClick}
      className="cursor-pointer flex items-center gap-2.5 px-4 py-3 rounded-2xl text-[12px] font-bold uppercase tracking-wider transition-all shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
      style={{
        background: isActive ? "oklch(0.55 0.2 292)" : "rgba(255, 255, 255, 0.95)",
        color: isActive ? "white" : "oklch(0.2 0.05 292)",
        border: isActive ? "1px solid transparent" : "1px solid rgba(255,255,255,0.6)",
        backdropFilter: "blur(16px)",
      }}
      whileHover={{ scale: 1.05, background: isActive ? "oklch(0.55 0.2 292)" : "#fff", y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300",
          isActive ? "bg-white/20 text-white" : "bg-purple-50 text-purple-600"
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      {label}
    </m.div>
  );
}
