import axiosClient from "@/lib/axiosClient";
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

// Helper function to create FormData for genre
function createFormDataForGenre(
  data: GenreRequest | Partial<GenreRequest>
): FormData {
  const formData = new FormData();

  // Add JSON request data as blob with proper content type
  const jsonBlob = new Blob([JSON.stringify(data)], {
    type: "application/json",
  });
  formData.append("genreRequest", jsonBlob);

  return formData;
}

// Song Services
export const songService = {
  getAll: async (): Promise<SongResponseWithAllAlbum[]> => {
    const response = await axiosClient.get<SongResponseWithAllAlbum[]>(
      `${BASE_URL}/songs/all`
    );
    return response.data;
  },

  getById: async (id: number): Promise<SongResponseWithAllAlbum> => {
    const response = await axiosClient.get<SongResponseWithAllAlbum>(
      `${BASE_URL}/songs/${id}`
    );
    return response.data;
  },

  search: async (title: string): Promise<SongResponseWithAllAlbum[]> => {
    const response = await axiosClient.get<SongResponseWithAllAlbum[]>(
      `${BASE_URL}/songs/search`,
      {
        params: { title },
      }
    );
    return response.data;
  },

  filterByGenre: async (genreId: number): Promise<SongResponse[]> => {
    const response = await axiosClient.get<SongResponse[]>(
      `${BASE_URL}/songs/filter-by-genre/${genreId}`
    );
    return response.data;
  },

  create: async (data: SongRequest): Promise<SongResponseWithAllAlbum> => {
    console.log("[PingMe] Creating song with data:", data);
    const formData = createFormDataForSong(data);
    const response = await axiosClient.post<SongResponseWithAllAlbum[]>(
      `${BASE_URL}/songs/save`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    console.log("[PingMe] Song create response:", response.data);
    // Backend returns List, so return first item
    return Array.isArray(response.data) ? response.data[0] : response.data;
  },

  update: async (
    id: number,
    data: Partial<SongRequest>
  ): Promise<SongResponseWithAllAlbum> => {
    console.log("[PingMe] Updating song", id, "with data:", data);
    const formData = createFormDataForSong(data);
    const response = await axiosClient.put<SongResponseWithAllAlbum[]>(
      `${BASE_URL}/songs/update/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    console.log("[PingMe] Song update response:", response.data);
    // Backend returns List, so return first item
    return Array.isArray(response.data) ? response.data[0] : response.data;
  },

  softDelete: async (id: number): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/songs/soft-delete/${id}`);
  },

  hardDelete: async (id: number): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/songs/hard-delete/${id}`);
  },

  restore: async (id: number): Promise<SongResponseWithAllAlbum> => {
    const response = await axiosClient.put<SongResponseWithAllAlbum>(
      `${BASE_URL}/songs/restore/${id}`
    );
    return response.data;
  },

  increasePlayCount: async (id: number): Promise<void> => {
    await axiosClient.post(`${BASE_URL}/songs/${id}/play`);
  },
};

// Album Services
export const albumService = {
  getAll: async (): Promise<AlbumResponse[]> => {
    const response = await axiosClient.get<AlbumResponse[]>(
      `${BASE_URL}/albums/all`
    );
    return response.data;
  },

  getById: async (id: number): Promise<AlbumResponse> => {
    const response = await axiosClient.get<AlbumResponse>(
      `${BASE_URL}/albums/${id}`
    );
    return response.data;
  },

  create: async (data: AlbumRequest): Promise<AlbumResponse> => {
    const formData = createFormDataForAlbum(data);
    const response = await axiosClient.post<AlbumResponse>(
      `${BASE_URL}/albums/save`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<AlbumRequest>
  ): Promise<AlbumResponse> => {
    const formData = createFormDataForAlbum(data);
    const response = await axiosClient.put<AlbumResponse>(
      `${BASE_URL}/albums/update/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  softDelete: async (id: number): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/albums/soft-delete/${id}`);
  },

  hardDelete: async (id: number): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/albums/hard-delete/${id}`);
  },

  restore: async (id: number): Promise<AlbumResponse> => {
    const response = await axiosClient.put<AlbumResponse>(
      `${BASE_URL}/albums/restore/${id}`
    );
    return response.data;
  },
};

