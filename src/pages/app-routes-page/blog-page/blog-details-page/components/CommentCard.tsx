import { memo } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { UserAvatarFallback } from "@/components/custom/UserAvatarFallback.tsx";
import { formatRelativeTime } from "@/utils/dateFormatter.ts";
import type { BlogCommentResponse } from "@/types/blog/blogComment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { MoreVertical, Pencil, Trash2, Loader2, Flag } from "lucide-react";

interface CommentCardProps {
  comment: BlogCommentResponse;
  isOwner: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  editContent: string;
  onStartEdit: (comment: BlogCommentResponse) => void;
  onCancelEdit: () => void;
  onCompleteEdit: (commentId: number) => void;
  onDelete: (commentId: number) => void;
  onEditContentChange: (content: string) => void;
  onReport: (commentId: number) => void;
}

const CommentCard = memo(function CommentCard({
  comment,
  isOwner,
  isEditing,
  isDeleting,
  isUpdating,
  editContent,
  onStartEdit,
  onCancelEdit,
  onCompleteEdit,
  onDelete,
  onEditContentChange,
  onReport,
}: CommentCardProps) {
  return (
    <div className="flex gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={comment.user.avatarUrl || "/placeholder.svg"}
          alt={comment.user.name}
        />
        <UserAvatarFallback name={comment.user.name} size={40} />
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">{comment.user.name}</p>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
            </span>
            {comment.createdAt !== comment.updatedAt && (
              <span className="text-xs text-muted-foreground italic">
                (đã chỉnh sửa)
              </span>
            )}
          </div>
          {!isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => onStartEdit(comment)}
                      className="gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Chỉnh sửa bình luận
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(comment.id)}
                      onSelect={(e) => e.preventDefault()}
                      className="gap-2 text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa bình luận
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={() => onReport(comment.id)}
                    className="gap-2 text-orange-600 focus:text-orange-600"
                  >
                    <Flag className="h-4 w-4" />
                    Báo cáo bình luận
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={isUpdating}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelEdit}
                disabled={isUpdating}
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={() => onCompleteEdit(comment.id)}
                disabled={isUpdating || !editContent.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isUpdating ? "Đang lưu..." : "Hoàn tất chỉnh sửa"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground break-words">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
});

export default CommentCard;
