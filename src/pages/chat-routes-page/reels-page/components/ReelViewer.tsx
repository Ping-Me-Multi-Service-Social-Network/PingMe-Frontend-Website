"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Share, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { Reel } from "@/types/reels";
import { cn } from "@/lib/utils";

interface ReelViewerProps {
  reel: Reel;
  isActive: boolean;
  onOpenComments: (reel: Reel) => void;
  onLikeToggle: (reel: Reel) => void;
  currentIndex: number;
  totalReels: number;
}

export function ReelViewer({
  reel,
  isActive,
  onOpenComments,
  onLikeToggle,
  currentIndex,
  totalReels,
}: ReelViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play();
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive]);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div
      className="relative w-full h-full bg-black flex items-center justify-center group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="w-full h-full object-cover cursor-pointer"
        onClick={handleVideoClick}
        loop
        playsInline
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

      {/* Top Info */}
      <div className="absolute top-0 left-0 right-0 p-6 text-white z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {reel.userAvatarUrl && (
              <img
                src={reel.userAvatarUrl || "/placeholder.svg"}
                alt={reel.userName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
            )}
            <div>
              <p className="font-semibold text-lg">{reel.userName}</p>
              <p className="text-sm text-gray-300">
                {formatDistanceToNow(new Date(reel.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </p>
            </div>
          </div>
          <button className="px-6 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition">
            Follow
          </button>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
        <div className="max-w-xs">
          {reel.caption && (
            <p className="text-sm mb-3 line-clamp-3">{reel.caption}</p>
          )}
          <p className="text-xs text-gray-300">Nhạc nền - {reel.userName}</p>
        </div>
      </div>

      {/* Right side actions */}
      <div
        className={cn(
          "absolute right-6 bottom-20 flex flex-col gap-6 z-20 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-90"
        )}
      >
        {/* Like button */}
        <button
          onClick={() => onLikeToggle(reel)}
          className="flex flex-col items-center gap-2 text-white hover:scale-110 transition"
        >
          <div
            className={cn(
              "p-3 rounded-full transition",
              reel.isLikedByMe
                ? "bg-red-500/30"
                : "bg-white/10 hover:bg-white/20"
            )}
          >
            <Heart
              className="w-6 h-6"
              fill={reel.isLikedByMe ? "currentColor" : "none"}
              color={reel.isLikedByMe ? "#ef4444" : "white"}
            />
          </div>
          <span className="text-xs font-semibold">
            {reel.likeCount > 1000
              ? (reel.likeCount / 1000).toFixed(1) + "K"
              : reel.likeCount}
          </span>
        </button>

        {/* Comment button */}
        <button
          onClick={() => onOpenComments(reel)}
          className="flex flex-col items-center gap-2 text-white hover:scale-110 transition"
        >
          <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold">
            {reel.commentCount > 1000
              ? (reel.commentCount / 1000).toFixed(1) + "K"
              : reel.commentCount}
          </span>
        </button>

        {/* Share button */}
        <button className="flex flex-col items-center gap-2 text-white hover:scale-110 transition">
          <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition">
            <Share className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold">596</span>
        </button>

        {/* Save button */}
        <button className="flex flex-col items-center gap-2 text-white hover:scale-110 transition">
          <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition">
            <Bookmark className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold">839</span>
        </button>
      </div>

      {/* Video counter */}
      <div className="absolute top-6 right-6 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-semibold">
        {currentIndex + 1} / {totalReels}
      </div>
    </div>
  );
}