// Artist Services
export const artistService = {
  getAll: async (): Promise<ArtistResponse[]> => {
    const response = await axiosClient.get<ArtistResponse[]>(
      `${BASE_URL}/artists/all`
    );
    return response.data;
  },

  getById: async (id: number): Promise<ArtistResponse> => {
    const response = await axiosClient.get<ArtistResponse>(
      `${BASE_URL}/artists/${id}`
    );
    return response.data;
  },

  search: async (name: string): Promise<ArtistResponse[]> => {
    const response = await axiosClient.get<ArtistResponse[]>(
      `${BASE_URL}/artists/search`,
      {
        params: { name },
      }
    );
    return response.data;
  },

  create: async (data: ArtistRequest): Promise<ArtistResponse> => {
    const formData = createFormDataForArtist(data);
    const response = await axiosClient.post<ArtistResponse>(
      `${BASE_URL}/artists/save`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<ArtistRequest>
  ): Promise<ArtistResponse> => {
    const formData = createFormDataForArtist(data);
    const response = await axiosClient.put<ArtistResponse>(
      `${BASE_URL}/artists/update/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  softDelete: async (id: number): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/artists/soft-delete/${id}`);
  },

  hardDelete: async (id: number): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/artists/hard-delete/${id}`);
  },

  restore: async (id: number): Promise<ArtistResponse> => {
    const response = await axiosClient.put<ArtistResponse>(
      `${BASE_URL}/artists/restore/${id}`
    );
    return response.data;
  },
};

// Genre Services
export const genreService = {
  getAll: async (): Promise<GenreResponse[]> => {
    const response = await axiosClient.get<GenreResponse[]>(
      `${BASE_URL}/genres/all`
    );
    return response.data;
  },

  getById: async (id: number): Promise<GenreResponse> => {
    const response = await axiosClient.get<GenreResponse>(
      `${BASE_URL}/genres/${id}`
    );
    return response.data;
  },

  create: async (data: GenreRequest): Promise<GenreResponse> => {
    const formData = createFormDataForGenre(data);
    const response = await axiosClient.post<GenreResponse>(
      `${BASE_URL}/genres/save`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  update: async (id: number, data: GenreRequest): Promise<GenreResponse> => {
    const formData = createFormDataForGenre(data);
    const response = await axiosClient.put<GenreResponse>(
      `${BASE_URL}/genres/update/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  softDelete: async (id: number): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/genres/soft-delete/${id}`);
  },

  hardDelete: async (id: number): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/genres/hard-delete/${id}`);
  },

  restore: async (id: number): Promise<GenreResponse> => {
    const response = await axiosClient.put<GenreResponse>(
      `${BASE_URL}/genres/restore/${id}`
    );
    return response.data;
  },
};

// Common Services
export const commonService = {
  getArtistRoles: async (): Promise<string[]> => {
    const response = await axiosClient.get<string[]>(`${COMMON_URL}/roles`);
    return response.data;
  },
};

// Search Services
export const searchService = {
  searchSongs: async (title: string): Promise<SongResponseWithAllAlbum[]> => {
    if (!title.trim()) return [];
    const response = await axiosClient.get<SongResponseWithAllAlbum[]>(
      `${BASE_URL}/songs/search`,
      {
        params: { title },
      }
    );
    return response.data;
  },

  searchAlbums: async (title: string): Promise<AlbumResponse[]> => {
    if (!title.trim()) return [];
    const response = await axiosClient.get<AlbumResponse[]>(
      `${BASE_URL}/albums/search`,
      {
        params: { title },
      }
    );
    return response.data;
  },

  searchArtists: async (name: string): Promise<ArtistResponse[]> => {
    if (!name.trim()) return [];
    const response = await axiosClient.get<ArtistResponse[]>(
      `${BASE_URL}/artists/search`,
      {
        params: { name },
      }
    );
    return response.data;
  },

  getSongsByAlbum: async (
    albumId: number
  ): Promise<SongResponseWithAllAlbum[]> => {
    const response = await axiosClient.get<SongResponseWithAllAlbum[]>(
      `${BASE_URL}/songs/search-by-album`,
      {
        params: { id: albumId },
      }
    );
    return response.data;
  },

  getSongsByArtist: async (
    artistId: number
  ): Promise<SongResponseWithAllAlbum[]> => {
    const response = await axiosClient.get<SongResponseWithAllAlbum[]>(
      `${BASE_URL}/songs/search-by-artist`,
      {
        params: { id: artistId },
      }
    );
    return response.data;
  },

  getSongsByGenre: async (
    genreId: number
  ): Promise<SongResponseWithAllAlbum[]> => {
    const response = await axiosClient.get<SongResponseWithAllAlbum[]>(
      `${BASE_URL}/songs/genre`,
      {
        params: { id: genreId },
      }
    );
    return response.data;
  },
};
