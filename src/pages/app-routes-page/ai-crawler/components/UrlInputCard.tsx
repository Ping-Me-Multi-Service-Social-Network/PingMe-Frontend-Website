import { useState } from "react";
import { Bug, Globe, ArrowRight, AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface UrlInputCardProps {
  onStart: (url: string) => void;
  loading: boolean;
  error: string | null;
}

export default function UrlInputCard({ onStart, loading, error }: UrlInputCardProps) {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { t } = useLanguage("ai-crawler");

  const validateUrl = (value: string): boolean => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();

    if (!trimmed || !validateUrl(trimmed)) {
      setValidationError(t("urlInput.invalidUrl"));
      return;
    }

    setValidationError(null);
    onStart(trimmed);
  };

  const displayError = validationError || error;

  return (
    <div className="flex items-center justify-center h-full p-6 crawler-enter">
      <div className="w-full max-w-lg">
        {/* Icon + Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-purple-100 mb-5 crawler-card-glow">
            <Bug className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t("urlInput.title")}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
            {t("urlInput.subtitle")}
          </p>
        </div>

        {/* Input Card */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-lg border border-purple-100/50 p-6 crawler-card-glow">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400">
                <Globe className="w-5 h-5" />
              </div>
              <input
                id="ai-crawler-url-input"
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder={t("urlInput.placeholder")}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 
                  focus:border-purple-400 focus:ring-2 focus:ring-purple-100 
                  outline-none transition-all text-sm bg-gray-50/50
                  placeholder:text-gray-400"
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Error */}
            {displayError && (
              <div className="mt-3 flex items-start gap-2 text-red-500 text-xs crawler-enter">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{displayError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="ai-crawler-start-btn"
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full mt-4 py-3.5 rounded-xl font-semibold text-sm
                bg-purple-600 text-white
                hover:bg-purple-700 active:bg-purple-800
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("urlInput.starting")}
                </>
              ) : (
                <>
                  {t("urlInput.startButton")}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
