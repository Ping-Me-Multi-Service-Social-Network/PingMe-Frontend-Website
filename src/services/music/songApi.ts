import axiosClient from "@/lib/axiosClient";
import type { Song } from "@/types/music/song";
import type { TopSongPlayCounter } from "@/types/music";

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

  // Rankings endpoints
  getTopSongsToday: async (limit = 50) => {
    const response = await axiosClient.get<TopSongPlayCounter[]>(
      `/top-songs/today?limit=${limit}`
    );
    return response.data;
  },

  getTopSongsThisWeek: async (limit = 50) => {
    const response = await axiosClient.get<TopSongPlayCounter[]>(
      `/top-songs/week?limit=${limit}`
    );
    return response.data;
  },

  getTopSongsThisMonth: async (limit = 50) => {
    const response = await axiosClient.get<TopSongPlayCounter[]>(
      `/top-songs/month?limit=${limit}`
    );
    return response.data;
  },
};
