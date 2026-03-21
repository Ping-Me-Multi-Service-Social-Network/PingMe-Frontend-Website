import { createAxiosInstance } from "./createAxiosInstance";
import type { AxiosInterceptorOptions } from "./createAxiosInstance";

const { client: axiosReelClient, setup } = createAxiosInstance(
    import.meta.env.VITE_REEL_SERVICE_BASE_URL,
);

export function setupReelAxiosInterceptors(opts: AxiosInterceptorOptions) {
    setup(opts);
}

export default axiosReelClient;
