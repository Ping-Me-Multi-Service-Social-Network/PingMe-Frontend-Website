import axios, {
    type AxiosInstance,
    type InternalAxiosRequestConfig,
    type AxiosError,
} from "axios";
import type { DefaultAuthResponse } from "@/types/authentication";
import { refreshAccessToken, setupRefreshTokenManager } from "./refreshTokenManager";

export interface AxiosInterceptorOptions {
    onTokenRefreshed?: (payload: DefaultAuthResponse) => void;
    onLogout?: () => void;
}

interface RetryableRequest extends InternalAxiosRequestConfig {
    _retry?: boolean;
    _retryCount?: number;
}

/**
 * Factory: tạo một axios instance với interceptors auth token dùng chung.
 *
 * @param baseURL - Base URL của service (vd: http://localhost:8080)
 * @returns { client, setup } - axios instance và hàm setup redux bridge
 */
export function createAxiosInstance(baseURL: string): {
    client: AxiosInstance;
    setup: (opts: AxiosInterceptorOptions) => void;
} {
    const client = axios.create({
        baseURL,
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    });

    function setup(opts: AxiosInterceptorOptions) {
        setupRefreshTokenManager(opts);
    }

    // ============================================================
    // REQUEST INTERCEPTOR
    // ============================================================
    client.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem("access_token");

            // Nếu có token và không phải API Refresh thì gắn access token vào Header
            if (token && !config.url?.includes("/auth-service/auth/refresh")) {
                config.headers = config.headers ?? {};
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => { throw error; },
    );

    // ============================================================
    // RESPONSE INTERCEPTOR
    // ============================================================
    client.interceptors.response.use(
        (res) => res,
        async (error: AxiosError) => {
            const originalRequest = error.config as RetryableRequest | undefined;

            // 1. Phân tích lỗi
            const status = error.response?.status;

            // ── Handle 429 Too Many Requests ── auto retry with backoff
            if (status === 429 && originalRequest) {
                const retryCount = originalRequest._retryCount || 0;
                const MAX_RETRIES = 3;

                if (retryCount < MAX_RETRIES) {
                    originalRequest._retryCount = retryCount + 1;

                    const retryAfterHeader = error.response?.headers?.["retry-after"];
                    const delay = retryAfterHeader
                        ? Number.parseInt(retryAfterHeader, 10) * 1000
                        : Math.min(1000 * Math.pow(2, retryCount), 5000);

                    console.warn(
                        `[Axios] 429 Rate Limited — retry ${retryCount + 1}/${MAX_RETRIES} after ${delay}ms`,
                    );

                    await new Promise((resolve) => setTimeout(resolve, delay));
                    return client(originalRequest);
                }
            }

            // ── Handle 401 Unauthorized ──
            const isUnauthorized = status === 401;

            if (!isUnauthorized || !originalRequest || originalRequest._retry) {
                throw error;
            }

            // 2. Chặn Loop
            if (
                originalRequest.url?.includes("/auth-service/auth/login") ||
                originalRequest.url?.includes("/auth-service/auth/refresh")
            ) {
                throw error;
            }

            originalRequest._retry = true;

            // 3. Toàn app dùng chung một refresh promise để tránh refresh song song
            const newToken = await refreshAccessToken(baseURL);

            // Gắn token mới và gọi lại request cũ
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            return client(originalRequest);
        },
    );

    return { client, setup };
}
