"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Edit2, Trash2, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reelsApi } from "@/services/reels";
import type { Reel } from "@/types/reels";
import { toast } from "sonner";
import { EditReelModal } from "../components/EditReelModal";
import { CreateReelModal } from "../components/CreateReelModal";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function VideoManagerPage() {
  const navigate = useNavigate();
  const currentUserId = useSelector((state: any) => state.auth.userSession?.id);
  const [userReels, setUserReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReel, setEditingReel] = useState<Reel | undefined>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUserReels = useCallback(async (page: number) => {
    if (!currentUserId) return;
    
    try {
      setIsLoading(true);
      const res = await reelsApi.getMyCreatedReels(page, 10);
      setUserReels(res.content);
      setCurrentPage(res.page);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("[v0] Error fetching user reels:", err);
      toast.error("Không thể tải danh sách video");
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchUserReels(0);
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
    fetchUserReels(currentPage);
    setEditingReel(undefined);
  };

  const handleCreateSuccess = () => {
    fetchUserReels(0);
    setShowCreateModal(false);
  };

  const handlePageChange = (newPage: number) => {
    fetchUserReels(newPage);
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
            onClick={() => navigate("/reels")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-semibold text-white">Quản lý Video</h1>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
        >
          <Plus className="w-5 h-5" />
          Tạo Video Mới
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
            <Button onClick={() => navigate("/reels")} className="mt-4">
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

      {/* Pagination */}
      {!isLoading && userReels.length > 0 && (
        <div className="flex items-center justify-center gap-2 p-6 border-t border-gray-700">
          <Button
            variant="outline"
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Trước
          </Button>
          <span className="text-gray-400">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage >= totalPages - 1}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Sau
          </Button>
        </div>
      )}

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
