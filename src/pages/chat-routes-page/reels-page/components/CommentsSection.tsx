"use client";

import type React from "react";
import { useState } from "react";
import { Send, Heart, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ReelComment } from "@/types/reels";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface CommentsSectionProps {
  comments: ReelComment[];
  commentCount: number;
  isSubmittingComment: boolean;
  commentText: string;
  onCommentTextChange: (text: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  isLoadingComments: boolean;
  currentUserId?: number;
}

export default function CommentsSection({
  comments,
  commentCount,
  isSubmittingComment,
  commentText,
  onCommentTextChange,
  onSubmitComment,
  isLoadingComments,
  currentUserId,
}: CommentsSectionProps) {
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());

  const toggleLikeComment = (commentId: number) => {
    setLikedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">
          Bình luận ({commentCount})
        </h3>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingComments ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Đang tải bình luận...
          </div>
        ) : comments.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Chưa có bình luận nào
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  {comment.userAvatarUrl ? (
                    <img
                      src={comment.userAvatarUrl || "/placeholder.svg"}
                      alt={comment.userName}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {comment.userName}
                      </p>
                      {comment.isReelOwner && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          <Shield className="w-3 h-3" />
                          Chủ sở hữu
                        </span>
                      )}
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 break-words">
                      {comment.content}
                    </p>

                    {/* Comment Actions */}
                    <div className="flex items-center gap-3 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 px-2 text-xs ${
                          likedComments.has(comment.id)
                            ? "text-red-600"
                            : "text-gray-600 hover:text-red-600"
                        }`}
                        onClick={() => toggleLikeComment(comment.id)}
                      >
                        <Heart
                          className={`w-3 h-3 ${
                            likedComments.has(comment.id) ? "fill-current" : ""
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-gray-600"
                      >
                        Trả lời
                      </Button>
                    </div>
                  </div>

                  {/* Three Dots Menu - Only for current user's comments */}
                  {currentUserId && comment.userId === currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle menu open logic here
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <circle cx="8" cy="3" r="1.5" />
                        <circle cx="8" cy="8" r="1.5" />
                        <circle cx="8" cy="13" r="1.5" />
                      </svg>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Input */}
      <form
        onSubmit={onSubmitComment}
        className="px-4 py-3 border-t border-gray-200 bg-white flex gap-2"
      >
        <Input
          type="text"
          placeholder="Viết bình luận..."
          value={commentText}
          onChange={(e) => onCommentTextChange(e.target.value)}
          className="text-sm"
          disabled={isSubmittingComment}
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={isSubmittingComment || !commentText.trim()}
          className="text-blue-600 hover:bg-blue-50"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
