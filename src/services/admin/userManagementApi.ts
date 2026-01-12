import axiosClient from "@/lib/axiosClient.ts";
import type {
  ApiResponse,
  PageResponse,
  PaginationParams,
} from "@/types/base/apiResponse";
import type { UserSummaryResponse } from "@/types/common/userSummary";

export interface UserPaginationParams extends PaginationParams {
  search?: string;
  status?: string;
}

export const getAllUsers = (params: UserPaginationParams) => {
  return axiosClient.get<ApiResponse<PageResponse<UserSummaryResponse>>>(
    "/users",
    {
      params: {
        page: params.page,
        size: params.size,
        sort: params.filter || "id,desc",
      },
    }
  );
};

export const deleteUser = (id: number) => {
  return axiosClient.delete(`/users/${id}`);
};
