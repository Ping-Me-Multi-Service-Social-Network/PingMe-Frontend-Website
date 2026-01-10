import axiosClient from "@/lib/axiosClient";
import type { Song } from "@/types/music/song";
import type { TopSongPlayCounter, SongResponseWithAllAlbum } from "@/types/music";
import type { ApiResponse } from "@/types/base/apiResponse";

export const songApi = {
  getTopSongs: async (number = 10) => {
    const response = await axiosClient.get<ApiResponse<SongResponseWithAllAlbum[]>>(
      `/songs/getTopSong/${number}`
    );
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getSongById: async (id: number) => {
    const response = await axiosClient.get<ApiResponse<Song>>(`/songs/${id}`);
    return response.data.data;
  },

  searchSongByTitle: async (title: string) => {
    const response = await axiosClient.get<ApiResponse<Song[]>>(`/songs/search?title=${title}`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  // Rankings endpoints (đã wrap ApiResponse)
  getTopSongsToday: async (limit = 50) => {
    const response = await axiosClient.get<ApiResponse<TopSongPlayCounter[]>>(
      `/top-songs/today?limit=${limit}`
    );
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getTopSongsThisWeek: async (limit = 50) => {
    const response = await axiosClient.get<ApiResponse<TopSongPlayCounter[]>>(
      `/top-songs/week?limit=${limit}`
    );
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getTopSongsThisMonth: async (limit = 50) => {
    const response = await axiosClient.get<ApiResponse<TopSongPlayCounter[]>>(
      `/top-songs/month?limit=${limit}`
    );
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },
};