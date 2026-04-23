import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { songApi } from "@/services/music/songApi";
import { albumApi } from "@/services/music/albumApi";
import { artistApi } from "@/services/music/artistApi";
import { genreApi } from "@/services/music/genreApi";
import { searchService } from "@/services/music/searchService";
import { dashboardApi, type DashboardParams } from "@/services/music/dashboardApi";
import type {
  SongResponseWithAllAlbum,
  ArtistResponse,
  AlbumResponse,
  TopSongPlayCounter,
} from "@/types/music";
import type { Genre } from "@/types/music/genre";
import {
  CACHE_DURATION,
  MAX_CACHED_GENRES,
  MAX_CACHED_ALBUMS,
  MAX_CACHED_ARTISTS,
} from "@/constants/musicConstants";
import type { CacheData } from "@/utils/musicCacheUtils";

// State interface with improved type safety
interface MusicState {
  // Main page cache
  topSongs: SongResponseWithAllAlbum[];
  popularAlbums: AlbumResponse[];
  popularArtists: ArtistResponse[];
  allGenres: Genre[];

  // Rankings cache (from dashboard endpoint)
  rankingsToday: TopSongPlayCounter[];
  rankingsWeek: TopSongPlayCounter[];
  rankingsMonth: TopSongPlayCounter[];

  // Pages cache with CacheData type
  allArtists: CacheData<ArtistResponse[]>;
  allAlbums: CacheData<AlbumResponse[]>;
  songsByGenre: Record<number, CacheData<SongResponseWithAllAlbum[]>>;
  songsByAlbum: Record<number, CacheData<SongResponseWithAllAlbum[]>>;
  songsByArtist: Record<number, CacheData<SongResponseWithAllAlbum[]>>;

  // Cache metadata
  lastFetched: number | null;
  cacheExpiry: number;

  // Loading states
  loading: boolean;
  error: string | null;
}

const initialState: MusicState = {
  topSongs: [],
  popularAlbums: [],
  popularArtists: [],
  allGenres: [],
  rankingsToday: [],
  rankingsWeek: [],
  rankingsMonth: [],
  allArtists: { data: [], lastFetched: null },
  allAlbums: { data: [], lastFetched: null },
  songsByGenre: {},
  songsByAlbum: {},
  songsByArtist: {},
  lastFetched: null,
  cacheExpiry: CACHE_DURATION,
  loading: false,
  error: null,
};

// Helper: delay between sequential requests to avoid rate limiting
const apiDelay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Dashboard thunk: single request for all home data ──
export const fetchDashboard = createAsyncThunk(
  "music/fetchDashboard",
  async (params?: DashboardParams) => {
    return await dashboardApi.getHomeDashboard(params);
  },
);

// ── Legacy thunks (kept for pages that need individual endpoints) ──
export const fetchMusicData = createAsyncThunk(
  "music/fetchAll",
  async (limit: number = 5) => {
    // Sequential fetch with delays to respect gateway rate limiter
    const songs = await songApi.getTopSongs(limit);
    await apiDelay(150);
    const albums = await albumApi.getPopularAlbums(limit);
    await apiDelay(150);
    const artists = await artistApi.getPopularArtists(limit);
    await apiDelay(150);
    const genres = await genreApi.getAllGenres();
    
    return { songs, albums, artists, genres };
  },
);

export const fetchAllArtists = createAsyncThunk(
  "music/fetchAllArtists",
  async (limit: number = 20) => {
    return await artistApi.getPopularArtists(limit);
  },
);

export const fetchAllAlbums = createAsyncThunk(
  "music/fetchAllAlbums",
  async (limit: number = 20) => {
    return await albumApi.getPopularAlbums(limit);
  },
);

export const fetchSongsByGenre = createAsyncThunk(
  "music/fetchSongsByGenre",
  async (genreId: number) => {
    const songs = await searchService.getSongsByGenre(genreId);
    return { genreId, songs };
  },
);

export const fetchSongsByAlbum = createAsyncThunk(
  "music/fetchSongsByAlbum",
  async (albumId: number) => {
    const songs = await searchService.getSongsByAlbum(albumId);
    return { albumId, songs };
  },
);

