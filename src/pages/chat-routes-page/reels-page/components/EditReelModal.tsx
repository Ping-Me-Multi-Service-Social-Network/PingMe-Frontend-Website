"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { reelsApi } from "@/services/reels";
import { toast } from "sonner";
import type { Reel } from "@/types/reels";

interface EditReelModalProps {
  isOpen: boolean;
  reel?: Reel;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditReelModal({
  isOpen,
  reel,
  onClose,
  onSuccess,
}: EditReelModalProps) {
  const [caption, setCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (reel) {
      setCaption(reel.caption || "");
    }
  }, [reel]);

  const handleSubmit = async () => {
    if (!reel || !caption.trim()) {
      toast.error("Caption không được trống");
      return;
    }

    setIsLoading(true);
    try {
      await reelsApi.updateReel(reel.id, {
        caption: caption.trim(),
      });
      toast.success("Cập nhật reel thành công");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.log("[v0] Update reel error:", error);
      toast.error("Không thể cập nhật reel");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !reel) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Chỉnh Sửa Reel</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Video Preview */}
          <div className="rounded-lg overflow-hidden bg-gray-100">
            <video
              src={reel.videoUrl}
              className="w-full h-40 object-cover"
              controls
            />
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Viết caption cho reel của bạn..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={4}
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">{caption.length}/300</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-transparent"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
