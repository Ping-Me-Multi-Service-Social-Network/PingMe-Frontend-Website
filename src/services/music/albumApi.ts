import axiosMusicClient from "@/lib/axiosMusicClient";
import type { ApiResponse, PageResponse } from "@/types/base/apiResponse";
import type { AlbumResponse as SharedAlbumResponse } from "@/types/music";

export type AlbumResponse = SharedAlbumResponse;

export const albumApi = {
  getAllAlbums: async (): Promise<ApiResponse<PageResponse<AlbumResponse>>> => {
    const response =
      await axiosMusicClient.get<ApiResponse<PageResponse<AlbumResponse>>>(
        "/music-service/albums/all",
      );
    return response.data;
  },

  getPopularAlbums: async (limit: number = 5): Promise<AlbumResponse[]> => {
    const response =
      await axiosMusicClient.get<ApiResponse<PageResponse<AlbumResponse>>>(
        `/music-service/albums/popular?page=0&size=${limit}`,
      );
    // Lấy content đã phân trang & sort
    return response.data?.data?.content || [];
  },

  incrementPlayCount: async (albumId: number): Promise<void> => {
    await axiosMusicClient.post(`/music-service/albums/${albumId}/play`);
  }
};
