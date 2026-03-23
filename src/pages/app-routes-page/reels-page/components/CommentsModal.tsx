import type React from "react"
import { X, Send, Heart, User, MoreVertical, ChevronDown, Shield, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import type { Reel, ReelComment } from "@/types/reels"
import { formatDistanceToNow } from "date-fns"
import { vi, enUS } from "date-fns/locale"
import { useState } from "react"
import { reelsApi } from "@/services/reels"
import { toast } from "sonner"
import DeleteConfirmationModal from "./DeleteConfirmationModal.tsx"
import EditCommentModal from "./EditCommentModal.tsx"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu.tsx"
import { useTranslation } from "react-i18next"

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
  const { t, i18n } = useTranslation("reels")
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
      toast.success(t("comments.updated"))
    } catch (err) {
      console.error("[v0] Error updating comment:", err)
      toast.error(t("comments.updateError"))
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
      toast.success(t("comments.replied"))
    } catch (err) {
      console.error("Error submitting reply:", err)
      toast.error(t("comments.replyError"))
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
      <div className="inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'oklch(0.06 0.02 270 / 0.7)', backdropFilter: 'blur(12px)' }}>
        <div className="rounded-2xl shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden" style={{ background: 'oklch(0.12 0.03 270)', border: '1px solid oklch(0.2 0.04 270)' }}>
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid oklch(0.2 0.04 270)', background: 'oklch(0.1 0.03 270)' }}>
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6" style={{ color: 'oklch(0.65 0.2 270)' }} />
              <h2 className="text-xl font-bold" style={{ color: 'oklch(0.96 0.01 270)' }}>{t("comments.title")}</h2>
              <span className="px-3 py-1 text-sm font-semibold rounded-full" style={{ background: 'oklch(0.2 0.08 270)', color: 'oklch(0.72 0.18 270)' }}>
                {reel.commentCount}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-full hover:bg-white/10 transition-all hover:rotate-90"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-4 py-2" style={{ background: 'oklch(0.1 0.02 270)' }}>
            {isLoadingComments ? (
              <div className="flex flex-col items-center justify-center h-full" style={{ color: 'oklch(0.5 0.03 270)' }}>
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12" style={{ borderBottom: '2px solid oklch(0.65 0.2 270)', borderTop: '2px solid oklch(0.65 0.2 270)' }} />
                  <MessageCircle className="absolute inset-0 m-auto w-6 h-6" style={{ color: 'oklch(0.65 0.2 270)' }} />
                </div>
                <p className="mt-4 text-sm font-medium">{t("comments.loading")}</p>
              </div>
            ) : getParentComments().length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full" style={{ color: 'oklch(0.5 0.03 270)' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: 'oklch(0.2 0.08 270)' }}>
                  <MessageCircle className="w-10 h-10" style={{ color: 'oklch(0.65 0.2 270)' }} />
                </div>
                <p className="text-lg font-semibold" style={{ color: 'oklch(0.8 0.04 270)' }}>{t("comments.empty")}</p>
                <p className="text-sm mt-2" style={{ color: 'oklch(0.5 0.03 270)' }}>{t("comments.emptyDesc")}</p>
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
                      <div className="p-4 hover:bg-white/5 transition-all duration-200 rounded-xl mx-2 my-1">
                        <div className="flex gap-3">
                          {/* Avatar */}
                          {comment.userAvatarUrl ? (
                            <img
                              src={comment.userAvatarUrl || "/placeholder.svg"}
                              alt={comment.userName}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 shadow-sm" style={{ '--tw-ring-color': 'oklch(0.2 0.08 270)' } as React.CSSProperties}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: 'oklch(0.55 0.2 270)' }}>
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}

                          {/* Comment Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold" style={{ color: 'oklch(0.96 0.01 270)' }}>{comment.userName}</p>
                              {comment.isReelOwner && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-white text-xs font-semibold rounded-full shadow-sm" style={{ background: 'oklch(0.55 0.2 270)' }}>
                                  <Shield className="w-3 h-3" />
                                  {t("comments.owner")}
                                </span>
                              )}
                              <p className="text-xs font-medium" style={{ color: 'oklch(0.5 0.03 270)' }}>
                                {formatDistanceToNow(new Date(comment.createdAt), {
                                  addSuffix: true,
                                  locale: i18n.language === "vi" ? vi : enUS,
                                })}
                              </p>
                            </div>
                            <p className="text-sm mt-2 break-words leading-relaxed" style={{ color: 'oklch(0.8 0.04 270)' }}>
                              {comment.content}
                            </p>

                            {/* Comment Actions */}
                            <div className="flex items-center gap-3 mt-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 px-3 text-xs font-semibold rounded-full transition-all ${comment.myReaction
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
                                {t("comments.reply")}
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
                                  {t("comments.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-red-600 rounded-lg"
                                >
                                  {t("comments.delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>

                      {/* Reply Input */}
                      {replyingToId === comment.id && (
                        <div className="px-5 pb-5 flex gap-3 ml-4" style={{ background: 'oklch(0.14 0.04 270)', borderLeft: '4px solid oklch(0.55 0.2 270)' }}>
                          <div className="w-11 flex-shrink-0" />
                          <div className="flex-1 flex gap-3">
                            <Input
                              type="text"
                              placeholder={t("comments.replyPlaceholder")}
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
                        <div style={{ background: 'oklch(0.1 0.02 270)' }}>
                          {visibleReplies.map((reply) => (
                            <div
                              key={reply.id}
                              className="pl-12 pr-4 py-3 ml-4 hover:bg-white/5 transition-colors" style={{ borderLeft: '2px solid oklch(0.45 0.15 270)' }}
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
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'oklch(0.5 0.18 270)' }}>
                                    <User className="w-3.5 h-3.5 text-white" />
                                  </div>
                                )}

                                {/* Reply Content - Optimized Layout */}
                                <div className="flex-1 min-w-0">
                                  {/* Header with Name, Badge, and Time */}
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="text-xs font-semibold leading-tight" style={{ color: 'oklch(0.96 0.01 270)' }}>
                                      {reply.userName}
                                    </p>
                                    {reply.isReelOwner && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex-shrink-0">
                                        <Shield className="w-2.5 h-2.5" />
                                        <span>{t("comments.owner")}</span>
                                      </span>
                                    )}
                                    <p className="text-xs text-gray-500 leading-tight">
                                      {formatDistanceToNow(new Date(reply.createdAt), {
                                        addSuffix: true,
                                        locale: i18n.language === "vi" ? vi : enUS,
                                      })}
                                    </p>
                                  </div>

                                  {/* Reply Text */}
                                  <p className="text-xs mt-1.5 break-words leading-relaxed" style={{ color: 'oklch(0.75 0.04 270)' }}>
                                    {reply.content}
                                  </p>

                                  {/* Reply Actions - Compact */}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`h-5 px-1.5 text-xs gap-1 ${reply.myReaction ? "text-red-600" : "text-gray-600 hover:text-red-600"
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
                                        {t("comments.edit")}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="text-red-600"
                                      >
                                        {t("comments.delete")}
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
                              {t("comments.viewMore", { count: replies.length - 2 })}
                            </button>
                          )}

                          {/* Collapse Replies Button */}
                          {expandedReplies.has(comment.id) && hasMoreReplies && (
                            <button
                              onClick={() => toggleExpandReplies(comment.id)}
                              className="pl-12 pr-4 py-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full flex items-center gap-1 transition font-medium"
                            >
                              <ChevronDown className="w-3 h-3 rotate-180" />
                              {t("comments.hide")}
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
          <div className="px-6 py-4 shadow-lg" style={{ borderTop: '1px solid oklch(0.2 0.04 270)', background: 'oklch(0.1 0.03 270)' }}>
            <form onSubmit={onSubmitComment} className="flex gap-3">
              <Input
                type="text"
                placeholder={t("comments.placeholder")}
                value={commentText}
                onChange={(e) => onCommentTextChange(e.target.value)}
                disabled={isSubmittingComment}
                className="text-sm h-11 rounded-full transition-all" style={{ background: 'oklch(0.16 0.03 270)', border: '1px solid oklch(0.25 0.05 270)', color: 'oklch(0.96 0.01 270)' }}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingComment || !commentText.trim()}
                className="h-11 px-5 text-white rounded-full shadow-md hover:shadow-lg transition-all" style={{ background: 'oklch(0.55 0.2 270)' }}
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
