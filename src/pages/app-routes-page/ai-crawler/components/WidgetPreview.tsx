import { ImageOff } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { CrawlWidget, CrawlWidgetProduct } from "@/types/ai-crawler/crawlRoom";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useState } from "react";

SyntaxHighlighter.registerLanguage("json", json);

interface WidgetPreviewProps {
  widget: CrawlWidget | null;
}

function ProductCard({ item }: { item: CrawlWidgetProduct }) {
  const { t } = useLanguage("ai-crawler");
  const displayName = item.name || item.title || "—";
  const [imgError, setImgError] = useState(false);

  return (
    <div className="widget-card bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {item.image_url && !imgError ? (
        <img
          src={item.image_url}
          alt={displayName}
          className="widget-card-img"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div className="widget-card-img-placeholder">
          <div className="flex flex-col items-center gap-1">
            <ImageOff className="w-6 h-6" />
            <span className="text-xs">{t("widget.noImage")}</span>
          </div>
        </div>
      )}
      <div className="p-3">
        <h4 className="text-sm font-semibold text-gray-800 truncate" title={displayName}>
          {displayName}
        </h4>
        {item.price && (
          <p className="text-sm font-medium text-purple-600 mt-1">{item.price}</p>
        )}
      </div>
    </div>
  );
}

export default function WidgetPreview({ widget }: WidgetPreviewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "json">("preview");
  const { t } = useLanguage("ai-crawler");

  if (!widget) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm p-6">
        <p>{t("widget.emptyState")}</p>
      </div>
    );
  }

  const items = widget.products || widget.items || [];

  return (
    <div className="flex flex-col h-full crawler-enter">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-3 border-b border-gray-100">
        <button
          className={`crawler-tab px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "preview" ? "crawler-tab-active" : "crawler-tab-inactive"
          }`}
          onClick={() => setActiveTab("preview")}
        >
          {t("widget.previewTab")}
        </button>
        <button
          className={`crawler-tab px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "json" ? "crawler-tab-active" : "crawler-tab-inactive"
          }`}
          onClick={() => setActiveTab("json")}
        >
          {t("widget.jsonTab")}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 crawler-chat-scroll">
        {activeTab === "preview" ? (
          <div>
            {/* Widget Header */}
            {(widget.title || widget.description) && (
              <div className="mb-4">
                {widget.title && (
                  <h3 className="text-lg font-bold text-gray-800">{widget.title}</h3>
                )}
                {widget.description && (
                  <p className="text-sm text-gray-500 mt-1">{widget.description}</p>
                )}
              </div>
            )}

            {/* Product / Item Grid */}
            {items.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item, idx) => (
                  <ProductCard key={idx} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm py-8">
                {t("widget.emptyState")}
              </div>
            )}
          </div>
        ) : (
          <div className="crawler-json-view">
            <SyntaxHighlighter
              language="json"
              style={atomOneDark}
              customStyle={{
                borderRadius: "8px",
                padding: "16px",
                fontSize: "13px",
                margin: 0,
              }}
            >
              {JSON.stringify(widget, null, 2)}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
}
