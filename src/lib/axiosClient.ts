import { createAxiosInstance } from "./createAxiosInstance";
import type { AxiosInterceptorOptions } from "./createAxiosInstance";

const { client: axiosClient, setup } = createAxiosInstance(
  import.meta.env.VITE_BACKEND_BASE_URL,
);

export function setupAxiosInterceptors(opts: AxiosInterceptorOptions) {
  setup(opts);
}

export default axiosClient;
