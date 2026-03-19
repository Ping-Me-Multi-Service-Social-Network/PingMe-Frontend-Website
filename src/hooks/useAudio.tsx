import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useContext,
  createContext,
  type ReactNode,
} from "react";
import type { Song } from "@/types/music/song";
import type { RepeatMode, PlaybackContext } from "@/features/music/audioPlayerSlice";
import { songService } from "@/services/music/musicService";
import { albumApi } from "@/services/music/albumApi";
import { useAppDispatch, useAppSelector } from "@/features/hooks";
import {
  setCurrentSong,
  setIsPlaying,
  setPlaylist,
  setVolume,
  cycleRepeatMode,
  togglePlayPause as togglePlayPauseAction,
  playSong as playSongAction,
  setPlaybackContext as setPlaybackContextAction,
} from "@/features/music/audioPlayerSlice";

// --- Types ---
export interface AudioPlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playlist: Song[];
  volume: number;
  repeatMode: RepeatMode;
  playbackContext: PlaybackContext;
  playSong: (song: Song, context?: PlaybackContext) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaylist: (playlist: Song[]) => void;
  setPlaybackContext: (context: PlaybackContext) => void;
  cycleRepeatMode: () => void;
}

// --- Context ---
const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined
);

// --- Helper Functions ---
const trackSongPlayCount = (songId: number) => {
  songService.increasePlayCount(songId).catch((error) => {
    console.error("[PingMe] Failed to increase play count:", error);
  });
};

const trackAlbumPlayCount = (song: Song) => {
  if (!song.album || song.album.length === 0) return;
  for (const album of song.album) {
    albumApi.incrementPlayCount(album.id).catch((error) => {
      console.error("[PingMe] Failed to increase album play count:", error);
    });
  }
};

// --- Provider ---
interface AudioPlayerProviderProps {
  children: ReactNode;
}

export function AudioPlayerProvider({ children }: Readonly<AudioPlayerProviderProps>) {
  const dispatch = useAppDispatch();
  const { currentSong, isPlaying, playlist, volume, repeatMode, playbackContext = { type: null, id: null } } =
    useAppSelector((state) => state.audioPlayer);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playCountTrackedRef = useRef<Set<number>>(new Set());
  const albumPlayCountTrackedRef = useRef<Set<number>>(new Set());

  // --- ACTIONS ---

  const playSong = useCallback(
    (song: Song, context?: PlaybackContext) => {
      if (!song.songUrl || song.songUrl.trim() === "") {
        console.error(
          "[PingMe] Cannot play song: Invalid or missing songUrl",
          song
        );
        return;
      }
      playCountTrackedRef.current.delete(song.id);
      albumPlayCountTrackedRef.current.delete(song.id);
      dispatch(playSongAction({ song, context }));
    },
    [dispatch]
  );

  const togglePlayPause = useCallback(() => {
    dispatch(togglePlayPauseAction());
  }, [dispatch]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolumeValue = useCallback(
    (newVolume: number) => {
      dispatch(setVolume(newVolume));
    },
    [dispatch]
  );

  const handleCycleRepeatMode = useCallback(() => {
    dispatch(cycleRepeatMode());
  }, [dispatch]);

  const updatePlaylist = useCallback(
    (newPlaylist: Song[]) => {
      dispatch(setPlaylist(newPlaylist));
    },
    [dispatch]
  );

  const updateCurrentSong = useCallback(
    (song: Song | null) => {
      dispatch(setCurrentSong(song));
    },
    [dispatch]
  );

  const updateIsPlaying = useCallback(
    (playing: boolean) => {
      dispatch(setIsPlaying(playing));
    },
    [dispatch]
  );

  const updatePlaybackContext = useCallback(
    (context: PlaybackContext) => {
      dispatch(setPlaybackContextAction(context));
    },
    [dispatch]
  );

  // --- EFFECTS ---

  // Sync Audio Element with Redux State (Source & Playing Status)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Load new song if source changed
    if (currentSong && audio.src !== currentSong.songUrl) {
      audio.src = currentSong.songUrl;
      // Don't auto-play here, wait for isPlaying check or explicit play call
    }
  }, [currentSong]);

  // Separate effect for play/pause to avoid race conditions with source loading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error("[PingMe] Audio playback failed:", error);
        dispatch(setIsPlaying(false));
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]); // Depend on currentSong to ensure we try to play after loading

  // Sync Volume & Loop
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.loop = repeatMode === "one";
  }, [volume, repeatMode]);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      if (currentSong && audio.duration > 0) {
        const progress = audio.currentTime / audio.duration;

        if (
          progress > 0.5 &&
          !playCountTrackedRef.current.has(currentSong.id)
        ) {
          playCountTrackedRef.current.add(currentSong.id);
          trackSongPlayCount(currentSong.id);
        }

        // Track album play
        if (
          audio.currentTime >= 30 &&
          !albumPlayCountTrackedRef.current.has(currentSong.id)
        ) {
          albumPlayCountTrackedRef.current.add(currentSong.id);
          trackAlbumPlayCount(currentSong);
        }
      }
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (repeatMode === "one") {
        // Loop is handled by audio.loop = true, but if needed we can force play
        return;
      }
      if (repeatMode === "all") {
        if (currentSong && playlist.length > 0) {
          const currentIndex = playlist.findIndex(
            (song) => song.id === currentSong.id
          );
          const nextIndex = (currentIndex + 1) % playlist.length;
          const nextSong = playlist[nextIndex];

          if (!nextSong?.songUrl || nextSong.songUrl.trim() === "") {
            dispatch(setIsPlaying(false));
            return;
          }

          playCountTrackedRef.current.delete(nextSong.id);
          albumPlayCountTrackedRef.current.delete(nextSong.id);
          dispatch(playSongAction({ song: nextSong, context: playbackContext })); // This sets isPlaying=true
        }
      } else {
        dispatch(setIsPlaying(false));
      }
    };

    // We don't listen to 'play'/'pause' events to dispatch actions to avoid loops
    // The Source of Truth is Redux. The audio element follows Redux.

    const handleError = (e: Event) => {
      const audioElement = e.target as HTMLAudioElement;
      console.error("[PingMe] Audio error:", audioElement.error);
      dispatch(setIsPlaying(false));
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [currentSong, playlist, repeatMode, dispatch]);

  const contextValue = useMemo(
    () => ({
      currentSong,
      isPlaying,
      currentTime,
      duration,
      audioRef,
      playlist,
      volume,
      repeatMode,
      playbackContext,
      playSong,
      togglePlayPause,
      seekTo,
      setVolume: setVolumeValue,
      setCurrentSong: updateCurrentSong,
      setIsPlaying: updateIsPlaying,
      setPlaylist: updatePlaylist,
      setPlaybackContext: updatePlaybackContext,
      cycleRepeatMode: handleCycleRepeatMode,
    }),
    [
      currentSong,
      isPlaying,
      currentTime,
      duration,
      audioRef,
      playlist,
      volume,
      repeatMode,
      playbackContext,
      playSong,
      togglePlayPause,
      seekTo,
      setVolumeValue,
      updateCurrentSong,
      updateIsPlaying,
      updatePlaylist,
      updatePlaybackContext,
      handleCycleRepeatMode,
    ]
  );

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
      <audio ref={audioRef} crossOrigin="anonymous">
        <track kind="captions" />
      </audio>
    </AudioPlayerContext.Provider>
  );
}

// --- Hook ---
export function useAudio() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioPlayerProvider");
  }
  return context;
}
