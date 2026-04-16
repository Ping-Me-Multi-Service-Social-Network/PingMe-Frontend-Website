import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  User,
  Bookmark,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { Reel, ReelComment } from "@/types/reels";
import { reelsApi } from "@/services/reels";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { toast } from "sonner";
import CommentsModal from "./CommentsModal.tsx";
import { useAppSelector } from "@/features/hooks.ts";
import { useTranslation } from "react-i18next";

// trigger deploy
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
  globalMuted,
  onMuteToggle,
}: ReelDetailViewProps & {
  isActive?: boolean;
  togglePlaySignal?: number;
  globalMuted?: boolean;
  onMuteToggle?: (muted: boolean) => void;
}) {
  const { t, i18n } = useTranslation("reels");
  const currentUserId = useAppSelector((state) => state.auth.userSession.id);

  // Video states
  const [isPlaying, setIsPlaying] = useState(true);
  const [localMuted, setLocalMuted] = useState(false);
  const isMuted = globalMuted !== undefined ? globalMuted : localMuted;

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showPlayIndicator, setShowPlayIndicator] = useState(false);
  const [playIndicatorIcon, setPlayIndicatorIcon] = useState<"play" | "pause">(
    "pause",
  );

  // Interaction states
  const [isLiking, setIsLiking] = useState(false);
  const [likeBurst, setLikeBurst] = useState(false);
  const [isSavedByMe, setIsSavedByMe] = useState(reel.isSavedByMe || false);
  const [isTogglingSave, setIsTogglingSave] = useState(false);
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // ─── Handlers ───

  const handleLike = useCallback(async () => {
    setIsLiking(true);
    setLikeBurst(true);
    setTimeout(() => setLikeBurst(false), 400);
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
      console.error("[PingMe] Error toggling like:", err);
    } finally {
      setIsLiking(false);
    }
  }, [reel, onUpdate]);

  const handleToggleSave = async () => {
    setIsTogglingSave(true);
    try {
      const result = await reelsApi.toggleSave(reel.id);
      setIsSavedByMe(result.isSavedByMe);
      if (onUpdate) {
        onUpdate({ ...reel, isSavedByMe: result.isSavedByMe });
      }
    } catch (err) {
      console.error("[PingMe] Error toggling save:", err);
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
        console.error("[PingMe] Error loading comments:", err);
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
        onUpdate({ ...reel, commentCount: reel.commentCount + 1 });
      }
    } catch (err) {
      console.error("[PingMe] Error submitting comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await reelsApi.deleteReel(reel.id);
      toast.success(t("edit.success_delete") || t("manage.deleteSuccess"));
      onDelete?.(reel.id);
    } catch (err) {
      console.error("[PingMe] Error deleting reel:", err);
      toast.error(t("edit.error_delete") || t("manage.deleteError"));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const triggerPlayIndicator = (icon: "play" | "pause") => {
    setPlayIndicatorIcon(icon);
    setShowPlayIndicator(true);
    setTimeout(() => setShowPlayIndicator(false), 600);
  };

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      triggerPlayIndicator("play");
    } else {
      videoRef.current.play();
      triggerPlayIndicator("pause");
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleVideoDoubleClick = useCallback(() => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }
    handleLike();
  }, [clickTimeout, handleLike]);

  const handleVideoClick = useCallback(() => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }
    const timeout = setTimeout(() => {
      handlePlayPause();
      setClickTimeout(null);
    }, 250);
    setClickTimeout(timeout);
  }, [clickTimeout, handlePlayPause]);

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
    }
    if (onMuteToggle) {
      onMuteToggle(newMuted);
    } else {
      setLocalMuted(newMuted);
    }
  };

  const handleSpeedChange = () => {
    if (!videoRef.current) return;
    const speeds = [0.5, 1, 1.5, 2];
    const idx = speeds.indexOf(playbackSpeed);
    const next = speeds[(idx + 1) % speeds.length];
    videoRef.current.playbackRate = next;
    setPlaybackSpeed(next);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    const time = ratio * duration;
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

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ─── Effects ───

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {});
      reelsApi
        .incrementViewCount(reel.id)
        .catch((err) =>
          console.error("[PingMe] Error incrementing views:", err),
        );
    } else {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        /* ignore */
      }
      setIsPlaying(false);
    }
  }, [reel.id, isActive]);

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

  useEffect(() => {
    if (videoRef.current && globalMuted !== undefined) {
      videoRef.current.muted = globalMuted;
    }
  }, [globalMuted]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="reel-detail">
      {/* Video Area */}
      <div className="reel-detail__video-area">
        {/* Gradient overlays */}
        <div className="reel-detail__overlay-top" />
        <div className="reel-detail__overlay-bottom" />

        {/* Video */}
        <div className="reel-detail__video-wrapper">
          <video
            ref={videoRef}
            src={reel.videoUrl}
            onDoubleClick={handleVideoDoubleClick}
            onClick={handleVideoClick}
            controlsList="nodownload"
            loop
            muted={isMuted}
            onTimeUpdate={(e) =>
              setCurrentTime((e.target as HTMLVideoElement).currentTime)
            }
            onLoadedMetadata={(e) =>
              setDuration((e.target as HTMLVideoElement).duration)
            }
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Play/Pause indicator */}
          {showPlayIndicator && (
            <div className="reel-play-indicator">
              <div className="reel-play-indicator__circle">
                {playIndicatorIcon === "play" ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7" />
                )}
              </div>
            </div>
          )}

          {/* Video Controls */}
          <div className="reel-detail__controls">
            {/* Progress Bar */}
            <div className="reel-progress">
              <div
                ref={progressRef}
                className="reel-progress__bar-wrapper"
                onClick={handleSeek}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    // Could optionally implement seek using arrow keys here
                  }
                }}
                role="slider"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                tabIndex={0}
              >
                <div
                  className="reel-progress__bar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="reel-progress__time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Control Buttons */}
            <div className="reel-detail__control-btns">
              <button
                className="reel-ctrl-btn"
                onClick={handlePlayPause}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause /> : <Play />}
              </button>
              <button
                className="reel-ctrl-btn"
                onClick={handleMuteToggle}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX /> : <Volume2 />}
              </button>
              <button
                className="reel-ctrl-btn reel-ctrl-btn--speed"
                onClick={handleSpeedChange}
                title="Speed"
              >
                {playbackSpeed}x
              </button>
              <button
                className="reel-ctrl-btn reel-ctrl-btn--speed"
                onClick={handleStop}
                title="Stop"
              >
                {t("feed.stop")}
              </button>
            </div>
          </div>
        </div>

        {/* User Info - Top Left */}
        <div className="reel-detail__user-info">
          {reel.userAvatarUrl ? (
            <img
              src={reel.userAvatarUrl || "/placeholder.svg"}
              alt={reel.userName}
              className="reel-detail__avatar"
            />
          ) : (
            <div className="reel-detail__avatar-placeholder">
              <User />
            </div>
          )}
          <div>
            <p className="reel-detail__username">{reel.userName}</p>
            <p className="reel-detail__timestamp">
              {formatDistanceToNow(new Date(reel.createdAt), {
                addSuffix: true,
                locale: i18n.language === "vi" ? vi : enUS,
              })}
            </p>
          </div>
        </div>

        {/* Caption - Bottom Left */}
        <div className="reel-detail__caption-area">
          <div className="reel-detail__content-badge">
            {t("feed.videoContent")}
          </div>
          <p className="reel-detail__caption-text">
            {reel.caption || t("feed.noDescription")}
          </p>
          {reel.hashtags && reel.hashtags.length > 0 && (
            <div className="reel-detail__hashtags">
              {reel.hashtags.map((tag) => (
                <button
                  key={tag}
                  className="reel-detail__hashtag"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHashtagClick?.(tag);
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Sidebar */}
        <div className="reel-actions">
          {/* Like */}
          <div className="reel-action reel-entrance reel-entrance--delay-1">
            <button
              className={`reel-action__btn ${reel.isLikedByMe ? "reel-action__btn--liked" : ""} ${likeBurst ? "reel-action__btn--like-burst" : ""}`}
              onClick={handleLike}
              disabled={isLiking}
              title="Like"
            >
              <Heart />
            </button>
            <span className="reel-action__count">{reel.likeCount}</span>
          </div>

          {/* Comment */}
          <div className="reel-action reel-entrance reel-entrance--delay-2">
            <button
              className={`reel-action__btn ${showComments ? "reel-action__btn--active" : ""}`}
              onClick={handleLoadComments}
              title="Comments"
            >
              <MessageCircle />
            </button>
            <span className="reel-action__count">{reel.commentCount}</span>
          </div>

          {/* Share */}
          <div className="reel-action reel-entrance reel-entrance--delay-3">
            <button className="reel-action__btn" title="Share">
              <Share2 />
            </button>
          </div>

          {/* Save */}
          <div className="reel-action reel-entrance reel-entrance--delay-4">
            <button
              className={`reel-action__btn ${isSavedByMe ? "reel-action__btn--saved" : ""}`}
              onClick={handleToggleSave}
              disabled={isTogglingSave}
              title="Save"
            >
              <Bookmark />
            </button>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="reel-delete-overlay">
            <div className="reel-delete-card">
              <h3>{t("manage.deleteConfirm")}</h3>
              <p>{t("comments.deleteDesc")}</p>
              <div className="reel-delete-card__actions">
                <button
                  className="reels-topbar__btn"
                  style={{ flex: 1 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  {t("common.cancel")}
                </button>
                <button
                  className="reels-topbar__btn"
                  style={{
                    flex: 1,
                    background: "var(--reel-like)",
                    color: "white",
                    borderColor: "transparent",
                  }}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? t("common.deleting") : t("common.delete")}
                </button>
              </div>
            </div>
          </div>
        )}
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
