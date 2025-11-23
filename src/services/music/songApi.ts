import axiosClient from "@/lib/axiosClient";
import type { Song } from "@/types/music/song";

export const songApi = {
  getTopSongs: async (number = 10) => {
    const response = await axiosClient.get<Song[]>(
      `/songs/getTopSong/${number}`
    );
    return response.data;
  },

  getSongById: async (id: number) => {
    const response = await axiosClient.get<Song>(`/songs/${id}`);
    return response.data;
  },

  searchSongByTitle: async (title: string) => {
    const response = await axiosClient.get<Song[]>(`/songs/search/${title}`);
    return response.data;
  },
};
