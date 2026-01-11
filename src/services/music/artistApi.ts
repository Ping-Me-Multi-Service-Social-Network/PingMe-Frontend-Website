import axiosClient from "@/lib/axiosClient";
import type { ArtistResponse } from "@/types/music";
import type { ApiResponse } from "@/types/base/apiResponse";

export const artistApi = {
  getAllArtists: async () => {
    const response = await axiosClient.get<ApiResponse<ArtistResponse[]>>("/artists/all");
    return response.data.data; 
  },

  getPopularArtists: async (limit?: number) => {
    const response = await axiosClient.get<ApiResponse<ArtistResponse[]>>("/artists/all");
    const artists = response.data.data || []; 
    return limit ? artists.slice(0, limit) : artists;
  },
};