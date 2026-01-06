import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import type { BlogDetailsResponse } from "@/types/blog/blog.ts";
import { getUserInitials } from "@/utils/authFieldHandler.ts";
import RichTextPreview from "@/components/custom/RichText/RichTextPreview.tsx";
import { CATEGORY_LABELS, getGradientForBlog } from "@/utils/blogFieldHandler.ts";

interface BlogDetailsProps {
  blog: BlogDetailsResponse;
}

export default function BlogDetails({ blog }: BlogDetailsProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6 mb-8">
        {/* Category Badge */}
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
          {CATEGORY_LABELS[blog.category]}
        </Badge>

        {/* Title */}
        <h1 className="text-4xl font-bold text-foreground leading-tight line-clamp-2 text-balance break-words">
          {blog.title}
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground line-clamp-3 text-pretty break-words">
          {blog.description}
        </p>

        {/* Author Info */}
        <div className="flex items-center gap-4 py-4 border-y border-border">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={blog.user.avatarUrl || "/placeholder.svg"}
              alt={blog.user.name}
            />
            <AvatarFallback>{getUserInitials(blog.user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{blog.user.name}</p>
            <p className="text-sm text-muted-foreground">{blog.user.email}</p>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="mb-8 rounded-lg overflow-hidden">
        {blog.imgPreviewUrl ? (
          <img
            src={blog.imgPreviewUrl || "/placeholder.svg"}
            alt={blog.title}
            className="w-full h-[400px] object-cover"
          />
        ) : (
          <div
            className={`w-full h-[400px] bg-gradient-to-br ${getGradientForBlog(
              blog.id
            )}`}
          />
        )}
      </div>

      {/* Blog Content */}
      <div className="prose prose-xl max-w-none dark:prose-invert [&_p]:text-lg [&_p]:leading-relaxed [&_li]:text-lg mb-12">
        <RichTextPreview content={blog.content} />
      </div>
    </div>
  );
}
