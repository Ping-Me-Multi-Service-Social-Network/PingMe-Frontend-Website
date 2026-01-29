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
    "/mail-management/api/v1/mails/send-otp",
    data,
  );
};

export const verifyOtpApi = (data: VerifyOtpRequest) => {
  return axiosClient.post<ApiResponse<VerifyOtpResponse>>(
    "/mail-management/api/v1/mails/otp-verification",
    data,
  );
};

export const resetPasswordApi = (data: ResetPasswordRequest) => {
  return axiosClient.post<ApiResponse<ResetPasswordResponse>>(
    "/auth/forget-password",
    data,
  );
};
