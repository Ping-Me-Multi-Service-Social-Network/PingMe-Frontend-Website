import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { AudioPlayerContext } from "./AudioPlayerContext";
import type { Song } from "@/types/music/song";
import type { RepeatMode } from "./audioPlayerTypes";
import { songService } from "@/services/music/musicService";

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [volume, setVolumeState] = useState(1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playCountTrackedRef = useRef<Set<number>>(new Set());

  const playSong = useCallback((song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    playCountTrackedRef.current.delete(song.id);
    if (audioRef.current) {
      audioRef.current.src = song.songUrl;
      audioRef.current.play().catch(console.error);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.loop = repeatMode === "one";
  }, [volume, repeatMode]);

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
          console.log(
            "[PingMe] User listened to >50% of song, increasing play count for:",
            currentSong.title
          );
          songService.increasePlayCount(currentSong.id).catch((error) => {
            console.error("[PingMe] Failed to increase play count:", error);
          });
        }
      }
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (repeatMode === "one") {
        return;
      }
      if (repeatMode === "all") {
        if (currentSong && playlist.length > 0) {
          const currentIndex = playlist.findIndex(
            (song) => song.id === currentSong.id
          );
          const nextIndex = (currentIndex + 1) % playlist.length;
          const nextSong = playlist[nextIndex];
          setCurrentSong(nextSong);
          playCountTrackedRef.current.delete(nextSong.id);
          audio.src = nextSong.songUrl;
          audio.play().catch(console.error);
        }
      } else {
        setIsPlaying(false);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      console.error("Audio playback error");
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    };
  }, [repeatMode, currentSong, playlist]);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        audioRef,
        playlist,
        volume,
        repeatMode,
        playSong,
        togglePlayPause,
        seekTo,
        setVolume,
        setCurrentSong,
        setIsPlaying,
        setPlaylist,
        cycleRepeatMode,
      }}
    >
      {children}
      <audio ref={audioRef} />
    </AudioPlayerContext.Provider>
  );
}
