import { AlertTriangle } from "lucide-react";

// =================================================================
// CoListeningBanner - Hiển thị thông báo "Host đã rời, sắp giải tán"
// =================================================================

interface CoListeningBannerProps {
  visible: boolean;
}

export function CoListeningBanner({ visible }: CoListeningBannerProps) {
  if (!visible) return null;

  return (
    <div
      className="flex items-start gap-2 px-3 py-2.5 rounded-lg mb-3"
      style={{
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.25)",
      }}
    >
      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
      <p className="text-xs text-red-300 leading-relaxed">
        Host đã rời đi. Phiên nghe chung sẽ tự động kết thúc sau khi hết bài
        hát hiện tại.
      </p>
    </div>
  );
}
