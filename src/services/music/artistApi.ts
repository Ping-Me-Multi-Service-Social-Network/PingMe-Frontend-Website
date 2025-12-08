import axiosClient from "@/lib/axiosClient";
import type { ArtistResponse } from "@/types/music";

export const artistApi = {
  getAllArtists: async () => {
    const response = await axiosClient.get<ArtistResponse[]>("/artists/all");
    return response.data;
  },

  getPopularArtists: async (limit?: number) => {
    const response = await axiosClient.get<ArtistResponse[]>("/artists/all");
    // Sort by followerCount descending (if available) or just return all
    // Assuming artists might have some sort of popularity metric
    return limit ? response.data.slice(0, limit) : response.data;
  },
};
