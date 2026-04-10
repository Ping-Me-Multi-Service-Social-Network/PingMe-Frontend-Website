import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { reelsApi } from "@/services/reels";
import type { Reel } from "@/types/reels";
import { toast } from "sonner";
import { EditReelModal } from "./EditReelModal.tsx";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import { useTranslation } from "react-i18next";
import { ReelManagerCard } from "./ReelManagerCard.tsx";

interface VideoManagerProps {
  onClose: () => void;
  onUpdate?: () => void;
}

export function VideoManager({ onClose, onUpdate }: VideoManagerProps) {
  const { t } = useTranslation("reels");
  const [userReels, setUserReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReel, setEditingReel] = useState<Reel | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUserReels = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await reelsApi.getUserReels(0, 50);
      setUserReels(res.content);
    } catch (err) {
      console.error("[VideoManager] Error fetching user reels:", err);
      toast.error(t("manage.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUserReels();
  }, [fetchUserReels]);

  const handleDelete = async (reelId: number) => {
    setIsDeleting(true);
    try {
      await reelsApi.deleteReel(reelId);
      setUserReels((prev) => prev.filter((r) => r.id !== reelId));
      setShowDeleteConfirm(null);
      toast.success(t("manage.deleteSuccess"));
    } catch (err) {
      console.error("[VideoManager] Error deleting reel:", err);
      toast.error(t("manage.deleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    fetchUserReels();
    setEditingReel(undefined);
    onUpdate?.();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-semibold text-white">{t("manage.title")}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
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
              <Button onClick={onClose} className="mt-4">
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
      </div>

      {/* Edit Modal */}
      {editingReel && (
        <EditReelModal
          isOpen={!!editingReel}
          reel={editingReel}
          onClose={() => setEditingReel(undefined)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
