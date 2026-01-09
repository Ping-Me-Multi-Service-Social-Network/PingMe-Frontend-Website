import type { ApiResponse } from "@/types/base/apiResponse";
import type {
  DefaultAuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types/authentication";
import { getSessionMetaRequest } from "@/utils/sessionMetaHandler.ts";
import axios from "axios";

export const registerLocalApi = (data: RegisterRequest) => {
  return axios.post<ApiResponse<DefaultAuthResponse>>(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/auth/register`,
    data,
    { withCredentials: true }
  );
};

export const loginLocalApi = (data: LoginRequest) => {
  data.submitSessionMetaRequest = getSessionMetaRequest();

  return axios.post<ApiResponse<DefaultAuthResponse>>(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/auth/login`,
    data,
    { withCredentials: true }
  );
};

export const logoutApi = () => {
  return axios.post(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/auth/logout`,
    {},
    { withCredentials: true }
  );
};

export const refreshSessionApi = () => {
  const sessionMetaRequest = getSessionMetaRequest();
  return axios.post<ApiResponse<DefaultAuthResponse>>(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/auth/refresh`,
    sessionMetaRequest,
    { withCredentials: true }
  );
};
