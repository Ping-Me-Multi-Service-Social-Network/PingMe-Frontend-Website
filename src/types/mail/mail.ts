export interface SendOtpRequest {
  email: string;
  otpType: "USER_FORGET_PASSWORD" | "ADMIN_VERIFICATION" | "ACCOUNT_ACTIVATION";
  turnstileToken?: string;
}

export interface SendOtpResponse {
  otp: string;
  mailRecipient: string;
  isSent: boolean;
}

export interface VerifyOtpRequest {
  otp: string;
  mailRecipient: string;
  otpType: "USER_FORGET_PASSWORD" | "ADMIN_VERIFICATION" | "ACCOUNT_ACTIVATION";
}

export interface VerifyOtpResponse {
  isValid: boolean;
  resetPasswordToken: string | null;
}

export interface ResetPasswordRequest {
  newPassword: string;
  confirmNewPassword: string;
  resetPasswordToken: string;
}

export interface ResetPasswordResponse {
  isPasswordChanged: boolean;
}
