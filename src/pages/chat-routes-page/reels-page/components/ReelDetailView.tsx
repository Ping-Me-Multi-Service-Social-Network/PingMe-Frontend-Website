import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  User,
  Bookmark,
  BookMarked,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Reel, ReelComment } from "@/types/reels";
import { reelsApi } from "@/services/reels";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import CommentsModal from "./CommentsModal";
import { useAppSelector } from "@/features/hooks";

interface ReelDetailViewProps {
  reel: Reel;
  onUpdate?: (reel: Reel) => void;
  onDelete?: (reelId: number) => void;
  onEdit?: (reel: Reel) => void;
  onHashtagClick?: (hashtag: string) => void;
}

export default function ReelDetailView({
  reel,
  onUpdate,
  onDelete,
  isActive,
  togglePlaySignal,
  onHashtagClick,
}: ReelDetailViewProps & { isActive?: boolean; togglePlaySignal?: number }) {
  const currentUserId = useAppSelector((state) => state.auth.userSession.id);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  const [isSavedByMe, setIsSavedByMe] = useState(reel.isSavedByMe || false);
  const [isTogglingSave, setIsTogglingSave] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleLike = async () => {
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

  const handleToggleSave = async () => {
    setIsTogglingSave(true);
    try {
      const result = await reelsApi.toggleSave(reel.id);
      setIsSavedByMe(result.isSavedByMe);
      if (onUpdate) {
        onUpdate({
          ...reel,
          isSavedByMe: result.isSavedByMe,
        });
      }
    } catch (err) {
      console.error("[v0] Error toggling save:", err);
    } finally {
      setIsTogglingSave(false);
    }
  };

  const handleLoadComments = async () => {
    if (comments.length === 0 && !isLoadingComments) {
      setIsLoadingComments(true);
      try {
        const res = await reelsApi.getComments(reel.id, 0, 20);
        setComments(res.content);
      } catch (err) {
        console.error("[v0] Error loading comments:", err);
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowComments(true);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const newComment = await reelsApi.createComment(reel.id, {
        content: commentText,
      });
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");

      if (onUpdate) {
        onUpdate({
          ...reel,
          commentCount: reel.commentCount + 1,
        });
      }
    } catch (err) {
      console.error("[v0] Error submitting comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await reelsApi.deleteReel(reel.id);
      toast.success("Xóa reel thành công");
      onDelete?.(reel.id);
    } catch (err) {
      console.error("[v0] Error deleting reel:", err);
      toast.error("Không thể xóa reel");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleVideoDoubleClickModified = () => {
    // Clear single click timeout since this is a double click
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }

    handleLike();
  };

  const handleVideoClick = () => {
    // Clear any existing timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }

    // Set a timeout to detect single click (not double click)
    const timeout = setTimeout(() => {
      handlePlayPause();
      setClickTimeout(null);
    }, 250); // Wait 250ms to see if it's a double click

    setClickTimeout(timeout);
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSpeedChange = () => {
    if (!videoRef.current) return;
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleStop = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.pause();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {});
      reelsApi
        .incrementViewCount(reel.id)
        .catch((err) => console.error("[v0] Error incrementing views:", err));
    } else {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        // Ignore errors on setting currentTime
      }
      setIsPlaying(false);
    }
  }, [reel.id, isActive]);

  // Respond to global togglePlaySignal: toggle play/pause for the active reel
  useEffect(() => {
    if (typeof togglePlaySignal === "undefined") return;
    if (!isActive) return;
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [togglePlaySignal, isActive]);

  return (
    <div className="relative w-full h-full flex bg-gray-900">
      {/* Video Section - Full Screen */}
      <div className="flex-1 flex items-center justify-center group relative">
        {/* 
          CHỈ THÊM wrapper này để timeline bám đúng bề ngang video.
          Mọi UI khác giữ nguyên vị trí như cũ.
        */}
        <div
          className="relative inline-block h-full w-auto max-w-full max-h-[90vh]"
          onMouseEnter={() => setIsVideoHovered(true)}
          onMouseLeave={() => setIsVideoHovered(false)}
        >
          <video
            ref={videoRef}
            src={reel.videoUrl}
            className="max-h-full w-auto max-w-full object-contain cursor-pointer"
            onDoubleClick={handleVideoDoubleClickModified}
            onClick={handleVideoClick}
            controlsList="nodownload"
            loop
            onTimeUpdate={(e) =>
              setCurrentTime((e.target as HTMLVideoElement).currentTime)
            }
            onLoadedMetadata={(e) =>
              setDuration((e.target as HTMLVideoElement).duration)
            }
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          <div
            className={`absolute bottom-2 left-2 right-2 transition-opacity z-10 ${
              isVideoHovered
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Progress Bar */}
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => handleSeek(Number.parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gray-600 rounded cursor-pointer accent-red-600"
              />
              <span className="text-xs text-white font-semibold whitespace-nowrap">
                {Math.floor(currentTime)}s / {Math.floor(duration)}s
              </span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20 p-0"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20 p-0"
                onClick={handleMuteToggle}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs text-white hover:bg-white/20"
                onClick={handleSpeedChange}
              >
                {playbackSpeed}x
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs text-white hover:bg-white/20"
                onClick={handleStop}
              >
                Stop
              </Button>
            </div>
          </div>
        </div>

        {/* Top Info - GIỮ NGUYÊN như cũ */}
        <div className="absolute top-6 left-6 flex items-center justify-between w-full pr-6 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            {reel.userAvatarUrl ? (
              <img
                src={reel.userAvatarUrl || "/placeholder.svg"}
                alt={reel.userName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-2 border-white">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <p className="font-semibold text-white">{reel.userName}</p>
              <p className="text-xs text-gray-200">
                {formatDistanceToNow(new Date(reel.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Xóa Reel?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Bạn có chắc muốn xóa reel này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? "Đang xóa..." : "Xóa"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Caption and Content Info - GIẮ NGUYÊN như cũ */}
        <div className="absolute top-22 left-6 right-20 opacity-0 group-hover:opacity-100 transition-opacity max-w-sm z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <div className="text-white text-xs mb-2 px-2 py-1 bg-blue-600 rounded-full w-fit">
              Nội dung video
            </div>
            <div className="space-y-2">
              <p className="text-white text-sm leading-relaxed line-clamp-3">
                {reel.caption || "Không có mô tả"}
              </p>
              {reel.hashtags && reel.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {reel.hashtags.map((tag, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        onHashtagClick?.(tag);
                      }}
                      className="text-blue-400 font-bold hover:text-blue-300 hover:underline cursor-pointer transition-colors text-sm"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Actions - GIỮ NGUYÊN như cũ */}
        <div className="absolute right-4 bottom-20 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {/* Like Button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-lg"
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart
                className={`w-6 h-6 ${
                  reel.isLikedByMe ? "fill-red-600 text-red-600" : ""
                }`}
              />
            </Button>
            <span className="text-xs text-white font-semibold">
              {reel.likeCount}
            </span>
          </div>

          {/* Comment Button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-full shadow-lg ${
                showComments
                  ? "bg-blue-500 text-white"
                  : "bg-white/90 hover:bg-white text-gray-900"
              }`}
              onClick={handleLoadComments}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <span className="text-xs text-white font-semibold">
              {reel.commentCount}
            </span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-lg"
            >
              <Share2 className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-lg"
              onClick={handleToggleSave}
              disabled={isTogglingSave}
            >
              {isSavedByMe ? (
                <BookMarked className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ) : (
                <Bookmark className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      {showComments && (
        <CommentsModal
          reel={reel}
          comments={comments}
          commentText={commentText}
          isSubmittingComment={isSubmittingComment}
          isLoadingComments={isLoadingComments}
          onCommentTextChange={setCommentText}
          onSubmitComment={handleSubmitComment}
          onClose={() => setShowComments(false)}
          onCommentsUpdate={setComments}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
