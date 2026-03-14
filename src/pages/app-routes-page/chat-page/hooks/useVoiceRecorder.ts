import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { audioTranscribeService } from "@/services/ai/audio-transcribe";

const MAX_RECORD_DURATION = 90; // 1 phút 30 giây

interface UseVoiceRecorderOptions {
  onTranscribed: (text: string) => void;
}

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  recordingTime: number;
  isTranscribing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  formatTime: (seconds: number) => string;
}

export function useVoiceRecorder({
  onTranscribed,
}: UseVoiceRecorderOptions): UseVoiceRecorderReturn {
  const { t } = useTranslation("chat");

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
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

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  const startRecording = useCallback(async () => {
    try {
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

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      recordTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      toast.error(t("input.micError"));
    }
  }, [t]);

  const stopRecording = useCallback(async () => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state === "inactive"
    )
      return;

    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    setIsRecording(false);

    await new Promise<void>((resolve) => {
      const recorder = mediaRecorderRef.current!;
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    chunksRef.current = [];

    if (blob.size === 0) {
      toast.error(t("input.recordError"));
      return;
    }

    const file = new File([blob], `recording-${Date.now()}.webm`, {
      type: "audio/webm",
    });

    setIsTranscribing(true);
    try {
      const res = await audioTranscribeService.transcribeAudio(file);
      const transcribedText = res.data.data.content;
      if (transcribedText && transcribedText.trim()) {
        onTranscribed(transcribedText.trim());
      }
    } catch {
      toast.error(t("input.transcribeError"));
    } finally {
      setIsTranscribing(false);
    }
  }, [t, onTranscribed]);

  const cancelRecording = useCallback(() => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    chunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  return {
    isRecording,
    recordingTime,
    isTranscribing,
    startRecording,
    stopRecording,
    cancelRecording,
    formatTime,
  };
}
