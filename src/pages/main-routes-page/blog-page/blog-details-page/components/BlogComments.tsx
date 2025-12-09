import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getUserInitials } from "@/utils/authFieldHandler";
import {
  getBlogCommentsByBlogId,
  saveBlogComment,
  updateBlogComment,
  deleteBlogComment,
} from "@/services/blog/blogCommentApi.ts";
import type {
  BlogCommentResponse,
  UpsertBlogCommentRequest,
} from "@/types/blog/blogComment";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import Pagination from "@/components/custom/Pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useSelector } from "react-redux";
import type { RootState } from "@/features/store";
import CommentCard from "./CommentCard";

interface BlogCommentsProps {
  blogId: number;
}

export default function BlogComments({ blogId }: BlogCommentsProps) {
  const { userSession, isLogin } = useSelector(
    (state: RootState) => state.auth
  );
  const [comments, setComments] = useState<BlogCommentResponse[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const {
    currentPage,
    itemsPerPage,
    totalElements,
    totalPages,
    setCurrentPage,
    setItemsPerPage,
    setTotalElements,
    setTotalPages,
    resetPagination,
  } = usePagination(10);

  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  );

  const fetchComments = useCallback(async () => {
    try {
      setIsLoadingComments(true);
      const response = await getBlogCommentsByBlogId({
        page: currentPage,
        size: itemsPerPage,
        id: blogId,
      });
      setComments(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
      setTotalElements(response.data.data.totalElements);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải bình luận"));
    } finally {
      setIsLoadingComments(false);
    }
  }, [blogId, currentPage, itemsPerPage, setTotalPages, setTotalElements]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    try {
      setIsSubmitting(true);
      const commentData: UpsertBlogCommentRequest = {
        content: commentContent.trim(),
      };
      await saveBlogComment(commentData, blogId);
      toast.success("Đã thêm bình luận");
      setCommentContent("");
      resetPagination();
      fetchComments();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể thêm bình luận"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (comment: BlogCommentResponse) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleCompleteEdit = async (commentId: number) => {
    if (!editContent.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    try {
      setIsUpdating(true);
      const updateData: UpsertBlogCommentRequest = {
        content: editContent.trim(),
      };
      await updateBlogComment(updateData, commentId);
      toast.success("Đã cập nhật bình luận");
      setEditingCommentId(null);
      setEditContent("");
      fetchComments();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể cập nhật bình luận"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      setDeletingCommentId(commentId);
      await deleteBlogComment(commentId);
      toast.success("Đã xóa bình luận");
      fetchComments();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa bình luận"));
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleReportComment = (commentId: number) => {
    console.log("[PingMe] Report comment:", commentId);
  };

  return (
    <div className="max-w-4xl mx-auto border-t border-border pt-8">
      <h2 className="text-2xl font-bold mb-6">Bình luận ({totalElements})</h2>

      {/* Comment Input */}
      {isLogin && userSession && (
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={userSession.avatarUrl || "/placeholder.svg"}
                alt={userSession.name}
              />
              <AvatarFallback>
                {getUserInitials(userSession.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Viết bình luận của bạn..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !commentContent.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      {isLoadingComments ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner className="h-8 w-8 text-purple-600" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Chưa có bình luận nào
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              isOwner={userSession?.id === comment.user.id}
              isEditing={editingCommentId === comment.id}
              isDeleting={deletingCommentId === comment.id}
              isUpdating={isUpdating}
              editContent={editContent}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onCompleteEdit={handleCompleteEdit}
              onDelete={handleDeleteComment}
              onEditContentChange={setEditContent}
              onReport={handleReportComment}
            />
          ))}

          {comments.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                showItemsPerPageSelect={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
