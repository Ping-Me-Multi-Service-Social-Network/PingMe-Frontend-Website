import axiosClient from "@/lib/axiosClient.ts";
import type { ApiResponse } from "@/types/base/apiResponse";
import type { UserSummaryResponse } from "@/types/common/userSummary";
import type { UserSummarySimpleResponse } from "@/types/common/userSummarySimpleResponse";

export const lookupApi = (email: string) => {
  return axiosClient.get<ApiResponse<UserSummaryResponse>>(
    `/core-service/users/lookup/${email}`
  );
};

export const lookupByIdApi = (id: number) => {
  return axiosClient.get<ApiResponse<UserSummarySimpleResponse>>(
    `/core-service/users/lookup/id?id=${id}`
  );
};
