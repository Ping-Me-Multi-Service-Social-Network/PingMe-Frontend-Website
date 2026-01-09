import axiosClient from "@/lib/axiosClient.ts";
import type {ApiResponse} from "@/types/base/apiResponse";
import type {
    ChangePasswordRequest, ChangeProfileRequest,
    CurrentUserProfileResponse,
    CurrentUserSessionResponse
} from "@/types/authentication";

export const getCurrentUserSessionApi = () => {
    return axiosClient.get<ApiResponse<CurrentUserSessionResponse>>("/users/me");
};

export const getCurrentUserInfoApi = () => {
    return axiosClient.get<ApiResponse<CurrentUserProfileResponse>>(
        "/users/me/info"
    );
};

export const updateCurrentUserPasswordApi = (
    changePasswordRequest: ChangePasswordRequest
) => {
    return axiosClient.post<ApiResponse<CurrentUserSessionResponse>>(
        "/users/me/password",
        changePasswordRequest
    );
};

export const updateCurrentUserProfileApi = (
    changeProfileRequest: ChangeProfileRequest
) => {
    return axiosClient.post<ApiResponse<CurrentUserSessionResponse>>(
        "/users/me/profile",
        changeProfileRequest
    );
};

export const updateCurrentUserAvatarApi = (data: FormData) => {
    return axiosClient.post<ApiResponse<CurrentUserSessionResponse>>(
        "/auth/me/avatar",
        data
    );
};