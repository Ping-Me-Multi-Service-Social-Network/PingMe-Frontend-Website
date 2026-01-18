import axiosClient from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/base/apiResponse";
import type {
  SongResponseWithAllAlbum,
  AlbumResponse,
  ArtistResponse,
} from "@/types/music";

const BASE_URL = "";

/**
 * Search service for music-related search operations
 */
export const searchService = {
  /**
   * Search all music entities by query
   */
  searchAll: async (query: string) => {
    const response = await axiosClient.get(`${BASE_URL}/search`, {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Get songs by album ID
   */
  getSongsByAlbum: async (
    albumId: number,
  ): Promise<SongResponseWithAllAlbum[]> => {
    const response = await axiosClient.get<
      ApiResponse<SongResponseWithAllAlbum[]>
    >(`${BASE_URL}/songs/search-by-album`, {
      params: { id: albumId },
    });
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get songs by artist ID
   */
  getSongsByArtist: async (
    artistId: number,
  ): Promise<SongResponseWithAllAlbum[]> => {
    const response = await axiosClient.get<
      ApiResponse<SongResponseWithAllAlbum[]>
    >(`${BASE_URL}/songs/search-by-artist`, {
      params: { id: artistId },
    });
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get songs by genre ID
   */
  getSongsByGenre: async (
    genreId: number,
  ): Promise<SongResponseWithAllAlbum[]> => {
    const response = await axiosClient.get<
      ApiResponse<SongResponseWithAllAlbum[]>
    >(`${BASE_URL}/songs/genre`, {
      params: { id: genreId },
    });
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Search songs by title
   */
  searchSongs: async (query: string): Promise<SongResponseWithAllAlbum[]> => {
    const response = await axiosClient.get<
      ApiResponse<SongResponseWithAllAlbum[]>
    >(`${BASE_URL}/songs/search`, {
      params: { title: query },
    });
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Search albums by name
   */
  searchAlbums: async (query: string): Promise<AlbumResponse[]> => {
    const response = await axiosClient.get<ApiResponse<AlbumResponse[]>>(
      `${BASE_URL}/albums/search`,
      {
        params: { title: query },
      },
    );
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Search artists by name
   */
  searchArtists: async (query: string): Promise<ArtistResponse[]> => {
    const response = await axiosClient.get<ApiResponse<ArtistResponse[]>>(
      `${BASE_URL}/artists/search`,
      {
        params: { name: query },
      },
    );
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },
};
