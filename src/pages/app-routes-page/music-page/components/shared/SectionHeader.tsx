import { ChevronRight } from "lucide-react";

export default function SectionHeader({
  title,
  onViewAll,
  viewAllLabel,
}: Readonly<{
  title: string;
  onViewAll?: () => void;
  viewAllLabel?: string;
}>) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-1 group"
        >
          {viewAllLabel}
          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      )}
    </div>
  );
}
