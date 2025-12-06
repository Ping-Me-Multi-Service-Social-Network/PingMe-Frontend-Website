"use client"

import type React from "react"
import { X, Send, Heart, User, MoreVertical, ChevronDown, Shield, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Reel, ReelComment } from "@/types/reels"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { useState } from "react"
import { reelsApi } from "@/services/reels"
import { toast } from "sonner"
import DeleteConfirmationModal from "./DeleteConfirmationModal"
import EditCommentModal from "./EditCommentModal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CommentsModalProps {
  reel: Reel
  comments: ReelComment[]
  commentText: string
  isSubmittingComment: boolean
  isLoadingComments: boolean
  onCommentTextChange: (text: string) => void
  onSubmitComment: (e: React.FormEvent) => void
  onClose: () => void
  onCommentsUpdate?: (comments: ReelComment[]) => void
  currentUserId?: number
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
  currentUserId,
}: CommentsModalProps) {
  const [reactingCommentId, setReactingCommentId] = useState<number | null>(null)
  const [replyingToId, setReplyingToId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set())
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState("")
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    commentId: number | null
    isLoading: boolean
  }>({
    isOpen: false,
    commentId: null,
    isLoading: false,
  })

  const handleCommentReaction = async (commentId: number, currentReaction: string | null) => {
    try {
      setReactingCommentId(commentId)
      if (currentReaction) {
        const updated = await reelsApi.removeCommentReaction(commentId)
        if (onCommentsUpdate) {
          onCommentsUpdate(comments.map((c) => (c.id === commentId ? updated : c)))
        }
      } else {
        const updated = await reelsApi.addCommentReaction(commentId, "LIKE")
        if (onCommentsUpdate) {
          onCommentsUpdate(comments.map((c) => (c.id === commentId ? updated : c)))
        }
      }
    } catch (err) {
      console.error("[v0] Error toggling reaction:", err)
    } finally {
      setReactingCommentId(null)
    }
  }

  const handleEditComment = (comment: ReelComment) => {
    setEditingCommentId(comment.id)
    setEditingCommentContent(comment.content)
  }

  const handleConfirmEdit = async (newContent: string) => {
    if (!editingCommentId) return

    try {
      setIsSubmittingEdit(true)
      const updated = await reelsApi.updateComment(editingCommentId, newContent)
      if (onCommentsUpdate) {
        onCommentsUpdate(comments.map((c) => (c.id === editingCommentId ? updated : c)))
      }
      setEditingCommentId(null)
      setEditingCommentContent("")
      toast.success("Đã cập nhật bình luận")
    } catch (err) {
      console.error("[v0] Error updating comment:", err)
      toast.error("Không thể cập nhật bình luận")
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingCommentContent("")
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      setDeleteConfirmation({
        isOpen: true,
        commentId: commentId,
        isLoading: false,
      })
    } catch (err) {
      console.error("[v0] Error preparing delete:", err)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.commentId) return

    try {
      setDeleteConfirmation((prev) => ({ ...prev, isLoading: true }))
      await reelsApi.deleteComment(deleteConfirmation.commentId!)
      if (onCommentsUpdate) {
        onCommentsUpdate(comments.filter((c) => c.id !== deleteConfirmation.commentId))
      }
      setDeleteConfirmation({
        isOpen: false,
        commentId: null,
        isLoading: false,
      })
    } catch (err) {
      console.error("[v0] Error deleting comment:", err)
      setDeleteConfirmation((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, commentId: null, isLoading: false })
  }

  const handleReplySubmit = async (commentId: number) => {
    if (!replyText.trim()) return

    setIsSubmittingReply(true)
    try {
      const reply = await reelsApi.createComment(reel.id, {
        content: replyText,
        parentId: commentId,
      })
      if (onCommentsUpdate) {
        onCommentsUpdate([reply, ...comments])
      }
      setReplyText("")
      setReplyingToId(null)
      toast.success("Đã trả lời bình luận")
    } catch (err) {
      console.error("Error submitting reply:", err)
      toast.error("Không thể gửi trả lời")
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const getReplies = (commentId: number) => {
    return comments.filter((c) => c.parentId === commentId)
  }

  const getParentComments = () => {
    return comments.filter((c) => !c.parentId)
  }

  const toggleExpandReplies = (commentId: number) => {
    const newSet = new Set(expandedReplies)
    if (newSet.has(commentId)) {
      newSet.delete(commentId)
    } else {
      newSet.add(commentId)
    }
    setExpandedReplies(newSet)
  }

  return (
    <>
      <div className="inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Bình luận</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                {reel.commentCount}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="h-10 w-10 rounded-full hover:bg-white/80 transition-all hover:rotate-90"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-4 py-2 bg-gradient-to-b from-gray-50/50 to-white">
            {isLoadingComments ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-500" />
                  <MessageCircle className="absolute inset-0 m-auto w-6 h-6 text-blue-400" />
                </div>
                <p className="mt-4 text-sm font-medium">Đang tải bình luận...</p>
              </div>
            ) : getParentComments().length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-lg font-semibold text-gray-700">Chưa có bình luận nào</p>
                <p className="text-sm mt-2 text-gray-500">Hãy là người đầu tiên bình luận!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {getParentComments().map((comment) => {
                  const replies = getReplies(comment.id)
                  const visibleReplies = expandedReplies.has(comment.id) ? replies : replies.slice(0, 2)
                  const hasMoreReplies = replies.length > 2

                  return (
                    <div key={comment.id}>
                      {/* Parent Comment */}
                      <div className="p-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 rounded-xl mx-2 my-1">
                        <div className="flex gap-3">
                          {/* Avatar */}
                          {comment.userAvatarUrl ? (
                            <img
                              src={comment.userAvatarUrl || "/placeholder.svg"}
                              alt={comment.userName}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-blue-100 shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 ring-2 ring-blue-100 shadow-lg">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}

                          {/* Comment Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-gray-900">{comment.userName}</p>
                              {comment.isReelOwner && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold rounded-full shadow-sm">
                                  <Shield className="w-3 h-3" />
                                  Chủ sở hữu
                                </span>
                              )}
                              <p className="text-xs text-gray-400 font-medium">
                                {formatDistanceToNow(new Date(comment.createdAt), {
                                  addSuffix: true,
                                  locale: vi,
                                })}
                              </p>
                            </div>
                            <p className="text-sm text-gray-800 mt-2 break-words leading-relaxed">
                              {comment.content}
                            </p>

                            {/* Comment Actions */}
                            <div className="flex items-center gap-3 mt-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 px-3 text-xs font-semibold rounded-full transition-all ${
                                  comment.myReaction
                                    ? "text-red-600 bg-red-50 hover:bg-red-100"
                                    : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                                }`}
                                onClick={() => handleCommentReaction(comment.id, comment.myReaction)}
                                disabled={reactingCommentId === comment.id}
                              >
                                <Heart className={`w-3.5 h-3.5 ${comment.myReaction ? "fill-current" : ""}`} />
                                {comment.reactionCount > 0 && <span className="ml-1">{comment.reactionCount}</span>}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-all"
                                onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                              >
                                Trả lời
                              </Button>
                            </div>
                          </div>

                          {/* More Options - Only for current user's comments */}
                          {currentUserId && comment.userId === currentUserId && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-all">
                                  <MoreVertical className="w-4 h-4 text-gray-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg">
                                <DropdownMenuItem onClick={() => handleEditComment(comment)} className="rounded-lg">
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-red-600 rounded-lg"
                                >
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
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
                                    src={reply.userAvatarUrl || "/placeholder.svg"}
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
                                      {formatDistanceToNow(new Date(reply.createdAt), {
                                        addSuffix: true,
                                        locale: vi,
                                      })}
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
                                        reply.myReaction ? "text-red-600" : "text-gray-600 hover:text-red-600"
                                      }`}
                                      onClick={() => handleCommentReaction(reply.id, reply.myReaction)}
                                      disabled={reactingCommentId === reply.id}
                                    >
                                      <Heart className={`w-3 h-3 ${reply.myReaction ? "fill-current" : ""}`} />
                                      {reply.reactionCount > 0 && (
                                        <span className="text-xs">{reply.reactionCount}</span>
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                {/* More Options - Only for current user's replies */}
                                {currentUserId && reply.userId === currentUserId && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 flex-shrink-0">
                                        <MoreVertical className="w-3 h-3 text-gray-500" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                      <DropdownMenuItem onClick={() => handleEditComment(reply)}>
                                        Chỉnh sửa
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="text-red-600"
                                      >
                                        Xóa
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* View More Replies Button */}
                          {hasMoreReplies && !expandedReplies.has(comment.id) && (
                            <button
                              onClick={() => toggleExpandReplies(comment.id)}
                              className="pl-12 pr-4 py-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full flex items-center gap-1 transition font-medium"
                            >
                              <ChevronDown className="w-3 h-3" />
                              Xem {replies.length - 2} bình luận khác
                            </button>
                          )}

                          {/* Collapse Replies Button */}
                          {expandedReplies.has(comment.id) && hasMoreReplies && (
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
                  )
                })}
              </div>
            )}
          </div>

          {/* Comment Input */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white shadow-lg">
            <form onSubmit={onSubmitComment} className="flex gap-3">
              <Input
                type="text"
                placeholder="Viết bình luận của bạn..."
                value={commentText}
                onChange={(e) => onCommentTextChange(e.target.value)}
                disabled={isSubmittingComment}
                className="text-sm h-11 rounded-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingComment || !commentText.trim()}
                className="h-11 px-5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        isLoading={deleteConfirmation.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <EditCommentModal
        isOpen={editingCommentId !== null}
        isLoading={isSubmittingEdit}
        initialContent={editingCommentContent}
        onConfirm={handleConfirmEdit}
        onCancel={handleCancelEdit}
      />
    </>
  )
}
