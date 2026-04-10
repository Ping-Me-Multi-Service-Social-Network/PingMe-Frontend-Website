
import { Button } from "@/components/ui/button.tsx";
import { X, Square } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RecordingStateProps {
  recordingTime: number;
  formatTime: (seconds: number) => string;
  onCancel: () => void;
  onStop: () => void;
}

export function RecordingState({
  recordingTime,
  formatTime,
  onCancel,
  onStop,
}: RecordingStateProps) {
  const { t } = useTranslation("chat");

  return (
    <div className="chat-recording pl-4 pr-4">
      {/* Cancel button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg h-10 px-3 shrink-0"
        title={t("input.cancelRecord")}
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Recording indicator bar */}
      <div className="chat-recording__bar">
        {/* Pulsing red dot */}
        <div className="chat-recording__dot" />
        <span className="text-sm font-medium text-red-500">
          {t("input.recording")}
        </span>
        <span
          className="text-sm text-gray-500"
          style={{
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "0.5px",
          }}
        >
          {formatTime(recordingTime)}
        </span>

        {/* Waveform bars */}
        <div className="chat-recording__waves">
          {[...Array(12)].map((_, i) => (
            <div
              key={`wave-${i}`}
              className="chat-recording__wave-bar"
              style={{
                animation: `waveBar 0.9s ease-in-out ${i * 0.08}s infinite alternate`,
                height: "4px",
              }}
            />
          ))}
        </div>
      </div>

      {/* Stop button */}
      <button
        onClick={onStop}
        className="chat-send-btn shrink-0"
        style={{ background: "oklch(0.6 0.22 25)" }}
        title={t("input.stopRecord")}
      >
        <Square className="w-4 h-4 fill-current mr-2" />
        {t("input.stopRecord")}
      </button>
    </div>
  );
}
