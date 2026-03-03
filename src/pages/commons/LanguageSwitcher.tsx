import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from "framer-motion";

interface LanguageSwitcherProps {
    className?: string;
    variant?: "ghost" | "outline" | "default" | "secondary";
    showLabel?: boolean;
}

const LanguageSwitcher = ({
    className,
    variant = "ghost",
    showLabel = true
}: LanguageSwitcherProps) => {
    const { currentLanguage, toggleLanguage } = useLanguage();

    return (
        <Button
            variant={variant}
            size="sm"
            onClick={toggleLanguage}
            className={cn(
                "relative flex items-center gap-3 px-4 py-2.5 h-auto rounded-full transition-all duration-300 group",
                "bg-white/15 backdrop-blur-xl border border-white/30 hover:border-white/50",
                "shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)]",
                "hover:scale-105 active:scale-95 text-white active:bg-white/20",
                className
            )}
        >
            <AnimatePresence mode="wait">
                <m.div
                    key={currentLanguage}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2.5"
                >
                    <div className="relative">
                        <img
                            src={currentLanguage === "vi" ? "https://flagcdn.com/w40/vn.png" : "https://flagcdn.com/w40/us.png"}
                            alt={currentLanguage}
                            className="h-4 w-6 object-cover rounded-sm shadow-md border border-white/20"
                        />
                        <div className="absolute inset-0 rounded-sm ring-1 ring-inset ring-white/10" />
                    </div>

                    {showLabel && (
                        <span className="text-sm font-bold tracking-wide drop-shadow-md">
                            {currentLanguage === "vi" ? "Tiếng Việt" : "English"}
                        </span>
                    )}
                </m.div>
            </AnimatePresence>

            {/* Glossy Reflection Effect */}
            <div className="absolute inset-0 pointer-events-none rounded-full bg-linear-to-t from-white/0 via-white/5 to-white/10 opacity-50" />
        </Button>
    );
};

export default LanguageSwitcher;
