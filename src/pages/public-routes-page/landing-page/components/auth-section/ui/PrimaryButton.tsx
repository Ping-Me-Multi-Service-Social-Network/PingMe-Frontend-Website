import { AnimatePresence, m } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrimaryButtonProps {
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function PrimaryButton({
  type = "button",
  disabled,
  loading,
  loadingText,
  children,
  onClick,
}: Readonly<PrimaryButtonProps>) {
  return (
    <m.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full h-12 rounded-[16px] font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-lg",
        disabled
          ? "bg-black/5 text-black/40 cursor-not-allowed shadow-none"
          : "bg-purple-600 text-white hover:bg-purple-500 hover:shadow-purple-500/25"
      )}
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <m.span
            key="loading"
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <m.span
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
              style={{ display: "block" }}
            />
            {loadingText}
          </m.span>
        ) : (
          <m.span
            key="label"
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
            <ArrowRight className="w-4 h-4 opacity-70" />
          </m.span>
        )}
      </AnimatePresence>
    </m.button>
  );
}
