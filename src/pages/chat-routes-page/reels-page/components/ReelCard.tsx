"use client";

import type React from "react";
import { useState } from "react";
import { Heart, MessageCircle, Share2, User, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Reel } from "@/types/reels";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { reelsApi } from "@/services/reels";

interface ReelCardProps {
  reel: Reel;
  isSelected?: boolean;
  onUpdate?: (reel: Reel) => void;
}

export default function ReelCard({
  reel,
  // isSelected = false,
  onUpdate,
}: ReelCardProps) {
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiking(true);
    try {
      const updated = await reelsApi.toggleLike(reel.id);
      if (onUpdate) {
        onUpdate({
          ...reel,
          isLikedByMe: updated.isLikedByMe,
          likeCount: updated.likeCount,
        });
      }
    } catch (err) {
      console.error("[v0] Error toggling like:", err);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {reel.userAvatarUrl ? (
            <img
              src={reel.userAvatarUrl || "/placeholder.svg"}
              alt={reel.userName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* User Info */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {reel.userName}
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(reel.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          {/* Caption Preview */}
          <p className="text-xs text-gray-700 mt-1 line-clamp-2">
            {reel.caption}
          </p>

          {/* Thumbnail */}
          <div className="mt-2 rounded-md overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
            <video
              src={reel.videoUrl}
              className="w-full h-full object-cover"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500 px-1">
            <div className="flex gap-3">
              <span>{reel.viewCount} lượt xem</span>
              <span>{reel.commentCount} bình luận</span>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-8 gap-1 text-gray-600 hover:text-red-600 text-xs"
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart
                className={`w-4 h-4 ${
                  reel.isLikedByMe ? "fill-red-600 text-red-600" : ""
                }`}
              />
              <span>{reel.likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-8 gap-1 text-gray-600 hover:text-blue-600 text-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{reel.commentCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-8 gap-1 text-gray-600 hover:text-green-600 text-xs"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
