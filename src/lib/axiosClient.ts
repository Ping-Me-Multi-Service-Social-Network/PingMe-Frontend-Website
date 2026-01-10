import axios, { type InternalAxiosRequestConfig, type AxiosError } from "axios";
import type { ApiResponse } from "@/types/base/apiResponse";
import type { DefaultAuthResponse } from "@/types/authentication";
import { getSessionMetaRequest } from "@/utils/sessionMetaHandler";

// 1. Cấu hình cơ bản
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// REDUX BRIDGE
// ============================================================
let onTokenRefreshed: ((payload: DefaultAuthResponse) => void) | null = null;
let onLogout: (() => void) | null = null;

export function setupAxiosInterceptors(opts: {
  onTokenRefreshed?: (payload: DefaultAuthResponse) => void;
  onLogout?: () => void;
}) {
  onTokenRefreshed = opts.onTokenRefreshed ?? null;
  onLogout = opts.onLogout ?? null;
}

// ============================================================
// SHARED PROMISE
// ============================================================
let refreshPromise: Promise<string> | null = null;

const performRefreshToken = async (): Promise<string> => {
  try {
    // Gọi API Refresh
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_BASE_URL}/auth/refresh`,
      getSessionMetaRequest(),
      { withCredentials: true }
    );

    const payload = response.data.data as DefaultAuthResponse;

    // Lưu token mới vào LocalStorage
    localStorage.setItem("access_token", payload.accessToken);

    if (onTokenRefreshed) {
      onTokenRefreshed(payload);
    }

    return payload.accessToken;
  } catch (error) {
    localStorage.removeItem("access_token");
    if (onLogout) {
      onLogout();
    }
    throw error;
  }
};

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    // Nếu có token và không phải API Refresh thì
    // gắn vào access token vào Header
    if (token && !config.url?.includes("/auth/refresh")) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================
axiosClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 1. Phân tích lỗi
    const payload = error.response?.data as ApiResponse<unknown> | undefined;
    const code = payload?.errorCode;

    // Điều kiện: 401 VÀ ErrorCode 1102 (Token Expired)
    const isTokenExpired = error.response?.status === 401 && code == 1102;

    if (!isTokenExpired || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 2. Chặn Loop
    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // 3. Logic Shared Promise
    if (!refreshPromise) {
      refreshPromise = performRefreshToken().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      // Chờ Promise refresh xong
      const newToken = await refreshPromise;

      // Gắn token mới và gọi lại request cũ
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return axiosClient(originalRequest);
    } catch (e) {
      return Promise.reject(e);
    }
  }
);

export default axiosClient;
