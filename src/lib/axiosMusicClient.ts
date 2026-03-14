import { createAxiosInstance } from "./createAxiosInstance";
import type { AxiosInterceptorOptions } from "./createAxiosInstance";

const { client: axiosMusicClient, setup } = createAxiosInstance(
    import.meta.env.VITE_MUSIC_SERVICE_BASE_URL,
);

export function setupMusicAxiosInterceptors(opts: AxiosInterceptorOptions) {
    setup(opts);
}

export default axiosMusicClient;
