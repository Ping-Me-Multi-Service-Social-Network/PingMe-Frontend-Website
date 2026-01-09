import axiosClient from "@/lib/axiosClient.ts";
import type { ApiResponse } from "@/types/common/apiResponse";
import type { UserSummaryResponse } from "@/types/common/userSummary";
import type { UserSummarySimpleResponse } from "@/types/common/userSummarySimpleResponse";

export const lookupApi = (email: string) => {
  return axiosClient.get<ApiResponse<UserSummaryResponse>>(
    `/users/lookup/${email}`
  );
};

export const lookupByIdApi = (id: number) => {
  return axiosClient.get<ApiResponse<UserSummarySimpleResponse>>(
    `/users/lookup/id?id=${id}`
  );
};
