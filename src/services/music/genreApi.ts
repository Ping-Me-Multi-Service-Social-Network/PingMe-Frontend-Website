import axiosClient from "@/lib/axiosClient";
import type { Genre } from "@/types/music/genre";
import type { ApiResponse } from "@/types/base/apiResponse";

export const genreApi = {
  getAllGenres: async () => {
    const response = await axiosClient.get<ApiResponse<Genre[]>>("/genres/all");
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },
};