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
};
