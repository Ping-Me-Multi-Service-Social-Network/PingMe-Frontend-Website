"use client";

import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reelsApi } from "@/services/reels";
import type { Reel } from "@/types/reels";
import { toast } from "sonner";
import { EditReelModal } from "./EditReelModal";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface VideoManagerProps {
  onClose: () => void;
  onUpdate?: () => void;
}

export function VideoManager({ onClose, onUpdate }: VideoManagerProps) {
  const [userReels, setUserReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReel, setEditingReel] = useState<Reel | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUserReels = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await reelsApi.getUserReels(0, 50);
      setUserReels(res.content);
    } catch (err) {
      console.error("[v0] Error fetching user reels:", err);
      toast.error("Không thể tải danh sách video");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserReels();
  }, [fetchUserReels]);

  const handleDelete = async (reelId: number) => {
    setIsDeleting(true);
    try {
      await reelsApi.deleteReel(reelId);
      setUserReels((prev) => prev.filter((r) => r.id !== reelId));
      setShowDeleteConfirm(null);
      toast.success("Xóa video thành công");
    } catch (err) {
      console.error("[v0] Error deleting reel:", err);
      toast.error("Không thể xóa video");
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
          <h2 className="text-2xl font-semibold text-white">Quản lý Video</h2>
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
              <p className="text-gray-400">Chưa có video nào</p>
              <Button onClick={onClose} className="mt-4">
                Quay lại
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {userReels.map((reel) => (
                <div
                  key={reel.id}
                  className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition group"
                >
                  {/* Video Thumbnail */}
                  <div className="flex-shrink-0 w-24 h-24 bg-gray-900 rounded-lg overflow-hidden">
                    <video
                      src={reel.videoUrl}
                      className="w-full h-full object-cover"
                      onMouseEnter={(e) => {
                        const video = e.target as HTMLVideoElement;
                        video.play();
                      }}
                      onMouseLeave={(e) => {
                        const video = e.target as HTMLVideoElement;
                        video.pause();
                        video.currentTime = 0;
                      }}
                    />
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">
                      {reel.caption || "Không có tiêu đề"}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Lượt xem:{" "}
                      <span className="font-semibold">{reel.viewCount}</span>
                    </p>
                    <p className="text-sm text-gray-400">
                      Yêu thích:{" "}
                      <span className="font-semibold">{reel.likeCount}</span> •
                      Bình luận:{" "}
                      <span className="font-semibold">{reel.commentCount}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(reel.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-500 text-blue-400 hover:bg-blue-500/20 bg-transparent"
                      onClick={() => setEditingReel(reel)}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500/20 bg-transparent"
                      onClick={() => setShowDeleteConfirm(reel.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="border-t border-gray-700 p-6 bg-gray-800">
            <p className="text-white mb-4">Bạn có chắc muốn xóa video này?</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={isDeleting}
                className="flex-1"
              >
                {isDeleting ? "Đang xóa..." : "Xóa"}
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
