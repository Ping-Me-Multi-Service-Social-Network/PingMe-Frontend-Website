// =============================
// MAIN INTERFACE

import type { AccountStatusType } from "../common/userSummary";

// =============================
export interface DefaultAuthResponse {
  accessToken: string;
  userSession: CurrentUserSessionResponse;
}

export interface CurrentUserSessionResponse {
  id: number;
  email: string;
  name: string;
  avatarUrl: string;
  updatedAt: string;
  roleName: string | null;
}

export interface CurrentUserProfileResponse {
  email: string;
  name: string;
  avatarUrl: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  dob?: string;
  roleName: string | null;
  accountStatus: AccountStatusType | null;
}

export interface RegisterRequest {
  email: string;
  name: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  password: string;
  turnstileToken: string;
  address?: string;
  dob?: string;
}

export interface DefaultLoginRequest {
  email: string;
  password: string;
  turnstileToken: string;
  submitSessionMetaRequest?: SubmitSessionMetaRequest;
}

export interface SubmitSessionMetaRequest {
  deviceType?: string;
  browser?: string;
  os?: string;
}

export interface CurrentUserSessionMetaResponse {
  sessionId: string;
  deviceType: string;
  browser: string;
  os: string;
  lastActiveAt: string;
  current: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangeProfileRequest {
  name: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  dob?: string;
}
