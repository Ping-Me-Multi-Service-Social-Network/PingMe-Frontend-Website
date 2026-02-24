import type React from "react";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          // Success toasts - green colors
          "--success-bg": "oklch(0.95 0.05 145)",
          "--success-text": "oklch(0.25 0.15 145)",
          "--success-border": "oklch(0.7 0.15 145)",
          // Error toasts - use destructive colors
          "--error-bg": "oklch(0.98 0.05 27)",
          "--error-text": "var(--destructive)",
          "--error-border": "var(--destructive)",
          // Info toasts - use primary purple colors
          "--info-bg": "oklch(0.97 0.03 270)",
          "--info-text": "var(--primary)",
          "--info-border": "var(--primary)",
          // Warning toasts - orange colors
          "--warning-bg": "oklch(0.97 0.05 65)",
          "--warning-text": "oklch(0.35 0.15 65)",
          "--warning-border": "oklch(0.65 0.15 65)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
