import axiosClient from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/base/apiResponse";
import type {
  ResetPasswordRequest,
  ResetPasswordResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "@/types/mail/mail";

export const sendOtpToEmailApi = (data: SendOtpRequest) => {
  return axiosClient.post<ApiResponse<SendOtpResponse>>(
    "/auth-service/otp/send",
    data,
  );
};

export const verifyOtpApi = (data: VerifyOtpRequest) => {
  return axiosClient.post<ApiResponse<VerifyOtpResponse>>(
    "/auth-service/otp/verify",
    data,
  );
};

export const resetPasswordApi = (data: ResetPasswordRequest) => {
  return axiosClient.post<ApiResponse<ResetPasswordResponse>>(
    "/auth-service/auth/reset-password",
    data,
  );
};
