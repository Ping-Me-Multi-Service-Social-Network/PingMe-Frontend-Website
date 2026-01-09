import axios from "axios";
import type { InternalAxiosRequestConfig, AxiosError } from "axios";
import type { ApiResponse } from "@/types/base/apiResponse";
import { getValidAccessToken } from "@/utils/jwtDecodeHandler";
import type { DefaultAuthResponse } from "@/types/authentication";

// ============================================================
// Cấu hình cơ bản
// ============================================================
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  withCredentials: true,
});

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
// Cơ chế hàng đợi xử lý request bị lỗi 401 trong khi refresh token:
// - failedQueue lưu các request bị 401
// - Khi refresh thành công → resolve queue
// - Khi refresh fail → reject toàn bộ queue
// ============================================================
type FailedRequest = {
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
};
let failedQueue: FailedRequest[] = [];
const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    token ? resolve(token) : reject(error)
  );
  failedQueue = [];
};

// ============================================================
// Response Interceptor
// ============================================================
let isRefreshing = false;

axiosClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const payload = error.response?.data as ApiResponse<unknown> | undefined;
    const code = payload?.errorCode ?? "";
    const isUnauthorized = error.response?.status === 401 && code == 1102;

    if (!original || original._retry || !isUnauthorized)
      return Promise.reject(error);
    original._retry = true;

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) =>
        failedQueue.push({ resolve, reject })
      ).then((token) => {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${token}`;
        return axiosClient(original);
      });
    }

    isRefreshing = true;
    try {
      const result = await getValidAccessToken();
      if (result.type === "refreshed") onTokenRefreshed?.(result.payload);

      const token = result.accessToken;
      processQueue(null, token);

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${token}`;
      return axiosClient(original);
    } catch (e) {
      onLogout?.();
      processQueue(e, null);
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

// ============================================================
// Request Interceptor
// ============================================================
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

export default axiosClient;
