import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { reelsApi } from "@/services/reels";
import type { Reel } from "@/types/reels";
import { toast } from "sonner";
import { EditReelModal } from "../components/EditReelModal.tsx";
import { CreateReelModal } from "../components/CreateReelModal.tsx";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ReelManagerCard } from "../components/ReelManagerCard.tsx";

export default function VideoManagerPage() {
  const { t } = useTranslation("reels");
  const navigate = useNavigate();
  const currentUserId = useSelector((state: any) => state.auth.userSession?.id);
  const [userReels, setUserReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReel, setEditingReel] = useState<Reel | undefined>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchUserReels = useCallback(
    async (page: number, append = false) => {
      if (!currentUserId) return;

      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        const res = await reelsApi.getMyCreatedReels(page, 10);

        if (append) {
          setUserReels((prev) => [...prev, ...res.content]);
        } else {
          setUserReels(res.content);
        }

        setCurrentPage(res.page);
        setHasMore(res.hasMore);
      } catch (err) {
        console.error("[v0] Error fetching user reels:", err);
        toast.error(t("manage.loadError"));
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [currentUserId],
  );

  useEffect(() => {
    fetchUserReels(0);
  }, [fetchUserReels]);

  const handleDelete = async (reelId: number) => {
    setIsDeleting(true);
    try {
      await reelsApi.deleteReel(reelId);
      setUserReels((prev) => prev.filter((r) => r.id !== reelId));
      setShowDeleteConfirm(null);
      toast.success(t("manage.deleteSuccess"));
    } catch (err) {
      console.error("[v0] Error deleting reel:", err);
      toast.error(t("manage.deleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    fetchUserReels(0, false);
    setEditingReel(undefined);
  };

  const handleCreateSuccess = () => {
    fetchUserReels(0, false);
    setShowCreateModal(false);
  };

  const handleLoadMore = () => {
    fetchUserReels(currentPage + 1, true);
  };

  return (
    <div className="w-full bg-gray-900 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800"
            onClick={() => navigate("/app/reels")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-semibold text-white">{t("manage.title")}</h1>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
        >
          <Plus className="w-5 h-5" />
          {t("create.createVideo")}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : userReels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-gray-400">{t("manage.empty")}</p>
            <Button onClick={() => navigate("/app/reels")} className="mt-4">
              {t("manage.back")}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {userReels.map((reel) => (
              <ReelManagerCard
                key={reel.id}
                reel={reel}
                onEdit={setEditingReel}
                onDelete={(id) => setShowDeleteConfirm(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {!isLoading && userReels.length > 0 && hasMore && (
        <div className="flex items-center justify-center p-6 border-t border-gray-700">
          <Button
            variant="outline"
            disabled={isLoadingMore}
            onClick={handleLoadMore}
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
          >
            {isLoadingMore ? t("comments.loading") || t("search.searching") : t("manage.loadMore")}
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="border-t border-gray-700 p-6 bg-gray-800">
          <p className="text-white mb-4">{t("manage.deleteConfirm")}</p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(null)}
              disabled={isDeleting}
              className="flex-1"
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(showDeleteConfirm)}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? t("common.deleting") : t("common.delete")}
            </Button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingReel && (
        <EditReelModal
          isOpen={!!editingReel}
          reel={editingReel}
          onClose={() => setEditingReel(undefined)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateReelModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}
