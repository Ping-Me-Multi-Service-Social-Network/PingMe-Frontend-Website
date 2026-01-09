import axiosClient from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/base/apiResponse";
import type {
  SongResponse,
  SongResponseWithAllAlbum,
  ArtistResponse,
  AlbumResponse,
  GenreResponse,
  SongRequest,
  AlbumRequest,
  ArtistRequest,
  GenreRequest,
} from "@/types/music";

const BASE_URL = "";
const COMMON_URL = "/music/common";

// Helper to create FormData for multipart requests
function createFormDataForArtist(
  data: ArtistRequest | Partial<ArtistRequest>
): FormData {
  const formData = new FormData();

  // Separate file from request data
  const { imgFile, ...requestData } = data;

  // Add JSON request data as blob with proper content type
  const jsonBlob = new Blob([JSON.stringify(requestData)], {
    type: "application/json",
  });
  formData.append("artistRequest", jsonBlob);

  // Add file if present
  if (imgFile) {
    formData.append("imgFile", imgFile);
  }

  console.log("[PingMe] FormData for artist:", formData);
  return formData;
}

function createFormDataForAlbum(
  data: AlbumRequest | Partial<AlbumRequest>
): FormData {
  const formData = new FormData();

  const { imgFile, ...requestData } = data;

  console.log("[PingMe] Creating FormData for album with data:", data);
  console.log("[PingMe] Request data (without file):", requestData);

  const jsonBlob = new Blob([JSON.stringify(requestData)], {
    type: "application/json",
  });
  formData.append("albumRequest", jsonBlob);

  if (imgFile) {
    console.log("[PingMe] Adding album cover image file:", imgFile.name);
    formData.append("albumCoverImg", imgFile);
  } else {
    console.log("[PingMe] No album cover image provided");
  }

  console.log("[PingMe] Final FormData entries:");
  for (const pair of formData.entries()) {
    console.log("[PingMe]", pair[0], ":", pair[1]);
  }

  return formData;
}

function createFormDataForSong(
  data: SongRequest | Partial<SongRequest>
): FormData {
  const formData = new FormData();

  const { musicFile, imgFile, ...requestData } = data;

  console.log("[PingMe] Creating FormData for song with data:", data);
  console.log("[PingMe] Request data (without files):", requestData);

  const jsonBlob = new Blob([JSON.stringify(requestData)], {
    type: "application/json",
  });
  formData.append("songRequest", jsonBlob);

  if (musicFile) {
    console.log("[PingMe] Adding music file:", musicFile.name);
    formData.append("musicFile", musicFile);
  } else {
    console.log("[PingMe] No music file provided");
  }

  if (imgFile) {
    console.log("[PingMe] Adding cover image file:", imgFile.name);
    formData.append("imgFile", imgFile);
  } else {
    console.log("[PingMe] No cover image provided");
  }

  console.log("[PingMe] Final FormData entries for song:");
  for (const pair of formData.entries()) {
    console.log("[PingMe]", pair[0], ":", pair[1]);
  }

  return formData;
}

