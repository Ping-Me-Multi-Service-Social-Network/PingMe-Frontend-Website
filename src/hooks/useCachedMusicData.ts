import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/features/hooks";
import {
  fetchMusicData,
  fetchAllArtists,
  fetchAllAlbums,
  fetchSongsByGenre,
  fetchSongsByAlbum,
  fetchSongsByArtist,
  touchGenreCache,
  touchAlbumCache,
  touchArtistCache,
} from "@/features/slices/musicSlice";
import { isCacheValid, getCachedData } from "@/utils/musicCacheUtils";
import {
  DEFAULT_TOP_SONGS_LIMIT,
  DEFAULT_ARTISTS_LIMIT,
  DEFAULT_ALBUMS_LIMIT,
} from "@/constants/musicConstants";

/**
 * Custom hook for managing main music page cache
 * Automatically fetches data if cache is invalid
 */
export function useCachedMusicData(limit: number = DEFAULT_TOP_SONGS_LIMIT) {
  const dispatch = useAppDispatch();
  const { lastFetched, cacheExpiry, loading, error } = useAppSelector(
    (state) => state.music
  );

  useEffect(() => {
    if (!isCacheValid(lastFetched, cacheExpiry)) {
      dispatch(fetchMusicData(limit));
    }
  }, [dispatch, lastFetched, cacheExpiry, limit]);

  const refresh = useCallback(() => {
    return dispatch(fetchMusicData(limit));
  }, [dispatch, limit]);

  return { loading, error, refresh };
}

/**
 * Custom hook for managing all artists cache
 */
export function useCachedArtists(limit: number = DEFAULT_ARTISTS_LIMIT) {
  const dispatch = useAppDispatch();
  const { allArtists, cacheExpiry } = useAppSelector((state) => state.music);

  useEffect(() => {
    if (!isCacheValid(allArtists.lastFetched, cacheExpiry)) {
      dispatch(fetchAllArtists(limit));
    }
  }, [dispatch, allArtists.lastFetched, cacheExpiry, limit]);

  const refresh = useCallback(() => {
    return dispatch(fetchAllArtists(limit));
  }, [dispatch, limit]);

  return {
    artists: allArtists.data,
    loading: !allArtists.data.length && !allArtists.lastFetched,
    refresh,
  };
}

/**
 * Custom hook for managing all albums cache
 */
export function useCachedAlbums(limit: number = DEFAULT_ALBUMS_LIMIT) {
  const dispatch = useAppDispatch();
  const { allAlbums, cacheExpiry } = useAppSelector((state) => state.music);

  useEffect(() => {
    if (!isCacheValid(allAlbums.lastFetched, cacheExpiry)) {
      dispatch(fetchAllAlbums(limit));
    }
  }, [dispatch, allAlbums.lastFetched, cacheExpiry, limit]);

  const refresh = useCallback(() => {
    return dispatch(fetchAllAlbums(limit));
  }, [dispatch, limit]);

  return {
    albums: allAlbums.data,
    loading: !allAlbums.data.length && !allAlbums.lastFetched,
    refresh,
  };
}

/**
 * Custom hook for managing songs by genre cache with LRU tracking
 */
export function useCachedSongsByGenre(genreId: number | null) {
  const dispatch = useAppDispatch();
  const { songsByGenre, cacheExpiry } = useAppSelector((state) => state.music);

  const songs = genreId
    ? getCachedData(songsByGenre[genreId], cacheExpiry)
    : undefined;
  const isLoading = genreId !== null && !songs;

  useEffect(() => {
    if (genreId !== null) {
      const cachedData = getCachedData(songsByGenre[genreId], cacheExpiry);
      if (cachedData) {
        // Update last accessed time for LRU
        dispatch(touchGenreCache(genreId));
        return;
      }
      dispatch(fetchSongsByGenre(genreId));
    }
  }, [dispatch, genreId, songsByGenre, cacheExpiry]);

  const refresh = useCallback(() => {
    if (genreId !== null) {
      return dispatch(fetchSongsByGenre(genreId));
    }
  }, [dispatch, genreId]);

  return { songs, loading: isLoading, refresh };
}

/**
 * Custom hook for managing songs by album cache with LRU tracking
 */
export function useCachedSongsByAlbum(albumId: number | null) {
  const dispatch = useAppDispatch();
  const { songsByAlbum, cacheExpiry } = useAppSelector((state) => state.music);

  const songs = albumId
    ? getCachedData(songsByAlbum[albumId], cacheExpiry)
    : undefined;
  const isLoading = albumId !== null && !songs;

  useEffect(() => {
    if (albumId !== null) {
      const cachedData = getCachedData(songsByAlbum[albumId], cacheExpiry);
      if (cachedData) {
        // Update last accessed time for LRU
        dispatch(touchAlbumCache(albumId));
        return;
      }
      dispatch(fetchSongsByAlbum(albumId));
    }
  }, [dispatch, albumId, songsByAlbum, cacheExpiry]);

  const refresh = useCallback(() => {
    if (albumId !== null) {
      return dispatch(fetchSongsByAlbum(albumId));
    }
  }, [dispatch, albumId]);

  return { songs, loading: isLoading, refresh };
}

/**
 * Custom hook for managing songs by artist cache with LRU tracking
 */
export function useCachedSongsByArtist(artistId: number | null) {
  const dispatch = useAppDispatch();
  const { songsByArtist, cacheExpiry } = useAppSelector((state) => state.music);

  const songs = artistId
    ? getCachedData(songsByArtist[artistId], cacheExpiry)
    : undefined;
  const isLoading = artistId !== null && !songs;

  useEffect(() => {
    if (artistId !== null) {
      const cachedData = getCachedData(songsByArtist[artistId], cacheExpiry);
      if (cachedData) {
        // Update last accessed time for LRU
        dispatch(touchArtistCache(artistId));
        return;
      }
      dispatch(fetchSongsByArtist(artistId));
    }
  }, [dispatch, artistId, songsByArtist, cacheExpiry]);

  const refresh = useCallback(() => {
    if (artistId !== null) {
      return dispatch(fetchSongsByArtist(artistId));
    }
  }, [dispatch, artistId]);

  return { songs, loading: isLoading, refresh };
}

/**
 * Hook to get cache statistics for debugging
 */
export function useMusicCacheStats() {
  const state = useAppSelector((state) => state.music);

  return {
    mainCacheValid: isCacheValid(state.lastFetched, state.cacheExpiry),
    artistsCacheValid: isCacheValid(
      state.allArtists.lastFetched,
      state.cacheExpiry
    ),
    albumsCacheValid: isCacheValid(
      state.allAlbums.lastFetched,
      state.cacheExpiry
    ),
    cachedGenresCount: Object.keys(state.songsByGenre).length,
    cachedAlbumsCount: Object.keys(state.songsByAlbum).length,
    cachedArtistsCount: Object.keys(state.songsByArtist).length,
    totalCachedItems:
      Object.keys(state.songsByGenre).length +
      Object.keys(state.songsByAlbum).length +
      Object.keys(state.songsByArtist).length,
  };
}
