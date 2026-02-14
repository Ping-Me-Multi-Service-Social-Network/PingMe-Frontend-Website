import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Song } from "@/types/music/song";
// We'll move this type here or import it from the new types file
export type RepeatMode = "off" | "all" | "one";

interface AudioPlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  playlist: Song[];
  volume: number;
  repeatMode: RepeatMode;
  isExpanded: boolean;
}

const initialState: AudioPlayerState = {
  currentSong: null,
  isPlaying: false,
  playlist: [],
  volume: 1,
  repeatMode: "off",
  isExpanded: true,
};

const audioPlayerSlice = createSlice({
  name: "audioPlayer",
  initialState,
  reducers: {
    setCurrentSong: (state, action: PayloadAction<Song | null>) => {
      state.currentSong = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setPlaylist: (state, action: PayloadAction<Song[]>) => {
      state.playlist = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },
    setRepeatMode: (state, action: PayloadAction<RepeatMode>) => {
      state.repeatMode = action.payload;
    },
    cycleRepeatMode: (state) => {
      if (state.repeatMode === "off") state.repeatMode = "all";
      else if (state.repeatMode === "all") state.repeatMode = "one";
      else state.repeatMode = "off";
    },
    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    playSong: (state, action: PayloadAction<Song>) => {
      state.currentSong = action.payload;
      state.isPlaying = true;
      // Note: We don't modify playlist here, consumer should handle playlist updates if needed
    },
    setIsExpanded: (state, action: PayloadAction<boolean>) => {
      state.isExpanded = action.payload;
    },
  },
});

export const {
  setCurrentSong,
  setIsPlaying,
  setPlaylist,
  setVolume,
  setRepeatMode,
  cycleRepeatMode,
  togglePlayPause,
  playSong,
  setIsExpanded,
} = audioPlayerSlice.actions;

export default audioPlayerSlice.reducer;
