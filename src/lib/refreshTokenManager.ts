import axios from "axios";
import type { DefaultAuthResponse } from "@/types/authentication";
import { getSessionMetaRequest } from "@/utils/sessionMetaHandler";

export interface RefreshTokenManagerOptions {
  onTokenRefreshed?: (payload: DefaultAuthResponse) => void;
  onLogout?: () => void;
}

let onTokenRefreshed: ((payload: DefaultAuthResponse) => void) | null = null;
let onLogout: (() => void) | null = null;
let refreshPromise: Promise<string> | null = null;

export function setupRefreshTokenManager(opts: RefreshTokenManagerOptions) {
  onTokenRefreshed = opts.onTokenRefreshed ?? null;
  onLogout = opts.onLogout ?? null;
}

async function performRefresh(baseURL: string): Promise<string> {
  try {
    const response = await axios.post(
      `${baseURL}/auth-service/auth/refresh`,
      getSessionMetaRequest(),
      { withCredentials: true },
    );

    const payload = response.data.data as DefaultAuthResponse;
    localStorage.setItem("access_token", payload.accessToken);

    onTokenRefreshed?.(payload);

    return payload.accessToken;
  } catch (error) {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;

    // Chỉ xem như phiên hết hạn khi refresh token bị từ chối rõ ràng.
    if (status === 401 || status === 403) {
      localStorage.removeItem("access_token");
      onLogout?.();
    }

    throw error;
  }
}

export function refreshAccessToken(baseURL: string): Promise<string> {
  refreshPromise ??= performRefresh(baseURL).finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}
