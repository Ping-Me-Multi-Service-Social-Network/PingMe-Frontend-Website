import type { SongResponseWithAllAlbum } from "@/types/music";
import type { Song } from "@/types/music/song";

/**
 * Handles keyboard events for interactive elements
 * Triggers callback on Enter or Space key press
 */
export const handleKeyDown = (e: React.KeyboardEvent, callback: () => void) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    callback();
  }
};

/**
 * Converts SongResponseWithAllAlbum to Song format for audio player
 */
export const convertToSong = (song: SongResponseWithAllAlbum): Song => {
  return {
    id: song.id,
    title: song.title,
    duration: song.duration,
    playCount: song.playCount,
    songUrl: song.songUrl,
    coverImageUrl: song.coverImageUrl,
    mainArtist: song.mainArtist,
    featuredArtists: song.otherArtists,
    genre: song.genres,
    album: song.albums,
  };
};
