import axiosClient from "@/lib/axiosClient";
import type { 
  SongResponse, 
  SongResponseWithAllAlbum,
  SongRequest,
  TopSongPlayCounter 
} from "@/types/music";

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const songApi = {
  // ========================= GET BY ID =========================
  getSongById: async (id: number) => {
    const response = await axiosClient.get<SongResponse>(`/songs/${id}`);
    return response.data;
  },

  // ========================= GET ALL =========================
  getAllSongs: async (params?: PaginationParams) => {
    const response = await axiosClient.get<PaginatedResponse<SongResponseWithAllAlbum>>(
      '/songs/all',
      { params }
    );
    return response.data;
  },

  // ========================= SEARCH BY TITLE =========================
  searchSongByTitle: async (title: string, params?: PaginationParams) => {
    const response = await axiosClient.get<PaginatedResponse<SongResponse>>(
      '/songs/search',
      { params: { ...params, title } }
    );
    return response.data;
  },

  // ========================= SEARCH BY ALBUM =========================
  getSongsByAlbum: async (albumId: number, params?: PaginationParams) => {
    const response = await axiosClient.get<PaginatedResponse<SongResponseWithAllAlbum>>(
      '/songs/search-by-album',
      { params: { ...params, id: albumId } }
    );
    return response.data;
  },

  // ========================= SEARCH BY ARTIST =========================
  getSongsByArtist: async (artistId: number, params?: PaginationParams) => {
    const response = await axiosClient.get<PaginatedResponse<SongResponseWithAllAlbum>>(
      '/songs/search-by-artist',
      { params: { ...params, id: artistId } }
    );
    return response.data;
  },

  // ========================= TOP PLAYED =========================
  getTopSongs: async (number = 10) => {
    const response = await axiosClient.get<SongResponseWithAllAlbum[]>(
      `/songs/getTopSong/${number}`
    );
    return response.data;
  },

  // ========================= SEARCH BY GENRE =========================
  getSongsByGenre: async (genreId: number, params?: PaginationParams) => {
    const response = await axiosClient.get<PaginatedResponse<SongResponseWithAllAlbum>>(
      '/songs/genre',
      { params: { ...params, id: genreId } }
    );
    return response.data;
  },

  // ========================= SAVE SONG =========================
  saveSong: async (
    songRequest: SongRequest,
    musicFile: File,
    imgFile: File
  ) => {
    const formData = new FormData();
    formData.append('songRequest', new Blob([JSON.stringify(songRequest)], { type: 'application/json' }));
    formData.append('musicFile', musicFile);
    formData.append('imgFile', imgFile);

    const response = await axiosClient.post<SongResponse[]>(
      '/songs/save',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // ========================= UPDATE SONG =========================
  updateSong: async (
    id: number,
    songRequest: SongRequest,
    musicFile?: File,
    imgFile?: File
  ) => {
    const formData = new FormData();
    formData.append('songRequest', new Blob([JSON.stringify(songRequest)], { type: 'application/json' }));
    
    if (musicFile) {
      formData.append('musicFile', musicFile);
    }
    if (imgFile) {
      formData.append('imgFile', imgFile);
    }

    const response = await axiosClient.put<SongResponse[]>(
      `/songs/update/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // ========================= SOFT DELETE =========================
  softDelete: async (id: number) => {
    await axiosClient.delete(`/songs/soft-delete/${id}`);
  },

  // ========================= HARD DELETE =========================
  hardDelete: async (id: number) => {
    await axiosClient.delete(`/songs/hard-delete/${id}`);
  },

  // ========================= RESTORE =========================
  restore: async (id: number) => {
    await axiosClient.put(`/songs/restore/${id}`);
  },

  // ========================= PLAY COUNT =========================
  increasePlayCount: async (id: number) => {
    await axiosClient.post(`/songs/${id}/play`);
  },

  // ========================= RANKINGS ENDPOINTS =========================
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
