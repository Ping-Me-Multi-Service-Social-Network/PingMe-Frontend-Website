import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { audioTranscribeService } from "@/services/ai/audio-transcribe";

interface ChatInputProps {
  onSend: (prompt: string, files: File[]) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
];
const MAX_RECORD_DURATION = 90; // 1 phút 30 giây

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { t } = useTranslation("ai");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Auto-stop at MAX_RECORD_DURATION
  useEffect(() => {
    if (isRecording && recordingTime >= MAX_RECORD_DURATION) {
      stopRecording();
    }
  }, [recordingTime, isRecording]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ---- Voice Recording ----
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Handled by stopRecording
      };

      mediaRecorder.start(100); // collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      setError(t("chatInput.micError"));
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return;

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);

    // Wait for MediaRecorder to fully stop and provide final data
    await new Promise<void>((resolve) => {
      const recorder = mediaRecorderRef.current!;
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    // Stop mic stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Create audio file from chunks
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    chunksRef.current = [];

    if (blob.size === 0) {
      setError(t("chatInput.recordError"));
      return;
    }

    const file = new File([blob], `recording-${Date.now()}.webm`, { type: "audio/webm" });

    // Send to API
    setIsTranscribing(true);
    try {
      const res = await audioTranscribeService.transcribeAudio(file);
      const transcribedText = res.data.data.content;
      if (transcribedText && transcribedText.trim()) {
        setText((prev) => {
          if (prev.trim()) {
            return prev + " " + transcribedText.trim();
          }
          return transcribedText.trim();
        });
        // Auto-resize textarea after setting text
        setTimeout(() => {
          const ta = textareaRef.current;
          if (ta) {
            ta.style.height = "auto";
            ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
          }
        }, 50);
      }
    } catch {
      setError(t("chatInput.transcribeError"));
    } finally {
      setIsTranscribing(false);
    }
  };

  const cancelRecording = () => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    // Stop mic stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    chunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
  };

  // ---- File handling ----
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const validateAndAddFiles = useCallback((newFiles: FileList | File[]) => {
    setError(null);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of Array.from(newFiles)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(t("chatInput.invalidImage", { name: file.name }));
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(t("chatInput.fileTooLarge", { name: file.name }));
        continue;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      setPreviews((prev) => [...prev, ...validPreviews]);
    }
  }, []);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;
    if (disabled) return;

    onSend(trimmed, files);
    setText("");
    setFiles([]);
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews([]);
    setError(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const canSend = (text.trim().length > 0 || files.length > 0) && !disabled;

  return (
    <div className="w-full">
      {/* Error message */}
      {error && (
        <div className="mb-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      {/* Image previews */}
      {previews.length > 0 && (
        <div className="img-preview-grid mb-2">
          {previews.map((src, idx) => (
            <div key={src} className="img-preview-item">
              <img src={src} alt={`preview-${idx}`} />
              <button
                className="img-preview-remove"
                onClick={() => removeFile(idx)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ===== TRANSCRIBING STATE ===== */}
      {isTranscribing && (
        <div className="flex items-center gap-3 bg-white border border-violet-200 rounded-2xl px-4 py-3 shadow-sm">
          <div className="ai-spinner flex-shrink-0" style={{ width: 18, height: 18 }} />
          <span className="text-sm text-violet-600 font-medium transcribing-text">
            {t("chatInput.transcribing")}
          </span>
        </div>
      )}

      {/* ===== RECORDING STATE ===== */}
      {isRecording && !isTranscribing && (
        <div className="recording-bar flex items-center gap-3 bg-white border border-red-200 rounded-2xl px-3 py-2 shadow-sm">
          {/* Cancel button */}
          <button
            type="button"
            onClick={cancelRecording}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
            title={t("chatInput.cancelRecord")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Recording indicator */}
          <div className="flex-1 flex items-center gap-3">
            <div className="recording-pulse-dot" />
            <span className="text-sm font-medium text-red-500">{t("chatInput.recording")}</span>
            <span className="recording-timer text-sm font-mono text-gray-500">
              {formatTime(recordingTime)}
            </span>

            {/* Waveform animation */}
            <div className="recording-wave flex items-center gap-0.5 ml-auto">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="recording-wave-bar"
                  style={{ animationDelay: `${i * 0.08}s` }}
                />
              ))}
            </div>
          </div>

          {/* Stop button */}
          <button
            type="button"
            onClick={stopRecording}
            className="p-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex-shrink-0"
            title={t("chatInput.stopRecord")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        </div>
      )}

      {/* ===== NORMAL INPUT STATE ===== */}
      {!isRecording && !isTranscribing && (
        <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
          {/* Attach button */}
          <button
            type="button"
            onClick={handleFileSelect}
            className="p-2 text-gray-400 hover:text-violet-500 hover:bg-violet-50 rounded-xl transition-colors shrink-0"
            title={t("chatInput.attachTip")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={t("chatInput.placeholder")}
            rows={1}
            className="chat-textarea flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 py-1.5 leading-relaxed"
            disabled={disabled}
          />

          {/* Mic button */}
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="p-2 text-gray-400 hover:text-violet-500 hover:bg-violet-50 rounded-xl transition-colors shrink-0"
            title={t("chatInput.micTip")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className={`p-2 rounded-xl transition-all shrink-0 ${
              canSend
                ? "bg-linear-to-r from-violet-500 to-purple-600 text-white shadow-md hover:shadow-lg send-btn-active"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