// Song Services
export const songService = {
  getAll: async (): Promise<SongResponseWithAllAlbum[]> => {
    const response = await axiosClient.get<ApiResponse<SongResponseWithAllAlbum[]>>(
      `${BASE_URL}/songs/all`
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<SongResponseWithAllAlbum> => {
    const response = await axiosClient.get<ApiResponse<SongResponseWithAllAlbum>>(
      `${BASE_URL}/songs/${id}`
    );
    return response.data.data;
  },

  search: async (title: string): Promise<SongResponseWithAllAlbum[]> => {
    const response = await axiosClient.get<ApiResponse<SongResponseWithAllAlbum[]>>(
      `${BASE_URL}/songs/search`,
      {
        params: { title },
      }
    );
    return response.data.data;
  },

  filterByGenre: async (genreId: number): Promise<SongResponse[]> => {
    const response = await axiosClient.get<ApiResponse<SongResponse[]>>(
      `${BASE_URL}/songs/genre`,
      {
        params: { id: genreId },
      }
    );
    return response.data.data;
  },

  create: async (data: SongRequest): Promise<SongResponse> => {
    console.log("[PingMe] Creating song with data:", data);
    const formData = createFormDataForSong(data);
    const response = await axiosClient.post<ApiResponse<SongResponse[]>>(
      `${BASE_URL}/songs/save`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    console.log("[PingMe] Song create response:", response.data);
    // Backend returns ApiResponse<List>, so unwrap and return first item
    const songs = response.data.data;
    return Array.isArray(songs) ? songs[0] : songs;
  },

  update: async (
    id: number,
    data: Partial<SongRequest>
  ): Promise<SongResponse> => {
    console.log("[PingMe] Updating song", id, "with data:", data);
    const formData = createFormDataForSong(data);
    const response = await axiosClient.put<ApiResponse<SongResponse[]>>(
      `${BASE_URL}/songs/update/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    console.log("[PingMe] Song update response:", response.data);
    // Backend returns ApiResponse<List>, so unwrap and return first item
    const songs = response.data.data;
    return Array.isArray(songs) ? songs[0] : songs;
  },

  softDelete: async (id: number): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`${BASE_URL}/songs/soft-delete/${id}`);
  },

  hardDelete: async (id: number): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`${BASE_URL}/songs/hard-delete/${id}`);
  },

  restore: async (id: number): Promise<void> => {
    await axiosClient.put<ApiResponse<void>>(`${BASE_URL}/songs/restore/${id}`);
  },

  increasePlayCount: async (id: number): Promise<void> => {
    await axiosClient.post<ApiResponse<void>>(`${BASE_URL}/songs/${id}/play`);
  },
};

// Album Services
export const albumService = {
  getAll: async (): Promise<AlbumResponse[]> => {
    const response = await axiosClient.get<ApiResponse<AlbumResponse[]>>(
      `${BASE_URL}/albums/all`
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<AlbumResponse> => {
    const response = await axiosClient.get<ApiResponse<AlbumResponse>>(
      `${BASE_URL}/albums/${id}`
    );
    return response.data.data;
  },

  search: async (title: string): Promise<AlbumResponse[]> => {
    const response = await axiosClient.get<ApiResponse<AlbumResponse[]>>(
      `${BASE_URL}/albums/search`,
      {
        params: { title },
      }
    );
    return response.data.data;
  },

  create: async (data: AlbumRequest): Promise<AlbumResponse> => {
    const formData = createFormDataForAlbum(data);
    const response = await axiosClient.post<ApiResponse<AlbumResponse>>(
      `${BASE_URL}/albums/save`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  },

  update: async (
    id: number,
    data: Partial<AlbumRequest>
  ): Promise<AlbumResponse> => {
    const formData = createFormDataForAlbum(data);
    const response = await axiosClient.put<ApiResponse<AlbumResponse>>(
      `${BASE_URL}/albums/update/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  },

  softDelete: async (id: number): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`${BASE_URL}/albums/soft-delete/${id}`);
  },

  hardDelete: async (id: number): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`${BASE_URL}/albums/hard-delete/${id}`);
  },

  restore: async (id: number): Promise<void> => {
    await axiosClient.put<ApiResponse<void>>(`${BASE_URL}/albums/restore/${id}`);
  },
};

