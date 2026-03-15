import { createAxiosInstance } from "./createAxiosInstance";
import type { AxiosInterceptorOptions } from "./createAxiosInstance";

const { client: axiosAuthClient, setup } = createAxiosInstance(
    import.meta.env.VITE_AUTH_SERVICE_BASE_URL,
);

export function setupAuthAxiosInterceptors(opts: AxiosInterceptorOptions) {
    setup(opts);
}

export default axiosAuthClient;
