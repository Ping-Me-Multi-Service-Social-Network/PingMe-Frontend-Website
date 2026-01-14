import { AvatarFallback } from "@/components/ui/avatar";
import { getUserInitials } from "@/utils/authFieldHandler";
import { cn } from "@/lib/utils";

interface UserAvatarFallbackProps {
  name?: string;
  size?: "sm" | "md" | "lg" | "xl" | number;
  className?: string;
}

const sizeClasses = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-base",
};

export function UserAvatarFallback({
  name,
  size = "md",
  className,
}: UserAvatarFallbackProps) {
  const sizeClass = typeof size === "string" ? sizeClasses[size] : "";
  const customSize =
    typeof size === "number" ? { fontSize: `${size * 0.4}px` } : {};

  return (
    <AvatarFallback
      className={cn(
        "bg-linear-to-br from-purple-500 to-purple-600 font-semibold text-white",
        sizeClass,
        className
      )}
      style={customSize}
    >
      {getUserInitials(name)}
    </AvatarFallback>
  );
}