// Artist Services
export const artistService = {
  getAll: async (): Promise<ArtistResponse[]> => {
    const response = await axiosClient.get<ApiResponse<ArtistResponse[]>>(
      `${BASE_URL}/artists/all`
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<ArtistResponse> => {
    const response = await axiosClient.get<ApiResponse<ArtistResponse>>(
      `${BASE_URL}/artists/${id}`
    );
    return response.data.data;
  },

  search: async (name: string): Promise<ArtistResponse[]> => {
    const response = await axiosClient.get<ApiResponse<ArtistResponse[]>>(
      `${BASE_URL}/artists/search`,
      {
        params: { name },
      }
    );
    return response.data.data;
  },

  create: async (data: ArtistRequest): Promise<ArtistResponse> => {
    const formData = createFormDataForArtist(data);
    const response = await axiosClient.post<ApiResponse<ArtistResponse>>(
      `${BASE_URL}/artists/save`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  },

  update: async (
    id: number,
    data: Partial<ArtistRequest>
  ): Promise<ArtistResponse> => {
    const formData = createFormDataForArtist(data);
    const response = await axiosClient.put<ApiResponse<ArtistResponse>>(
      `${BASE_URL}/artists/update/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  },

  softDelete: async (id: number): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`${BASE_URL}/artists/soft-delete/${id}`);
  },

  hardDelete: async (id: number): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`${BASE_URL}/artists/hard-delete/${id}`);
  },

  restore: async (id: number): Promise<void> => {
    await axiosClient.put<ApiResponse<void>>(`${BASE_URL}/artists/restore/${id}`);
  },
};

// Genre Services
export const genreService = {
  getAll: async (): Promise<GenreResponse[]> => {
    const response = await axiosClient.get<ApiResponse<GenreResponse[]>>(
      `${BASE_URL}/genres/all`
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<GenreResponse> => {
    const response = await axiosClient.get<ApiResponse<GenreResponse>>(
      `${BASE_URL}/genres/${id}`
    );
    return response.data.data;
  },

  search: async (name: string): Promise<GenreResponse[]> => {
    const response = await axiosClient.get<ApiResponse<GenreResponse[]>>(
      `${BASE_URL}/genres/search`,
      {
        params: { name },
      }
    );
    return response.data.data;
  },

  create: async (data: GenreRequest): Promise<GenreResponse> => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    formData.append("genreRequest", jsonBlob);
    
    const response = await axiosClient.post<ApiResponse<GenreResponse>>(
      `${BASE_URL}/genres/save`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  },

  update: async (
    id: number,
    data: Partial<GenreRequest>
  ): Promise<GenreResponse> => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    formData.append("genreRequest", jsonBlob);
    
    const response = await axiosClient.put<ApiResponse<GenreResponse>>(
      `${BASE_URL}/genres/update/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  },

  softDelete: async (id: number): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`${BASE_URL}/genres/soft-delete/${id}`);
  },

  hardDelete: async (id: number): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`${BASE_URL}/genres/hard-delete/${id}`);
  },

  restore: async (id: number): Promise<void> => {
    await axiosClient.put<ApiResponse<void>>(`${BASE_URL}/genres/restore/${id}`);
  },
};

// Common Service
export const commonService = {
  getMusicDashboard: async () => {
    const response = await axiosClient.get(`${COMMON_URL}/dashboard`);
    return response.data;
  },

  getArtistRoles: async (): Promise<string[]> => {
    const response = await axiosClient.get<ApiResponse<string[]>>(`${COMMON_URL}/roles`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },
};

// Search Service
export const searchService = {
  searchAll: async (query: string) => {
    const response = await axiosClient.get(`${BASE_URL}/search`, {
      params: { q: query },
    });
    return response.data;
  },

  // Get songs by album ID
  getSongsByAlbum: async (albumId: number): Promise<SongResponseWithAllAlbum[]> => {
    const response = await axiosClient.get<ApiResponse<SongResponseWithAllAlbum[]>>(
      `${BASE_URL}/songs/search-by-album`,
      {
        params: { id: albumId },
      }
    );
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  // Get songs by artist ID
  getSongsByArtist: async (artistId: number): Promise<SongResponseWithAllAlbum[]> => {
    const response = await axiosClient.get<ApiResponse<SongResponseWithAllAlbum[]>>(
      `${BASE_URL}/songs/search-by-artist`,
      {
        params: { id: artistId },
      }
    );
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  // Get songs by genre ID
  getSongsByGenre: async (genreId: number): Promise<SongResponseWithAllAlbum[]> => {
    const response = await axiosClient.get<ApiResponse<SongResponseWithAllAlbum[]>>(
      `${BASE_URL}/songs/genre`,
      {
        params: { id: genreId },
      }
    );
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  // Search songs by title
  searchSongs: async (query: string): Promise<SongResponseWithAllAlbum[]> => {
    const response = await axiosClient.get<ApiResponse<SongResponseWithAllAlbum[]>>(
      `${BASE_URL}/songs/search`,
      {
        params: { title: query },
      }
    );
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  // Search albums by name
  searchAlbums: async (query: string): Promise<AlbumResponse[]> => {
    const response = await axiosClient.get<ApiResponse<AlbumResponse[]>>(
      `${BASE_URL}/albums/search`,
      {
        params: { name: query },
      }
    );
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  // Search artists by name
  searchArtists: async (query: string): Promise<ArtistResponse[]> => {
    const response = await axiosClient.get<ApiResponse<ArtistResponse[]>>(
      `${BASE_URL}/artists/search`,
      {
        params: { name: query },
      }
    );
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },
};