export const fetchSongsByArtist = createAsyncThunk(
  "music/fetchSongsByArtist",
  async (artistId: number) => {
    const songs = await searchService.getSongsByArtist(artistId);
    return { artistId, songs };
  },
);

export const fetchTodaySongs = createAsyncThunk(
  "music/fetchTodaySongs",
  async () => {
    return await songApi.getTopSongsToday(10);
  },
);

export const fetchWeekSongs = createAsyncThunk(
  "music/fetchWeekSongs", 
  async () => {
    return await songApi.getTopSongsThisWeek(10);
  },
);

export const fetchMonthSongs = createAsyncThunk(
  "music/fetchMonthSongs",
  async () => {
    return await songApi.getTopSongsThisMonth(10);
  },
);

const musicSlice = createSlice({
  name: "music",
  initialState,
  reducers: {
    clearCache(state) {
      state.topSongs = [];
      state.popularAlbums = [];
      state.popularArtists = [];
      state.allGenres = [];
      state.allArtists = { data: [], lastFetched: null };
      state.allAlbums = { data: [], lastFetched: null };
      state.songsByGenre = {};
      state.songsByAlbum = {};
      state.songsByArtist = {};
      state.lastFetched = null;
    },

    // Selective cache clearing
    clearGenreCache(state, action: PayloadAction<number>) {
      delete state.songsByGenre[action.payload];
    },

    clearAlbumCache(state, action: PayloadAction<number>) {
      delete state.songsByAlbum[action.payload];
    },

    clearArtistCache(state, action: PayloadAction<number>) {
      delete state.songsByArtist[action.payload];
    },

    // Invalidate cache without clearing data (soft invalidation)
    invalidateAllCache(state) {
      state.lastFetched = null;
      state.allArtists.lastFetched = null;
      state.allAlbums.lastFetched = null;

      // Invalidate all entity caches
      Object.keys(state.songsByGenre).forEach((key) => {
        const id = Number(key);
        if (state.songsByGenre[id]) {
          state.songsByGenre[id].lastFetched = null;
        }
      });
      Object.keys(state.songsByAlbum).forEach((key) => {
        const id = Number(key);
        if (state.songsByAlbum[id]) {
          state.songsByAlbum[id].lastFetched = null;
        }
      });
      Object.keys(state.songsByArtist).forEach((key) => {
        const id = Number(key);
        if (state.songsByArtist[id]) {
          state.songsByArtist[id].lastFetched = null;
        }
      });
    },

    // Update last accessed time for LRU
    touchGenreCache(state, action: PayloadAction<number>) {
      const cache = state.songsByGenre[action.payload];
      if (cache) {
        cache.lastAccessed = Date.now();
      }
    },

    touchAlbumCache(state, action: PayloadAction<number>) {
      const cache = state.songsByAlbum[action.payload];
      if (cache) {
        cache.lastAccessed = Date.now();
      }
    },

    touchArtistCache(state, action: PayloadAction<number>) {
      const cache = state.songsByArtist[action.payload];
      if (cache) {
        cache.lastAccessed = Date.now();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Dashboard (single request for home page) ──
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        const d = action.payload;
        state.topSongs = d.topSongs || [];
        state.popularAlbums = d.popularAlbums || [];
        state.popularArtists = d.popularArtists || [];
        state.allGenres = d.genres || [];
        state.rankingsToday = d.rankings?.today || [];
        state.rankingsWeek = d.rankings?.week || [];
        state.rankingsMonth = d.rankings?.month || [];
        state.lastFetched = Date.now();
        state.cacheExpiry = Date.now() + CACHE_DURATION;
        state.loading = false;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch dashboard data";
        state.loading = false;
      })

      // ── Legacy: fetchMusicData (fallback) ──
      .addCase(fetchMusicData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMusicData.fulfilled, (state, action) => {
        state.topSongs = action.payload.songs;
        state.popularAlbums = action.payload.albums;
        state.popularArtists = action.payload.artists;
        state.allGenres = action.payload.genres;
        state.lastFetched = Date.now();
        state.loading = false;
      })
      .addCase(fetchMusicData.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch music data";
        state.loading = false;
      })

      // All artists
      .addCase(fetchAllArtists.fulfilled, (state, action) => {
        state.allArtists = {
          data: action.payload,
          lastFetched: Date.now(),
        };
      })

      // All albums
      .addCase(fetchAllAlbums.fulfilled, (state, action) => {
        state.allAlbums = {
          data: action.payload,
          lastFetched: Date.now(),
        };
      })

      // Songs by genre with LRU cache limit
      .addCase(fetchSongsByGenre.fulfilled, (state, action) => {
        if (!state.songsByGenre) state.songsByGenre = {};

        // Check cache size limit and evict oldest if needed
        const cachedIds = Object.keys(state.songsByGenre).map(Number);
        if (
          cachedIds.length >= MAX_CACHED_GENRES &&
          !cachedIds.includes(action.payload.genreId)
        ) {
          // Find least recently accessed item
          let oldestId = cachedIds[0];
          let oldestTime =
            state.songsByGenre[oldestId].lastAccessed ||
            state.songsByGenre[oldestId].lastFetched ||
            0;

          cachedIds.forEach((id) => {
            const cache = state.songsByGenre[id];
            const accessTime = cache.lastAccessed || cache.lastFetched || 0;
            if (accessTime < oldestTime) {
              oldestTime = accessTime;
              oldestId = id;
            }
          });

          console.log(`[MusicCache] LRU eviction: removing genre ${oldestId}`);
          delete state.songsByGenre[oldestId];
        }

        state.songsByGenre[action.payload.genreId] = {
          data: action.payload.songs,
          lastFetched: Date.now(),
          lastAccessed: Date.now(),
        };
      })

      // Songs by album with LRU cache limit
      .addCase(fetchSongsByAlbum.fulfilled, (state, action) => {
        if (!state.songsByAlbum) state.songsByAlbum = {};

        // Check cache size limit and evict oldest if needed
        const cachedIds = Object.keys(state.songsByAlbum).map(Number);
        if (
          cachedIds.length >= MAX_CACHED_ALBUMS &&
          !cachedIds.includes(action.payload.albumId)
        ) {
          // Find least recently accessed item
          let oldestId = cachedIds[0];
          let oldestTime =
            state.songsByAlbum[oldestId].lastAccessed ||
            state.songsByAlbum[oldestId].lastFetched ||
            0;

          cachedIds.forEach((id) => {
            const cache = state.songsByAlbum[id];
            const accessTime = cache.lastAccessed || cache.lastFetched || 0;
            if (accessTime < oldestTime) {
              oldestTime = accessTime;
              oldestId = id;
            }
          });

          console.log(`[MusicCache] LRU eviction: removing album ${oldestId}`);
          delete state.songsByAlbum[oldestId];
        }

        state.songsByAlbum[action.payload.albumId] = {
          data: action.payload.songs,
          lastFetched: Date.now(),
          lastAccessed: Date.now(),
        };
      })

      // Songs by artist with LRU cache limit
      .addCase(fetchSongsByArtist.fulfilled, (state, action) => {
        if (!state.songsByArtist) state.songsByArtist = {};

        // Check cache size limit and evict oldest if needed
        const cachedIds = Object.keys(state.songsByArtist).map(Number);
        if (
          cachedIds.length >= MAX_CACHED_ARTISTS &&
          !cachedIds.includes(action.payload.artistId)
        ) {
          // Find least recently accessed item
          let oldestId = cachedIds[0];
          let oldestTime =
            state.songsByArtist[oldestId].lastAccessed ||
            state.songsByArtist[oldestId].lastFetched ||
            0;

          cachedIds.forEach((id) => {
            const cache = state.songsByArtist[id];
            const accessTime = cache.lastAccessed || cache.lastFetched || 0;
            if (accessTime < oldestTime) {
              oldestTime = accessTime;
              oldestId = id;
            }
          });

          console.log(`[MusicCache] LRU eviction: removing artist ${oldestId}`);
          delete state.songsByArtist[oldestId];
        }

        state.songsByArtist[action.payload.artistId] = {
          data: action.payload.songs,
          lastFetched: Date.now(),
          lastAccessed: Date.now(),
        };
      });
  },
});

export const {
  clearCache,
  clearGenreCache,
  clearAlbumCache,
  clearArtistCache,
  invalidateAllCache,
  touchGenreCache,
  touchAlbumCache,
  touchArtistCache,
} = musicSlice.actions;
export default musicSlice.reducer;
