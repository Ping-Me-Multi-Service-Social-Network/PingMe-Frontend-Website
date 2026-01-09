import axiosClient from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/base/apiResponse";

export interface AlbumResponse {
  id: number;
  title: string;
  coverImgUrl: string;
  playCount: number;
}

export const albumApi = {
  getAllAlbums: async () => {
    const response = await axiosClient.get<ApiResponse<AlbumResponse[]>>("/albums/all");
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getPopularAlbums: async (limit?: number) => {
    const response = await axiosClient.get<ApiResponse<AlbumResponse[]>>("/albums/all");
    const data = response.data.data || response.data;
    const albums = Array.isArray(data) ? data : [];
    const sortedAlbums = albums.sort((a, b) => b.playCount - a.playCount);
    return limit ? sortedAlbums.slice(0, limit) : sortedAlbums;
  },
};