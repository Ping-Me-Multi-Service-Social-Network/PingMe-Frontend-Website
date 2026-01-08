import { Badge } from "@/components/ui/badge.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { FileText, Pencil, Clock, RefreshCw } from "lucide-react";
import type { BlogReviewResponse } from "@/types/blog/blog.ts";
import { getUserInitials } from "@/utils/authFieldHandler.ts";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import { useNavigate } from "react-router-dom";
import { getGradientForBlog, CATEGORY_LABELS } from "@/utils/blogFieldHandler.ts";
import { formatRelativeTime } from "@/utils/dateFormatter.ts";

interface BlogGridProps {
  blogs: BlogReviewResponse[];
  showApprovalStatus?: boolean;
  loading?: boolean;
  showEditButton?: boolean;
}

export function BlogGrid({
  blogs,
  showApprovalStatus = false,
  loading = false,
  showEditButton = false,
}: BlogGridProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner className="h-12 w-12 text-primary" />
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Không tìm thấy bài viết"
        description="Thử điều chỉnh tìm kiếm hoặc bộ lọc để tìm những gì bạn đang tìm kiếm."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
      {blogs.map((blog) => (
        <Card
          key={blog.id}
          onClick={() => navigate(`/blogs/${blog.id}`)}
          className="group cursor-pointer hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden border-border/50 pt-0 px-0 pb-6 relative"
        >
          {showEditButton && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2 z-10 h-8 w-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/blogs/upsert/${blog.id}`);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}

          <div className="relative h-48 overflow-hidden">
            {blog.imgPreviewUrl ? (
              <img
                src={blog.imgPreviewUrl || "/placeholder.svg"}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${getGradientForBlog(
                  blog.id
                )} group-hover:scale-105 transition-transform duration-300`}
              />
            )}
          </div>

          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant="secondary"
                className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
              >
                {CATEGORY_LABELS[blog.category]}
              </Badge>
              {showApprovalStatus && (
                <Badge
                  variant={blog.isApproved ? "default" : "outline"}
                  className="text-xs"
                >
                  {blog.isApproved ? "Đã duyệt" : "Chờ duyệt"}
                </Badge>
              )}
            </div>

            <h3 className="text-xl font-semibold text-foreground group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 line-clamp-2 text-balance break-words">
              {blog.title}
            </h3>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3 text-pretty break-words">
              {blog.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-purple-500" />
                <span>{formatRelativeTime(blog.createdAt)}</span>
              </div>
              {blog.updatedAt &&
                new Date(blog.updatedAt).getTime() !==
                  new Date(blog.createdAt).getTime() && (
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 text-pink-500" />
                    <span>{formatRelativeTime(blog.updatedAt)}</span>
                  </div>
                )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-purple-200/30 dark:border-purple-800/30">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={blog.user.avatarUrl || "/placeholder.svg"}
                  alt={blog.user.name}
                />
                <AvatarFallback>
                  {getUserInitials(blog.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {blog.user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {blog.user.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
