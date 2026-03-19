import axiosMusicClient from "@/lib/axiosMusicClient";
import type { ApiResponse, PageResponse } from "@/types/base/apiResponse";

export interface AlbumResponse {
  id: number;
  title: string;
  coverImgUrl?: string; // Tương thích với interface cũ
  coverImageUrl?: string; // Mới từ backend
  playCount: number;
}

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
    const albums = response.data?.data?.content || [];
    
    // Đảm bảo tương thích mapping 
    return albums.map(album => ({
      ...album,
      coverImgUrl: album.coverImgUrl || album.coverImageUrl || "",
    }));
  },

  incrementPlayCount: async (albumId: number): Promise<void> => {
    await axiosMusicClient.post(`/music-service/albums/${albumId}/play`);
  }
};
