"use client";

import type React from "react";
import {
  X,
  Send,
  Heart,
  User,
  MoreVertical,
  ChevronDown,
  Shield,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Reel, ReelComment } from "@/types/reels";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useState } from "react";
import { reelsApi } from "@/services/reels";
import { toast } from "sonner";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface CommentsModalProps {
  reel: Reel;
  comments: ReelComment[];
  commentText: string;
  isSubmittingComment: boolean;
  isLoadingComments: boolean;
  onCommentTextChange: (text: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  onClose: () => void;
  onCommentsUpdate?: (comments: ReelComment[]) => void;
}

export default function CommentsModal({
  reel,
  comments,
  commentText,
  isSubmittingComment,
  isLoadingComments,
  onCommentTextChange,
  onSubmitComment,
  onClose,
  onCommentsUpdate,
}: CommentsModalProps) {
  const [reactingCommentId, setReactingCommentId] = useState<number | null>(
    null
  );
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(
    new Set()
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    commentId: number | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    commentId: null,
    isLoading: false,
  });

  const handleCommentReaction = async (
    commentId: number,
    currentReaction: string | null
  ) => {
    try {
      setReactingCommentId(commentId);
      if (currentReaction) {
        const updated = await reelsApi.removeCommentReaction(commentId);
        if (onCommentsUpdate) {
          onCommentsUpdate(
            comments.map((c) => (c.id === commentId ? updated : c))
          );
        }
      } else {
        const updated = await reelsApi.addCommentReaction(commentId, "LIKE");
        if (onCommentsUpdate) {
          onCommentsUpdate(
            comments.map((c) => (c.id === commentId ? updated : c))
          );
        }
      }
    } catch (err) {
      console.error("[v0] Error toggling reaction:", err);
    } finally {
      setReactingCommentId(null);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      setDeleteConfirmation({
        isOpen: true,
        commentId: commentId,
        isLoading: false,
      });
    } catch (err) {
      console.error("[v0] Error preparing delete:", err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.commentId) return;

    try {
      setDeleteConfirmation((prev) => ({ ...prev, isLoading: true }));
      await reelsApi.deleteComment(deleteConfirmation.commentId!);
      if (onCommentsUpdate) {
        onCommentsUpdate(
          comments.filter((c) => c.id !== deleteConfirmation.commentId)
        );
      }
      setDeleteConfirmation({
        isOpen: false,
        commentId: null,
        isLoading: false,
      });
    } catch (err) {
      console.error("[v0] Error deleting comment:", err);
      setDeleteConfirmation((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, commentId: null, isLoading: false });
  };

  const handleReplySubmit = async (commentId: number) => {
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const reply = await reelsApi.createComment(reel.id, {
        content: replyText,
        parentId: commentId,
      });
      if (onCommentsUpdate) {
        onCommentsUpdate([reply, ...comments]);
      }
      setReplyText("");
      setReplyingToId(null);
      toast.success("Đã trả lời bình luận");
    } catch (err) {
      console.error("Error submitting reply:", err);
      toast.error("Không thể gửi trả lời");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const getReplies = (commentId: number) => {
    return comments.filter((c) => c.parentId === commentId);
  };

  const getParentComments = () => {
    return comments.filter((c) => !c.parentId);
  };

  const toggleExpandReplies = (commentId: number) => {
    const newSet = new Set(expandedReplies);
    if (newSet.has(commentId)) {
      newSet.delete(commentId);
    } else {
      newSet.add(commentId);
    }
    setExpandedReplies(newSet);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-xl font-bold text-gray-900">
              Bình luận ({reel.commentCount})
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 rounded-full hover:bg-white/80"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-2">
            {isLoadingComments ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
              </div>
            ) : getParentComments().length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-base">Chưa có bình luận nào</p>
                <p className="text-sm mt-2">Hãy là người đầu tiên bình luận!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {getParentComments().map((comment) => {
                  const replies = getReplies(comment.id);
                  const visibleReplies = expandedReplies.has(comment.id)
                    ? replies
                    : replies.slice(0, 2);
                  const hasMoreReplies = replies.length > 2;

                  return (
                    <div key={comment.id}>
                      {/* Parent Comment */}
                      <div className="p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex gap-4">
                          {/* Avatar */}
                          {comment.userAvatarUrl ? (
                            <img
                              src={comment.userAvatarUrl || "/placeholder.svg"}
                              alt={comment.userName}
                              className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0 ring-2 ring-gray-100">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}

                          {/* Comment Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-base font-semibold text-gray-900">
                                {comment.userName}
                              </p>
                              {/* Add owner badge when commenter is the video owner */}
                              {comment.isReelOwner && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                  <Shield className="w-3.5 h-3.5" />
                                  Chủ sở hữu
                                </span>
                              )}
                              <p className="text-sm text-gray-500">
                                {formatDistanceToNow(
                                  new Date(comment.createdAt),
                                  {
                                    addSuffix: true,
                                    locale: vi,
                                  }
                                )}
                              </p>
                            </div>
                            <p className="text-base text-gray-700 mt-2 break-words leading-relaxed">
                              {comment.content}
                            </p>

                            {/* Comment Actions */}
                            <div className="flex items-center gap-4 mt-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-7 px-3 text-sm font-medium ${
                                  comment.myReaction
                                    ? "text-red-600 bg-red-50"
                                    : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                                }`}
                                onClick={() =>
                                  handleCommentReaction(
                                    comment.id,
                                    comment.myReaction
                                  )
                                }
                                disabled={reactingCommentId === comment.id}
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    comment.myReaction ? "fill-current" : ""
                                  }`}
                                />
                                {comment.reactionCount > 0 && (
                                  <span className="ml-1.5">
                                    {comment.reactionCount}
                                  </span>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
                                onClick={() =>
                                  setReplyingToId(
                                    replyingToId === comment.id
                                      ? null
                                      : comment.id
                                  )
                                }
                              >
                                Trả lời
                              </Button>
                            </div>
                          </div>

                          {/* More Options */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </Button>
                        </div>
                      </div>

                      {/* Reply Input */}
                      {replyingToId === comment.id && (
                        <div className="px-5 pb-5 bg-gradient-to-r from-blue-50 to-purple-50 flex gap-3 border-l-4 border-blue-400 ml-4">
                          <div className="w-11 flex-shrink-0" />
                          <div className="flex-1 flex gap-3">
                            <Input
                              type="text"
                              placeholder="Viết trả lời..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="text-base h-11"
                              disabled={isSubmittingReply}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isSubmittingReply || !replyText.trim()}
                              className="text-blue-600 hover:bg-blue-100 h-11 px-4"
                              onClick={() => handleReplySubmit(comment.id)}
                            >
                              <Send className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Replies Section */}
                      {replies.length > 0 && (
                        <div className="bg-gradient-to-b from-gray-50 to-white">
                          {visibleReplies.map((reply) => (
                            <div
                              key={reply.id}
                              className="pl-12 pr-4 py-3 border-l-2 border-blue-300 ml-4 hover:bg-blue-50/30 transition-colors"
                            >
                              <div className="flex gap-2">
                                {/* Reply Avatar */}
                                {reply.userAvatarUrl ? (
                                  <img
                                    src={
                                      reply.userAvatarUrl || "/placeholder.svg"
                                    }
                                    alt={reply.userName}
                                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                                    <User className="w-3.5 h-3.5 text-white" />
                                  </div>
                                )}

                                {/* Reply Content - Optimized Layout */}
                                <div className="flex-1 min-w-0">
                                  {/* Header with Name, Badge, and Time */}
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="text-xs font-semibold text-gray-900 leading-tight">
                                      {reply.userName}
                                    </p>
                                    {reply.isReelOwner && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex-shrink-0">
                                        <Shield className="w-2.5 h-2.5" />
                                        <span>Chủ sở hữu</span>
                                      </span>
                                    )}
                                    <p className="text-xs text-gray-500 leading-tight">
                                      {formatDistanceToNow(
                                        new Date(reply.createdAt),
                                        {
                                          addSuffix: true,
                                          locale: vi,
                                        }
                                      )}
                                    </p>
                                  </div>

                                  {/* Reply Text */}
                                  <p className="text-xs text-gray-700 mt-1.5 break-words leading-relaxed">
                                    {reply.content}
                                  </p>

                                  {/* Reply Actions - Compact */}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`h-5 px-1.5 text-xs gap-1 ${
                                        reply.myReaction
                                          ? "text-red-600"
                                          : "text-gray-600 hover:text-red-600"
                                      }`}
                                      onClick={() =>
                                        handleCommentReaction(
                                          reply.id,
                                          reply.myReaction
                                        )
                                      }
                                      disabled={reactingCommentId === reply.id}
                                    >
                                      <Heart
                                        className={`w-3 h-3 ${
                                          reply.myReaction ? "fill-current" : ""
                                        }`}
                                      />
                                      {reply.reactionCount > 0 && (
                                        <span className="text-xs">
                                          {reply.reactionCount}
                                        </span>
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                {/* More Options */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 flex-shrink-0"
                                  onClick={() => handleDeleteComment(reply.id)}
                                >
                                  <MoreVertical className="w-3 h-3 text-gray-500" />
                                </Button>
                              </div>
                            </div>
                          ))}

                          {/* View More Replies Button */}
                          {hasMoreReplies &&
                            !expandedReplies.has(comment.id) && (
                              <button
                                onClick={() => toggleExpandReplies(comment.id)}
                                className="pl-12 pr-4 py-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full flex items-center gap-1 transition font-medium"
                              >
                                <ChevronDown className="w-3 h-3" />
                                Xem {replies.length - 2} bình luận khác
                              </button>
                            )}

                          {/* Collapse Replies Button */}
                          {expandedReplies.has(comment.id) &&
                            hasMoreReplies && (
                              <button
                                onClick={() => toggleExpandReplies(comment.id)}
                                className="pl-12 pr-4 py-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full flex items-center gap-1 transition font-medium"
                              >
                                <ChevronDown className="w-3 h-3 rotate-180" />
                                Ẩn bình luận
                              </button>
                            )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comment Input */}
          <form
            onSubmit={onSubmitComment}
            className="px-6 py-5 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex gap-3 sticky bottom-0"
          >
            <Input
              type="text"
              placeholder="Viết bình luận..."
              value={commentText}
              onChange={(e) => onCommentTextChange(e.target.value)}
              className="text-base h-12 bg-white"
              disabled={isSubmittingComment}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isSubmittingComment || !commentText.trim()}
              className="h-12 w-12 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>

      {/* DeleteConfirmationModal component */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        isLoading={deleteConfirmation.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Xóa bình luận?"
        message="Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác."
      />
    </>
  );
}
