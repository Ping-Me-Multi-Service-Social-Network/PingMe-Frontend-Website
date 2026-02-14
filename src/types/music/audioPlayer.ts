import type React from "react";
import type { Song } from "@/types/music/song";

export type RepeatMode = "off" | "all" | "one";

export interface AudioPlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playlist: Song[];
  volume: number;
  repeatMode: RepeatMode;
  playSong: (song: Song) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaylist: (playlist: Song[]) => void;
  cycleRepeatMode: () => void;
}

export type { Song };
