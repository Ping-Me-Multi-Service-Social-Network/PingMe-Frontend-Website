import axiosClient from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/base/apiResponse";
import type {
  DefaultAuthResponse,
  DefaultLoginRequest,
  RegisterRequest,
} from "@/types/authentication";
import { getSessionMetaRequest } from "@/utils/sessionMetaHandler";

// 1. REGISTER
export const registerLocalApi = (data: RegisterRequest) => {
  return axiosClient.post<ApiResponse<DefaultAuthResponse>>(
    "/auth/register",
    data,
  );
};

// LOGIN
export const loginLocalApi = (data: DefaultLoginRequest) => {
  data.submitSessionMetaRequest = getSessionMetaRequest();

  return axiosClient.post<ApiResponse<DefaultAuthResponse>>(
    "/auth/login",
    data,
  );
};

// LOGOUT
export const logoutApi = () => {
  return axiosClient.post("/auth/logout");
};
