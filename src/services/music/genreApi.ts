import axiosMusicClient from "@/lib/axiosMusicClient";
import type { Genre } from "@/types/music/genre";
import type { ApiResponse, PageResponse } from "@/types/base/apiResponse";

export const genreApi = {
  /**
   * Get all genres
   * @returns Array of genres (unwrapped from ApiResponse<PageResponse>)
   */
  getAllGenres: async (): Promise<Genre[]> => {
    const response =
      await axiosMusicClient.get<ApiResponse<PageResponse<Genre>>>("/music-service/genres/all");
    return response.data?.data?.content || response.data?.data || [];
  },
};
