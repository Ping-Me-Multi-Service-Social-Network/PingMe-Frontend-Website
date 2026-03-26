import { AnimatePresence, m } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

interface PasswordToggleButtonProps {
  isVisible: boolean;
  onToggle: () => void;
}

/**
 * Animated Eye / EyeOff toggle button placed inside a password input wrapper.
 * Rendered as an `m.button` with a flip animation on state change.
 */
export default function PasswordToggleButton({
  isVisible,
  onToggle,
}: Readonly<PasswordToggleButtonProps>) {
  return (
    <m.button
      type="button"
      onClick={onToggle}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70 transition-colors"
      whileTap={{ scale: 0.85 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={String(isVisible)}
          initial={{ opacity: 0, rotate: -45 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 45 }}
          transition={{ duration: 0.15 }}
          className="block"
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </m.span>
      </AnimatePresence>
    </m.button>
  );
}
