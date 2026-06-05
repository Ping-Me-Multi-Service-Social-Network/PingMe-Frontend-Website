import { useState, useEffect, useRef, useCallback } from "react";
import { aiCrawlerService } from "@/services/ai/ai-crawler";
import type { CrawlWidget } from "@/types/ai-crawler/crawlRoom";
import UrlInputCard from "./components/UrlInputCard";
import CrawlProgress from "./components/CrawlProgress";
import ChatPanel, { type ChatMessage } from "./components/ChatPanel";
import WidgetPreview from "./components/WidgetPreview";
import "./ai-crawler.css";

type Phase = "input" | "crawling" | "ready";

const POLL_INTERVAL = 2000;

export default function AICrawlerPage() {
  // --- Core state ---
  const [phase, setPhase] = useState<Phase>("input");
  const [roomId, setRoomId] = useState<number | null>(null);
  const [crawlStatus, setCrawlStatus] = useState<"crawling" | "success" | "failed">("crawling");
  const [pagesCrawled, setPagesCrawled] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // --- Chat state ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<CrawlWidget | null>(null);
  const [sending, setSending] = useState(false);
  const [recrawling, setRecrawling] = useState(false);

  // --- Error & loading ---
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  // --- Polling ref ---
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Cleanup polling on unmount ---
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // --- Start polling ---
  const startPolling = useCallback((id: number) => {
    // Clear existing
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(async () => {
      try {
        const status = await aiCrawlerService.getStatus(id);
        setPagesCrawled(status.pages_crawled);
        setTotalPages(status.total_pages);
        setCrawlStatus(status.status);

        if (status.status === "success" || status.status === "failed") {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }

          if (status.status === "success") {
            setError(null);
            // Small delay so the user sees 100% before switching
            setTimeout(() => setPhase("ready"), 800);
          } else {
            setError(
              status.error_message ||
              "Crawler thất bại, vui lòng thử URL khác hoặc cào lại."
            );
          }
        }
      } catch (err) {
        console.error("[AICrawler] Polling error:", err);
        // Don't stop polling on transient errors
      }
    }, POLL_INTERVAL);
  }, []);

  // --- Handle start crawl ---
  const handleStartCrawl = useCallback(async (url: string) => {
    setStarting(true);
    setError(null);

    try {
      const result = await aiCrawlerService.createRoom(url);
      setRoomId(result.room_id);
      setCrawlStatus("crawling");
      setPagesCrawled(0);
      setTotalPages(0);
      setPhase("crawling");
      startPolling(result.room_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setStarting(false);
    }
  }, [startPolling]);

  // --- Handle send chat query ---
  const handleSendQuery = useCallback(async (query: string) => {
    if (!roomId || sending) return;

    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content: query }]);

    try {
      const result = await aiCrawlerService.chat(roomId, query);

      const widget = result.widget;
      setSelectedWidget(widget);

      // Build a descriptive AI message
      const items = widget.products || widget.items || [];
      const desc = widget.title
        ? `${widget.title}${widget.description ? ` — ${widget.description}` : ""}`
        : widget.description || `Found ${items.length} items`;

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: desc, widget },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: err instanceof Error ? err.message : "An error occurred",
        },
      ]);
    } finally {
      setSending(false);
    }
  }, [roomId, sending]);

  // --- Handle recrawl ---
  const handleRecrawl = useCallback(async () => {
    if (!roomId || recrawling) return;

    setRecrawling(true);
    setError(null);

    try {
      await aiCrawlerService.recrawl(roomId);

      // Reset to crawling phase
      setCrawlStatus("crawling");
      setPagesCrawled(0);
      setTotalPages(0);
      setPhase("crawling");
      startPolling(roomId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setRecrawling(false);
    }
  }, [roomId, recrawling, startPolling]);

  // --- Handle widget selection from chat ---
  const handleSelectWidget = useCallback((widget: CrawlWidget) => {
    setSelectedWidget(widget);
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden bg-gray-50/50">
      {/* Phase 1: URL Input */}
      {phase === "input" && (
        <div className="flex-1">
          <UrlInputCard
            onStart={handleStartCrawl}
            loading={starting}
            error={error}
          />
        </div>
      )}

      {/* Phase 2: Crawling Progress */}
      {phase === "crawling" && (
        <div className="flex-1">
          <CrawlProgress
            status={crawlStatus}
            pagesCrawled={pagesCrawled}
            totalPages={totalPages}
            error={error}
            onRecrawl={handleRecrawl}
            recrawling={recrawling}
          />
        </div>
      )}

      {/* Phase 3: Chat + Widget Preview */}
      {phase === "ready" && (
        <>
          {/* Left: Chat Panel */}
          <div className="w-[400px] min-w-[340px] border-r border-gray-200 bg-white flex flex-col">
            <ChatPanel
              messages={messages}
              onSend={handleSendQuery}
              onRecrawl={handleRecrawl}
              disabled={crawlStatus !== "success"}
              sending={sending}
              recrawling={recrawling}
              onSelectWidget={handleSelectWidget}
            />
          </div>

          {/* Right: Widget Preview */}
          <div className="flex-1 bg-white flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">
                {selectedWidget ? (selectedWidget.title || "Widget Preview") : "Widget Preview"}
              </h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <WidgetPreview widget={selectedWidget} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
