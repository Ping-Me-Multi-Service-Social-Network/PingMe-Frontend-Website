import axiosClient from "@/lib/axiosClient";
import type { Genre } from "@/types/music/genre";

export const genreApi = {
  getAllGenres: async () => {
    const response = await axiosClient.get<Genre[]>("/genres/all");
    return response.data;
  },
};
