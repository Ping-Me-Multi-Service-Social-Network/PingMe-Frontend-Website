import axiosAuthClient from "@/lib/axiosAuthClient";
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
  return axiosAuthClient.post<ApiResponse<SendOtpResponse>>(
    "/auth-service/otp/send",
    data,
  );
};

export const verifyOtpApi = (data: VerifyOtpRequest) => {
  return axiosAuthClient.post<ApiResponse<VerifyOtpResponse>>(
    "/auth-service/otp/verify",
    data,
  );
};

export const resetPasswordApi = (data: ResetPasswordRequest) => {
  return axiosAuthClient.post<ApiResponse<ResetPasswordResponse>>(
    "/auth-service/auth/forget-password",
    data,
  );
};
