import aiCrawlerClient from "@/lib/aiCrawlerClient";
import type {
  CreateCrawlRoomResponse,
  CrawlStatusResponse,
  CrawlChatResponse,
  CrawlRecrawlResponse,
} from "@/types/ai-crawler/crawlRoom";
import type { AxiosError } from "axios";

/**
 * Extracts error message from backend `{ error }` envelope or falls back to
 * a generic network error string.
 */
function handleError(err: unknown): never {
  const axiosErr = err as AxiosError<{ error?: string }>;

  if (axiosErr.response?.data?.error) {
    throw new Error(axiosErr.response.data.error);
  }

  if (axiosErr.message) {
    throw new Error(`Lỗi kết nối: ${axiosErr.message}`);
  }

  throw new Error("Đã xảy ra lỗi không xác định");
}

export const aiCrawlerService = {
  /**
   * Tạo room crawl mới.
   * POST /api/rooms  { url }
   */
  createRoom: async (url: string): Promise<CreateCrawlRoomResponse> => {
    try {
      const res = await aiCrawlerClient.post<CreateCrawlRoomResponse>(
        "/api/rooms",
        { url },
      );
      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  /**
   * Kiểm tra trạng thái crawl.
   * GET /api/rooms/{roomId}/status
   */
  getStatus: async (roomId: number): Promise<CrawlStatusResponse> => {
    try {
      const res = await aiCrawlerClient.get<CrawlStatusResponse>(
        `/api/rooms/${roomId}/status`,
      );
      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  /**
   * Chat với AI để tạo widget.
   * POST /api/rooms/{roomId}/chat  { query }
   */
  chat: async (roomId: number, query: string): Promise<CrawlChatResponse> => {
    try {
      const res = await aiCrawlerClient.post<CrawlChatResponse>(
        `/api/rooms/${roomId}/chat`,
        { query },
      );
      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  /**
   * Cào lại dữ liệu.
   * POST /api/rooms/{roomId}/recrawl
   */
  recrawl: async (roomId: number): Promise<CrawlRecrawlResponse> => {
    try {
      const res = await aiCrawlerClient.post<CrawlRecrawlResponse>(
        `/api/rooms/${roomId}/recrawl`,
      );
      return res.data;
    } catch (err) {
      handleError(err);
    }
  },
};
