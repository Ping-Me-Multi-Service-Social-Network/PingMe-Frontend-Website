import axiosClient from "@/lib/axiosClient";

export interface AlbumResponse {
  id: number;
  title: string;
  coverImgUrl: string;
  playCount: number;
}

export const albumApi = {
  getAllAlbums: async () => {
    const response = await axiosClient.get<AlbumResponse[]>("/albums/all");
    return response.data;
  },

  getPopularAlbums: async (limit?: number) => {
    const response = await axiosClient.get<AlbumResponse[]>("/albums/all");
    // Sort by playCount descending and limit the results
    const sortedAlbums = response.data.sort((a, b) => b.playCount - a.playCount);
    return limit ? sortedAlbums.slice(0, limit) : sortedAlbums;
  },
};
