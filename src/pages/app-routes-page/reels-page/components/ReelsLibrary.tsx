import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { reelsApi } from "@/services/reels";
import type { Reel } from "@/types/reels";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Heart, Bookmark, Eye, Play, X } from "lucide-react";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import { formatRelativeTime } from "@/utils/dateFormatter.ts";

interface ReelsLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onReelClick?: (reel: Reel) => void;
}

const ReelThumbnail = ({
  reel,
  onClick,
  timestamp,
}: {
  reel: Reel;
  onClick?: () => void;
  timestamp?: string;
}) => {
  return (
    <div
      className="reel-thumb"
      onClick={onClick}
      style={{
        position: "relative",
        aspectRatio: "3/4",
        borderRadius: "8px",
        overflow: "hidden",
        cursor: "pointer",
        background: "var(--reel-surface, oklch(0.12 0.03 270))",
      }}
    >
      <video
        src={reel.videoUrl}
        className="reel-thumb__video"
        preload="metadata"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />

      {/* Bottom gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, oklch(0.06 0.02 270 / 0.85) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* Play overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "oklch(0.06 0.02 270 / 0.5)",
          opacity: 0,
          transition: "opacity 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
        className="reel-thumb__play-overlay"
      >
        <Play style={{ width: 40, height: 40, color: "white" }} fill="white" />
      </div>

      {/* Stats */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "0.5rem",
          color: "var(--reel-text-secondary, oklch(0.7 0.04 270))",
          fontSize: "0.6875rem",
          fontWeight: 600,
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Eye style={{ width: 12, height: 12 }} />
            {reel.viewCount}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Heart style={{ width: 12, height: 12 }} />
            {reel.likeCount}
          </span>
        </div>
        {timestamp && (
          <span style={{ fontSize: "0.625rem", color: "var(--reel-text-muted, oklch(0.5 0.03 270))" }}>
            {formatRelativeTime(timestamp)}
          </span>
        )}
      </div>

      {/* Hover style injected via CSS class */}
      <style>{`
        .reel-thumb:hover .reel-thumb__play-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
};

export function ReelsLibrary({ isOpen, onClose, onReelClick }: ReelsLibraryProps) {
  const { t } = useTranslation("reels");
  const [activeTab, setActiveTab] = useState<"likes" | "saves" | "views">("likes");
  const [likedReels, setLikedReels] = useState<Reel[]>([]);
  const [savedReels, setSavedReels] = useState<Reel[]>([]);
  const [viewedReels, setViewedReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const loadLibraryReels = async () => {
      setIsLoading(true);
      try {
        const [liked, saved, viewed] = await Promise.all([
          reelsApi.getUserLikedReels(0, 50),
          reelsApi.getUserSavedReels(0, 50),
          reelsApi.getUserViewedReels(0, 50),
        ]);
        setLikedReels(liked.content);
        setSavedReels(saved.content);
        setViewedReels(viewed.content);
      } catch (error) {
        console.log("[PingMe] Error loading library reels:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLibraryReels();
  }, [isOpen]);

  if (!isOpen) return null;

  const renderGrid = (reelsList: Reel[], emptyTitle: string, emptyDesc: string) => {
    if (reelsList.length === 0) {
      return (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <EmptyState title={emptyTitle} description={emptyDesc} />
        </div>
      );
    }
    return (
      <div style={{ padding: "1rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {reelsList.map((reel) => (
            <ReelThumbnail
              key={reel.id}
              reel={reel}
              timestamp={reel.createdAt}
              onClick={() => {
                onReelClick?.(reel);
                onClose();
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "oklch(0.06 0.02 270 / 0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--reel-surface, oklch(0.12 0.03 270))",
          border: "1px solid var(--reel-border, oklch(0.2 0.04 270))",
          borderRadius: "1rem",
          width: "80vw",
          height: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--reel-border, oklch(0.2 0.04 270))",
          }}
        >
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--reel-text-primary, oklch(0.96 0.01 270))",
            }}
          >
            {t("library.title")}
          </h2>
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2rem",
              height: "2rem",
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              color: "var(--reel-text-secondary, oklch(0.7 0.04 270))",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LoadingSpinner />
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "likes" | "saves" | "views")}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList
              className="w-full rounded-none flex-shrink-0"
              style={{
                background: "var(--reel-bg, oklch(0.06 0.02 270))",
                borderBottom: "1px solid var(--reel-border, oklch(0.2 0.04 270))",
              }}
            >
              <TabsTrigger
                value="likes"
                className="flex items-center gap-2 flex-1 font-bold"
                style={{ color: "var(--reel-text-secondary)" }}
              >
                <Heart className="w-4 h-4" />
                {t("library.tabs.likes")} ({likedReels.length})
              </TabsTrigger>
              <TabsTrigger
                value="saves"
                className="flex items-center gap-2 flex-1 font-bold"
                style={{ color: "var(--reel-text-secondary)" }}
              >
                <Bookmark className="w-4 h-4" />
                {t("library.tabs.saves")} ({savedReels.length})
              </TabsTrigger>
              <TabsTrigger
                value="views"
                className="flex items-center gap-2 flex-1 font-bold"
                style={{ color: "var(--reel-text-secondary)" }}
              >
                <Eye className="w-4 h-4" />
                {t("library.tabs.views")} ({viewedReels.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="likes" className="m-0 flex-1 overflow-y-auto">
              {renderGrid(likedReels, t("library.emptyLikes"), t("library.emptyLikesDesc"))}
            </TabsContent>

            <TabsContent value="saves" className="m-0 flex-1 overflow-y-auto">
              {renderGrid(savedReels, t("library.emptySaves"), t("library.emptySavesDesc"))}
            </TabsContent>

            <TabsContent value="views" className="m-0 flex-1 overflow-y-auto">
              {renderGrid(viewedReels, t("library.emptyViews"), t("library.emptyViewsDesc"))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
