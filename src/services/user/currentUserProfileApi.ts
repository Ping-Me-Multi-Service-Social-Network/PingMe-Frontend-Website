import axiosAuthClient from "@/lib/axiosAuthClient";
import type { ApiResponse } from "@/types/base/apiResponse";
import type {
  ChangePasswordRequest,
  ChangeProfileRequest,
  CurrentUserProfileResponse,
  CurrentUserSessionResponse,
} from "@/types/authentication";

export const getCurrentUserSessionApi = () => {
  return axiosAuthClient.get<ApiResponse<CurrentUserSessionResponse>>(
    "/auth-service/users/me",
  );
};

export const getCurrentUserInfoApi = () => {
  return axiosAuthClient.get<ApiResponse<CurrentUserProfileResponse>>(
    "/auth-service/users/me/info",
  );
};

export const updateCurrentUserPasswordApi = (
  changePasswordRequest: ChangePasswordRequest,
) => {
  return axiosAuthClient.post<ApiResponse<CurrentUserSessionResponse>>(
    "/auth-service/users/me/password",
    changePasswordRequest,
  );
};

export const updateCurrentUserProfileApi = (
  changeProfileRequest: ChangeProfileRequest,
) => {
  return axiosAuthClient.post<ApiResponse<CurrentUserSessionResponse>>(
    "/auth-service/users/me/profile",
    changeProfileRequest,
  );
};

export const updateCurrentUserAvatarApi = (data: FormData) => {
  return axiosAuthClient.post<ApiResponse<CurrentUserSessionResponse>>(
    "/auth-service/users/me/avatar",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};

export const activateAccountApi = () => {
  return axiosAuthClient.post<ApiResponse<{ isActivated: boolean }>>(
    "/auth-service/users/me/activate",
  );
};
