import axiosClient from "@/lib/axiosClient.ts";
import type {
  ApiResponse,
  PageResponse,
  PaginationParams,
} from "@/types/base/apiResponse";
import type {
  BlogCommentResponse,
  UpsertBlogCommentRequest,
} from "@/types/blog/blogComment";

export const saveBlogComment = (
  data: UpsertBlogCommentRequest,
  blogId: number
) => {
  return axiosClient.post<ApiResponse<BlogCommentResponse>>(
    `/blog-comments/blogs/${blogId}`,
    data
  );
};

export const updateBlogComment = (
  data: UpsertBlogCommentRequest,
  blogCommentId: number
) => {
  return axiosClient.put<ApiResponse<BlogCommentResponse>>(
    `/blog-comments/${blogCommentId}`,
    data
  );
};

export const getBlogCommentsByBlogId = ({
  page = 0,
  size = 10,
  id,
}: PaginationParams & { id: number }) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  return axiosClient.get<ApiResponse<PageResponse<BlogCommentResponse>>>(
    `/blog-comments/blogs/${id}?${params.toString()}`
  );
};

export const deleteBlogComment = (blogCommentId: number) => {
  return axiosClient.delete<ApiResponse<void>>(
    `/blog-comments/${blogCommentId}`
  );
};
