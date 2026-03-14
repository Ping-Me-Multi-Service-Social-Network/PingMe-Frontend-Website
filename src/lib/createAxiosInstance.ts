import axios, {
    type AxiosInstance,
    type InternalAxiosRequestConfig,
    type AxiosError,
} from "axios";
import type { DefaultAuthResponse } from "@/types/authentication";
import { getSessionMetaRequest } from "@/utils/sessionMetaHandler";

export interface AxiosInterceptorOptions {
    onTokenRefreshed?: (payload: DefaultAuthResponse) => void;
    onLogout?: () => void;
}

interface RetryableRequest extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

/**
 * Factory: tạo một axios instance với interceptors auth token dùng chung.
 * Mỗi instance có refresh promise riêng để tránh xung đột giữa các service.
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

    // ============================================================
    // REDUX BRIDGE (scoped per instance)
    // ============================================================
    let onTokenRefreshed: ((payload: DefaultAuthResponse) => void) | null = null;
    let onLogout: (() => void) | null = null;

    function setup(opts: AxiosInterceptorOptions) {
        onTokenRefreshed = opts.onTokenRefreshed ?? null;
        onLogout = opts.onLogout ?? null;
    }

    // ============================================================
    // SHARED PROMISE (scoped per instance)
    // ============================================================
    let refreshPromise: Promise<string> | null = null;

    const performRefreshToken = async (): Promise<string> => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/auth/refresh`,
                getSessionMetaRequest(),
                { withCredentials: true },
            );

            const payload = response.data.data as DefaultAuthResponse;

            localStorage.setItem("access_token", payload.accessToken);

            if (onTokenRefreshed) onTokenRefreshed(payload);

            return payload.accessToken;
        } catch (error) {
            localStorage.removeItem("access_token");
            if (onLogout) onLogout();
            throw error;
        }
    };

    // ============================================================
    // REQUEST INTERCEPTOR
    // ============================================================
    client.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem("access_token");

            // Nếu có token và không phải API Refresh thì gắn access token vào Header
            if (token && !config.url?.includes("/auth/refresh")) {
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
            const isUnauthorized = status === 401;

            if (!isUnauthorized || !originalRequest || originalRequest._retry) {
                throw error;
            }

            // 2. Chặn Loop
            if (
                originalRequest.url?.includes("/auth/login") ||
                originalRequest.url?.includes("/auth/refresh")
            ) {
                throw error;
            }

            originalRequest._retry = true;

            // 3. Logic Shared Promise
            refreshPromise ??= performRefreshToken().finally(() => {
                refreshPromise = null;
            });

            // Chờ Promise refresh xong
            const newToken = await refreshPromise;

            // Gắn token mới và gọi lại request cũ
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            return client(originalRequest);
        },
    );

    return { client, setup };
}
