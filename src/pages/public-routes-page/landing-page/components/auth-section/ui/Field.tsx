import { m } from "framer-motion";

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

interface FieldProps {
  children: React.ReactNode;
  delay?: number;
}

export default function Field({ children, delay = 0 }: Readonly<FieldProps>) {
  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: EASE_OUT_QUART }}
    >
      {children}
    </m.div>
  );
}
