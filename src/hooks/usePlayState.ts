import { useAudio } from "@/hooks/useAudio";

/**
 * Returns play state for a single song.
 */
export function useSongPlayState(songId: number, onPlay: (song: unknown) => void) {
  const { currentSong, isPlaying, togglePlayPause } = useAudio();

  const isCurrent = String(currentSong?.id) === String(songId);
  const isSongPlaying = isCurrent && isPlaying;

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else {
      onPlay(null);
    }
  };

  return { isSongPlaying, isCurrent, handlePlayPause };
}

/**
 * Returns play state for an album card.
 */
export function useAlbumPlayState(albumId: number | string) {
  const { playbackContext, isPlaying } = useAudio();

  // Comparison using String casting for reliability
  const isAlbumCurrent =
    playbackContext?.type === "album" && 
    String(playbackContext?.id) === String(albumId);
  
  const isAlbumPlaying = isAlbumCurrent && isPlaying;

  return { isAlbumPlaying, isAlbumCurrent };
}

/**
 * Returns play state for a collection (playlist, artist, etc).
 */
export function useCollectionPlayState(
  onPlayAll: () => void,
  contextType: "artist" | "playlist" | "genre" | "all" | "favorite" | "album",
  contextId: number | string
) {
  const { playbackContext, isPlaying, togglePlayPause } = useAudio();

  const isCollectionCurrent =
    playbackContext?.type === contextType && 
    String(playbackContext?.id) === String(contextId);
    
  const isCollectionPlaying = isCollectionCurrent && isPlaying;

  const handlePlayPauseCollection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCollectionCurrent) {
      togglePlayPause();
    } else {
      onPlayAll();
    }
  };

  return {
    isCollectionPlaying,
    isCollectionCurrent,
    handlePlayPauseCollection,
  };
}

/**
 * Returns play state for an artist card.
 */
export function useArtistPlayState(artistId: number | string) {
  const { playbackContext, isPlaying } = useAudio();

  const isArtistCurrent =
    playbackContext?.type === "artist" && 
    String(playbackContext?.id) === String(artistId);
    
  const isArtistPlaying = isArtistCurrent && isPlaying;

  return { isArtistPlaying, isArtistCurrent };
}
