import { Bug, CheckCircle2, AlertCircle, RotateCw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface CrawlProgressProps {
  status: "crawling" | "success" | "failed";
  pagesCrawled: number;
  totalPages: number;
  error?: string | null;
  onRecrawl?: () => void;
  recrawling?: boolean;
}

export default function CrawlProgress({
  status,
  pagesCrawled,
  totalPages,
  error,
  onRecrawl,
  recrawling,
}: CrawlProgressProps) {
  const { t } = useLanguage("ai-crawler");

  const percentage = totalPages > 0 ? Math.round((pagesCrawled / totalPages) * 100) : 0;

  return (
    <div className="flex items-center justify-center h-full p-6 crawler-enter">
      <div className="w-full max-w-md text-center">
        {/* Status Icon */}
        <div className="mb-6">
          {status === "crawling" && (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-purple-100">
              <Bug className="w-10 h-10 text-purple-600 spider-crawl" />
            </div>
          )}
          {status === "success" && (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-green-100">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          )}
          {status === "failed" && (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-100">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {status === "crawling" && t("progress.title")}
          {status === "success" && t("progress.success")}
          {status === "failed" && t("progress.error")}
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 mb-6">
          {status === "crawling" && t("progress.pleaseWait")}
          {status === "failed" && error}
        </p>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="crawl-progress-bar h-3 bg-gray-100 rounded-full">
            <div
              className="crawl-progress-fill h-full"
              style={{ width: `${status === "success" ? 100 : percentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-3">
          {status === "crawling" && <div className="crawl-status-dot" />}
          {status === "success" && <div className="crawl-status-dot-success" />}
          {status === "failed" && <div className="crawl-status-dot-error" />}
          <span className="text-sm font-medium text-gray-600">
            {t("progress.pagesCrawled", {
              crawled: pagesCrawled,
              total: totalPages,
            })}
          </span>
        </div>

        {status === "success" && (
          <p className="mt-4 text-sm text-green-600 font-medium crawler-enter">
            ✓ {t("progress.success")}
          </p>
        )}

        {status === "failed" && onRecrawl && (
          <button
            onClick={onRecrawl}
            disabled={recrawling}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-purple-600 text-white text-sm font-semibold
              hover:bg-purple-700 active:bg-purple-800
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 crawler-enter"
          >
            <RotateCw className={`w-4 h-4 ${recrawling ? "animate-spin" : ""}`} />
            {recrawling ? t("chat.recrawling") : t("chat.recrawl")}
          </button>
        )}
      </div>
    </div>
  );
}
