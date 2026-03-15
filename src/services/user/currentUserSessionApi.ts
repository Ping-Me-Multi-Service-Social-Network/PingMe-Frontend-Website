import type { ApiResponse } from "@/types/base/apiResponse";
import type {
  CurrentUserSessionMetaResponse,
  CurrentUserSessionResponse,
} from "@/types/authentication";
import axiosAuthClient from "@/lib/axiosAuthClient";

export const getCurrentUserAllDeviceMetasApi = () => {
  return axiosAuthClient.get<ApiResponse<CurrentUserSessionMetaResponse[]>>(
    "/auth-service/users/me/sessions",
  );
};

export const deleteCurrentUserDeviceMetaApi = (sessionId: string) => {
  return axiosAuthClient.delete<ApiResponse<CurrentUserSessionResponse>>(
    `/auth-service/users/me/sessions/${sessionId}`,
  );
};
