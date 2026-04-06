import axiosClient from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/base/apiResponse";
import type {
  DefaultAuthResponse,
  DefaultLoginRequest,
  RegisterRequest,
} from "@/types/authentication";
import { getSessionMetaRequest } from "@/utils/sessionMetaHandler";

// ============================================================================
// 1. AUTHENTICATION
// ============================================================================

export const registerLocalApi = (data: RegisterRequest) => {
  return axiosClient.post<ApiResponse<DefaultAuthResponse>>(
    "/auth-service/auth/register",
    data,
  );
};

export const checkEmailExistsApi = (email: string) => {
  return axiosClient.get<ApiResponse<{ exists: boolean }>>(
    `/auth-service/auth/check-email?email=${encodeURIComponent(email)}`,
  );
};


export const loginLocalApi = (data: DefaultLoginRequest) => {
  data.submitSessionMetaRequest = getSessionMetaRequest();

  return axiosClient.post<ApiResponse<DefaultAuthResponse>>(
    "/auth-service/auth/login",
    data,
  );
};

export const logoutApi = () => {
  return axiosClient.post("/auth-service/auth/logout");
};

export const refreshApi = () => {
  return axiosClient.post<ApiResponse<DefaultAuthResponse>>(
    "/auth-service/auth/refresh",
    getSessionMetaRequest(),
  );
};

// ============================================================================
// 2. ADMIN AUTHENTICATION
// ============================================================================

export const adminLoginApi = (data: DefaultLoginRequest) => {
  data.submitSessionMetaRequest = getSessionMetaRequest();

  return axiosClient.post<ApiResponse<DefaultAuthResponse>>(
    "/auth-service/auth/admin/login",
    data,
  );
};

// ============================================================================
// 3. MOBILE AUTHENTICATION
// ============================================================================

export const mobileLoginApi = (data: DefaultLoginRequest) => {
  data.submitSessionMetaRequest = getSessionMetaRequest();

  return axiosClient.post<ApiResponse<DefaultAuthResponse>>(
    "/auth-service/auth/mobile/login",
    data,
  );
};

export const mobileRefreshApi = () => {
  return axiosClient.post<ApiResponse<DefaultAuthResponse>>(
    "/auth-service/auth/mobile/refresh",
    getSessionMetaRequest(),
  );
};

// ============================================================================
// 4. OTP
// ============================================================================

export const getOtpAdminStatusApi = () => {
  return axiosClient.get<ApiResponse<{ isEnabled: boolean }>>(
    "/auth-service/otp/admin/status",
  );
};

export const sendOtpApi = (data: { email: string; type?: string }) => {
  return axiosClient.post<ApiResponse<any>>("/auth-service/otp/send", data);
};

export const verifyOtpApi = (data: { email: string; otp: string; type?: string }) => {
  return axiosClient.post<ApiResponse<any>>("/auth-service/otp/verify", data);
};
