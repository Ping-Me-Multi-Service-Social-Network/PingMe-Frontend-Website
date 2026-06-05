import axios from "axios";

const aiCrawlerClient = axios.create({
  baseURL: import.meta.env.VITE_AI_CRAWLER_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setupAiCrawlerInterceptors() {
  // AI Crawler không dùng cookie/session refresh của PingMe.
}

export default aiCrawlerClient;
