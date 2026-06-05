import { createAxiosInstance } from "./createAxiosInstance";
import type { AxiosInterceptorOptions } from "./createAxiosInstance";

const { client: aiCrawlerClient, setup } = createAxiosInstance(
  import.meta.env.VITE_AI_CRAWLER_BASE_URL,
);

export function setupAiCrawlerInterceptors(opts: AxiosInterceptorOptions) {
  setup(opts);
}

export default aiCrawlerClient;
