import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ReelsTopBar } from "./components/ReelTopBar.tsx";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import ReelDetailView from "./components/ReelDetailView.tsx";
import { CreateReelModal } from "./components/CreateReelModal.tsx";
import { EditReelModal } from "./components/EditReelModal.tsx";
import type { Reel } from "@/types/reels";
import { reelsApi } from "@/services/reels";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import { useNavigate } from "react-router-dom";
import { useReelNavigation } from "@/hooks/useReelNavigation";
import "./reels.css";

export default function ReelsPage() {
  const { t } = useTranslation("reels");
  const navigate = useNavigate();

  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    hasMore: true,
    isLoadingMore: false,
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedReel, setSelectedReel] = useState<Reel | undefined>();
  const [searchResults, setSearchResults] = useState<Reel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState<string>("");

  const fetchReels = useCallback(
    async (page: number, size: number, append = false) => {
      try {
        if (!append) setIsFetching(true);
        else setPagination((prev) => ({ ...prev, isLoadingMore: true }));

        const res = await reelsApi.getReelFeed(page, size);

        setReels((prev) => {
          if (append) return [...prev, ...res.content];
          return res.content;
        });

        setPagination({
          currentPage: res.page,
          totalPages: res.totalPages,
          hasMore: res.hasMore,
          isLoadingMore: false,
        });
      } catch (err) {
        console.error("[PingMe] Error fetching reels:", getErrorMessage(err));
      } finally {
        setIsFetching(false);
        setPagination((prev) => ({ ...prev, isLoadingMore: false }));
      }
    },
    [],
  );

  useEffect(() => {
    fetchReels(0, 10);
  }, [fetchReels]);

  const { containerRef } = useReelNavigation({
    setCurrentIndex,
    totalItems: isSearching ? searchResults.length : reels.length,
    onReachEnd: () => {
      if (pagination.hasMore && !pagination.isLoadingMore) {
        fetchReels(pagination.currentPage + 1, 10, true);
      }
    },
    offset: 3,
  });

  const handleReelUpdate = (updatedReel: Reel) => {
    setReels((prev) =>
      prev.map((reel) => (reel.id === updatedReel.id ? updatedReel : reel)),
    );
  };

  const handleReelDeleted = (reelId: number) => {
    setReels((prev) => prev.filter((reel) => reel.id !== reelId));
    if (currentIndex >= reels.length - 1) {
      setCurrentIndex(Math.max(0, reels.length - 2));
    }
  };

  const handleReelEdit = (reel: Reel) => {
    setSelectedReel(reel);
    setIsEditOpen(true);
  };

  const handleManageClick = () => {
    navigate("/app/reels/video-manager");
  };

  const handleSearchResults = useCallback((results: Reel[]) => {
    setSearchResults(results);
  }, []);

  const handleSearchChange = useCallback((searching: boolean) => {
    setIsSearching(searching);
  }, []);

  const handleReelClick = (reel: Reel) => {
    if (isSearching && searchResults.length > 0) {
      const index = searchResults.findIndex((r) => r.id === reel.id);
      if (index !== -1) {
        setCurrentIndex(index);
        return;
      }
    }

    const index = reels.findIndex((r) => r.id === reel.id);
    if (index !== -1) {
      if (isSearching) {
        setIsSearching(false);
        setSearchResults([]);
      }
      setCurrentIndex(index);
    } else {
      setReels((prev) => [reel, ...prev]);
      setCurrentIndex(0);
      if (isSearching) {
        setIsSearching(false);
        setSearchResults([]);
      }
    }
  };

  const handleHashtagClick = (hashtag: string) => {
    setSearchTrigger(`#${hashtag}`);
    setTimeout(() => setSearchTrigger(""), 100);
  };

  const displayReels = isSearching ? searchResults : reels;

  return (
    <div ref={containerRef} className="reels-shell">
      <ReelsTopBar
        onManageClick={handleManageClick}
        onSearchResults={handleSearchResults}
        onSearchChange={handleSearchChange}
        onReelClick={handleReelClick}
        triggerSearch={searchTrigger}
      />

      {/* Full-Screen Reels Feed */}
      <div className="reels-feed">
        {isFetching && reels.length === 0 ? (
          <div className="reels-center">
            <LoadingSpinner />
          </div>
        ) : reels.length === 0 ? (
          <div className="reels-center">
            <EmptyState
              title={t("feed.empty")}
              description={t("feed.emptyDesc")}
            />
          </div>
        ) : (
          <div
            className="reels-feed__slider"
            style={{
              transform: `translateY(-${currentIndex * 100}%)`,
              transition:
                "transform 420ms cubic-bezier(0.22, 0.8, 0.24, 1)",
            }}
          >
            {displayReels.map((r, i) => (
              <div key={r.id} style={{ height: "100%", width: "100%" }}>
                <ReelDetailView
                  reel={r}
                  isActive={i === currentIndex}
                  onUpdate={handleReelUpdate}
                  onDelete={handleReelDeleted}
                  onEdit={handleReelEdit}
                  onHashtagClick={handleHashtagClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateReelModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchReels(0, 10)}
      />

      <EditReelModal
        isOpen={isEditOpen}
        reel={selectedReel}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedReel(undefined);
        }}
        onSuccess={() => fetchReels(0, 10)}
      />
    </div>
  );
}
