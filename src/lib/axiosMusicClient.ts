import axios, { type InternalAxiosRequestConfig, type AxiosError } from "axios";
import type { DefaultAuthResponse } from "@/types/authentication";
import { getSessionMetaRequest } from "@/utils/sessionMetaHandler";

/**
 * Axios instance riêng cho Music Service (http://localhost:8081)
 * Khi có API Gateway, chỉ cần đổi VITE_MUSIC_SERVICE_BASE_URL về URL gateway.
 */
const axiosMusicClient = axios.create({
    baseURL: import.meta.env.VITE_MUSIC_SERVICE_BASE_URL,
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

export function setupMusicAxiosInterceptors(opts: {
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
        if (onLogout) {
            onLogout();
        }
        throw error;
    }
};

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================
axiosMusicClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");

        if (token && !config.url?.includes("/auth/refresh")) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================
axiosMusicClient.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        const status = error.response?.status;
        const isUnauthorized = status === 401;

        if (!isUnauthorized || !originalRequest || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/refresh")
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (!refreshPromise) {
            refreshPromise = performRefreshToken().finally(() => {
                refreshPromise = null;
            });
        }

        try {
            const newToken = await refreshPromise;

            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            return axiosMusicClient(originalRequest);
        } catch (e) {
            return Promise.reject(e);
        }
    },
);

export default axiosMusicClient;
