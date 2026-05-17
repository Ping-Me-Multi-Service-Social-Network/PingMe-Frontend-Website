/* eslint-disable react-refresh/only-export-components */
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
import { leaveSession } from "@/features/music/musicSessionSlice";
import { MusicSocketManager } from "@/features/websocket/core/musicSocketManager";
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
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playlist: Song[];
  volume: number;
  repeatMode: RepeatMode;
  playbackContext: PlaybackContext;
  playSong: (song: Song, context?: PlaybackContext, options?: { force?: boolean; syncSession?: boolean }) => void;
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
  if (!song.album) return;
  const albums = Array.isArray(song.album) ? song.album : [song.album];
  if (albums.length === 0) return;

  for (const album of albums) {
    if (!album?.id) continue;
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
  const { activeHostUserId, isHost, session } = useAppSelector((state) => state.musicSession);
  const isListener = !!activeHostUserId && !isHost;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playCountTrackedRef = useRef<Set<number>>(new Set());
  const albumPlayCountTrackedRef = useRef<Set<number>>(new Set());
  const lastSyncedTrackIdRef = useRef<string | null>(null);

  // --- ACTIONS ---

  const playSong = useCallback(
    (song: Song, context?: PlaybackContext, options?: { force?: boolean; syncSession?: boolean }) => {
      if (!song.songUrl || song.songUrl.trim() === "") {
        console.error(
          "[PingMe] Cannot play song: Invalid or missing songUrl",
          song
        );
        return;
      }

      // Chặn nếu là Listener đang tự bấm đổi bài (không có cờ force)
      if (isListener && !options?.force) {
        console.warn("[PingMe] Listener cannot change song during co-listening");
        return;
      }

      playCountTrackedRef.current.delete(song.id);
      albumPlayCountTrackedRef.current.delete(song.id);
      dispatch(playSongAction({ song, context }));

      if (isHost && activeHostUserId && options?.syncSession !== false) {
        MusicSocketManager.sendCommand(activeHostUserId, {
          command: "PLAY",
          payload: { currentTrackId: song.id.toString(), positionMs: 0 },
        });
      }
    },
    [activeHostUserId, dispatch, isHost, isListener]
  );

  const togglePlayPause = useCallback(() => {
    if (isListener) return;

    if (isHost && activeHostUserId && currentSong) {
      MusicSocketManager.sendCommand(activeHostUserId, {
        command: isPlaying ? "PAUSE" : "PLAY",
        payload: {
          currentTrackId: currentSong.id.toString(),
          positionMs: Math.round((audioRef.current?.currentTime ?? 0) * 1000),
        },
      });
    }

    dispatch(togglePlayPauseAction());
  }, [activeHostUserId, currentSong, dispatch, isHost, isListener, isPlaying]);

  const seekTo = useCallback((time: number) => {
    if (isListener) return;
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, [isListener]);

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

  // --- CO-LISTENING SYNC LOGIC ---

  // 1. Sync Song
  useEffect(() => {
    if (!isListener || !session?.currentTrackId) return;

    const trackId = String(session.currentTrackId);
    if (!currentSong || String(currentSong.id) !== trackId) {
      console.log("[MusicSync] Host changed song to:", trackId);

      // Reset audio state safely
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0; // ÉP BUỘC quay về 0 ngay lập tức
          audioRef.current.load();
        } catch (e) {
          console.warn("[MusicSync] Error resetting audio:", e);
        }
      }

      songService.getById(Number(trackId))
        .then((res) => {
          if (res.data) {
            const songData = res.data as any;
            playCountTrackedRef.current.delete(songData.id);
            albumPlayCountTrackedRef.current.delete(songData.id);
            dispatch(setCurrentSong(songData));
            dispatch(setPlaybackContextAction({ type: "co-listening", id: session.hostUserId }));
          }
        })
        .catch(err => {
          console.error("[MusicSync] Failed to fetch host song:", err);
        });
    }
  }, [dispatch, isListener, session?.currentTrackId, currentSong?.id, session?.hostUserId]);

  // 2. Sync Play/Pause
  useEffect(() => {
    if (!isListener || !session) return;

    // Chỉ sync play/pause nếu đã khớp bài
    if (!currentSong || String(currentSong.id) !== String(session.currentTrackId)) return;

    if (session.isPlaying !== isPlaying) {
      console.log("[MusicSync] Host toggled play/pause:", session.isPlaying);
      dispatch(setIsPlaying(session.isPlaying));
    }
  }, [isListener, session?.isPlaying, session?.currentTrackId, currentSong?.id, isPlaying, dispatch]);

  // 3. Sync Position (Seek)
  useEffect(() => {
    const audio = audioRef.current;
    if (!isListener || !session || !audio) return;

    const syncPosition = () => {
      if (!audio.paused && !session.isPlaying) {
        audio.pause();
      }

      // CHỈ đồng bộ nếu bài hát hiện tại đã khớp với Host
      if (!currentSong || String(currentSong.id) !== String(session.currentTrackId)) {
        return;
      }

      let targetTime = session.positionMs / 1000;
      if (session.isPlaying) {
        // Sử dụng startedAtEpochMs để tính toán
        // Nếu targetTime > 0 (Host đã phát một lúc) thì mới tính drift
        const elapsed = (Date.now() - session.startedAtEpochMs) / 1000;

        // Nếu elapsed quá lớn hoặc âm (lệch đồng hồ), ta sẽ giới hạn nó
        // Hoặc nếu mới chuyển bài (positionMs == 0), ta ưu tiên phát từ đầu
        if (session.positionMs === 0 && Math.abs(elapsed) > 300) {
          // Lệch đồng hồ quá nặng (> 5 phút), coi như mới bắt đầu
          targetTime = 0;
        } else {
          targetTime += elapsed;
        }
      }

      // Log để debug
      console.log(`[MusicSync] Target: ${targetTime.toFixed(2)}s, Current: ${audio.currentTime.toFixed(2)}s, SessionPos: ${session.positionMs}ms`);

      if (targetTime < 0) targetTime = 0;

      // Ngưỡng sai số 1 giây để khớp hơn
      if (Math.abs(audio.currentTime - targetTime) > 0.5) {
        console.log("[MusicSync] Seeking to:", targetTime);
        audio.currentTime = targetTime;
      }
    };

    // Khi state từ server thay đổi -> sync ngay
    syncPosition();

    // Logic "Ép" đồng bộ khi vừa đổi bài (trong 2 giây đầu)
    lastSyncedTrackIdRef.current = String(session.currentTrackId);

    const handleCanPlay = () => {
      console.log("[MusicSync] Can play now, performing final sync");
      syncPosition();
    };

    audio.addEventListener("canplay", handleCanPlay);
    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
    };

  }, [isListener, session?.version, session?.currentTrackId, currentSong?.id]);

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
  }, [isPlaying, currentSong, dispatch]); // Depend on currentSong to ensure we try to play after loading

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



    const handlePlaylistNext = (current: Song) => {
      const currentIndex = playlist.findIndex((song) => song.id === current.id);
      if (currentIndex < 0) {
        dispatch(setIsPlaying(false));
        return;
      }

      if (repeatMode === "off" && currentIndex === playlist.length - 1) {
        dispatch(setIsPlaying(false));
        return;
      }

      const nextIndex = (currentIndex + 1) % playlist.length;
      const nextSong = playlist[nextIndex];

      if (!nextSong?.songUrl || nextSong.songUrl.trim() === "") {
        dispatch(setIsPlaying(false));
        return;
      }

      // Gửi lệnh cho Listener nếu mình là Host và tự động chuyển bài
      if (isHost && activeHostUserId) {
        MusicSocketManager.sendCommand(activeHostUserId, {
          command: "PLAY",
          payload: { currentTrackId: nextSong.id.toString(), positionMs: 0 },
        });
      }

      playCountTrackedRef.current.delete(nextSong.id);
      albumPlayCountTrackedRef.current.delete(nextSong.id);
      dispatch(playSongAction({ song: nextSong, context: playbackContext }));
    };

    const handleEnded = () => {
      // Logic đặc biệt cho nghe chung: Nếu host đã thoát (EndingAfterCurrentTrack = true)
      // thì khi hết bài này, listener cũng tự động rời phòng.
      if (isListener && session?.isEndingAfterCurrentTrack) {
        console.log("[MusicSync] Session is ending after this track. Leaving...");
        dispatch(setIsPlaying(false));
        dispatch(setCurrentSong(null));
        MusicSocketManager.disconnect();
        dispatch(leaveSession());
        return;
      }

      if (repeatMode === "one") {
        return;
      }

      if (currentSong && playlist.length > 0) {
        handlePlaylistNext(currentSong);
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
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [
    activeHostUserId,
    currentSong,
    dispatch,
    isHost,
    isListener,
    playbackContext,
    playlist,
    repeatMode,
    session?.isEndingAfterCurrentTrack,
  ]);

  const contextValue = useMemo(
    () => ({
      currentSong,
      isPlaying,
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

export function useAudioTime() {
  const { audioRef } = useAudio();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let animationFrameId: number;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      animationFrameId = requestAnimationFrame(updateTime);
    };

    const handlePlay = () => {
      updateTime();
    };

    const handlePause = () => {
      cancelAnimationFrame(animationFrameId);
      setCurrentTime(audio.currentTime); // Ensure final sync
    };

    // Initialize
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration || 0);

    if (!audio.paused) {
      updateTime();
    }

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('seeked', handlePause); // Force update on seek

    return () => {
      cancelAnimationFrame(animationFrameId);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('seeked', handlePause);
    };
  }, [audioRef]);

  return { currentTime, duration };
}
