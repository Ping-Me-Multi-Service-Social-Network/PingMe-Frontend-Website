export interface CreateCrawlRoomRequest {
  url: string;
}

export interface CreateCrawlRoomResponse {
  room_id: number;
  message: string;
}

export interface CrawlStatusResponse {
  status: "crawling" | "success" | "failed";
  error_message?: string | null;
  pages_crawled: number;
  total_pages: number;
}

export interface CrawlChatRequest {
  query: string;
}

export interface CrawlWidgetProduct {
  name?: string;
  title?: string;
  price?: string;
  image_url?: string;
}

export interface CrawlWidget {
  title?: string;
  description?: string;
  products?: CrawlWidgetProduct[];
  items?: CrawlWidgetProduct[];
}

export interface CrawlChatResponse {
  widget: CrawlWidget;
}

export interface CrawlRecrawlResponse {
  message: string;
}

export interface CrawlErrorResponse {
  error: string;
}
