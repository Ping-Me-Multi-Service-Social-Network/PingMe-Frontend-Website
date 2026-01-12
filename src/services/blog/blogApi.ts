import axiosClient from "@/lib/axiosClient.ts";
import type {
  ApiResponse,
  PageResponse,
  PaginationParams,
} from "@/types/base/apiResponse";
import type {
  BlogDetailsResponse,
  BlogReviewResponse,
} from "@/types/blog/blog.ts";

export const saveBlog = (data: FormData) => {
  return axiosClient.post<ApiResponse<BlogReviewResponse>>("/blogs", data, {
    headers: {
      "Content-Type": "multipart/form-data", // Thêm dòng này cho chắc
    },
  });
};

export const updateBlog = (data: FormData, blogId: number) => {
  return axiosClient.put<ApiResponse<BlogReviewResponse>>(
    `/blogs/${blogId}`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data", // Thêm dòng này cho chắc
      },
    }
  );
};

export const getBlogDetailsById = (id: number) => {
  return axiosClient.get<ApiResponse<BlogDetailsResponse>>(
    `/blogs/details/${id}`
  );
};

export const getAllApprovedBlogs = ({
  page = 0,
  size = 10,
  filter,
}: PaginationParams) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (filter) params.append("filter", filter);

  return axiosClient.get<ApiResponse<PageResponse<BlogReviewResponse>>>(
    `/blogs/approved?${params.toString()}`
  );
};

export const getAllBlogs = ({
  page = 0,
  size = 10,
  filter,
}: PaginationParams) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (filter) params.append("filter", filter);

  return axiosClient.get<ApiResponse<PageResponse<BlogReviewResponse>>>(
    `/blogs?${params.toString()}`
  );
};

export const getCurrentUserBlogs = ({
  page = 0,
  size = 10,
  filter,
}: PaginationParams) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (filter) params.append("filter", filter);

  return axiosClient.get<ApiResponse<PageResponse<BlogReviewResponse>>>(
    `/blogs/me?${params.toString()}`
  );
};

export const approveBlog = (blogId: number) => {
  return axiosClient.post<ApiResponse<void>>(`/blogs/approve/${blogId}`);
};

export const deleteBlog = (blogId: number) => {
  return axiosClient.delete<ApiResponse<void>>(`/blogs/${blogId}`);
};
