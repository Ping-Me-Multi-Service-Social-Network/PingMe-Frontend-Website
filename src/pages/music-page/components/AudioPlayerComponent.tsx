"use client";

import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import "../audio-player-styles.css";
import { useState, useEffect, useRef } from "react";
import type { Song } from "@/types/music/song";
import { useAudioPlayer } from "@/contexts/useAudioPlayer";

interface AudioPlayerComponentProps {
  currentSong?: Song | null;
  playlist?: Song[];
  onSongChange?: (song: Song) => void;
}

export default function AudioPlayerComponent({
  currentSong,
  playlist = [],
  onSongChange,
}: AudioPlayerComponentProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const { audioRef, setIsPlaying } = useAudioPlayer();

  useEffect(() => {
    if (currentSong && playlist.length > 0) {
      const index = playlist.findIndex((t) => t && t.id === currentSong.id);
      if (index >= 0) {
        setCurrentTrackIndex(index);
        if (audioRef.current) {
          audioRef.current.src = currentSong.songUrl;
          setTimeout(() => {
            audioRef.current?.play();
            setIsPlaying(true);
          }, 100);
        }
      } else {
        setCurrentTrackIndex(0);
      }
    }
  }, [currentSong, audioRef, setIsPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    const h5Player = audioPlayerRef.current;

    if (!audio || !h5Player || !h5Player.audio.current) return;

    // Sync H5Player's audio element with our shared audio
    const h5Audio = h5Player.audio.current;

    const syncTime = () => {
      if (Math.abs(h5Audio.currentTime - audio.currentTime) > 0.5) {
        h5Audio.currentTime = audio.currentTime;
      }
    };

    const handlePlay = () => {
      audio.play();
      setIsPlaying(true);
    };

    const handlePause = () => {
      audio.pause();
      setIsPlaying(false);
    };

    h5Audio.addEventListener("play", handlePlay);
    h5Audio.addEventListener("pause", handlePause);
    h5Audio.addEventListener("timeupdate", syncTime);

    // Sync initial state
    if (audio.src) {
      h5Audio.src = audio.src;
      if (!audio.paused) {
        h5Audio.play();
      }
    }

    return () => {
      h5Audio.removeEventListener("play", handlePlay);
      h5Audio.removeEventListener("pause", handlePause);
      h5Audio.removeEventListener("timeupdate", syncTime);
    };
  }, [audioRef, setIsPlaying]);

  const handleClickNext = () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    if (onSongChange && playlist[nextIndex]) {
      onSongChange(playlist[nextIndex]);
    }
  };

  const handleClickPrev = () => {
    if (playlist.length === 0) return;
    const prevIndex =
      currentTrackIndex > 0 ? currentTrackIndex - 1 : playlist.length - 1;
    setCurrentTrackIndex(prevIndex);
    if (onSongChange && playlist[prevIndex]) {
      onSongChange(playlist[prevIndex]);
    }
  };

  if (playlist.length === 0) {
    return (
      <div className="w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 backdrop-blur-xl bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-zinc-500 text-sm">
            No songs available. Select a track to play.
          </p>
        </div>
      </div>
    );
  }

  const track = playlist[currentTrackIndex];
  if (!track) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 backdrop-blur-xl bg-opacity-95 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4 mb-2">
          <img
            src={track.coverImageUrl || "/placeholder.svg"}
            alt={track.title}
            className="w-14 h-14 rounded-md object-cover shadow-lg"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate text-sm">
              {track.title}
            </h3>
            <p className="text-xs text-zinc-400 truncate">
              {track.mainArtist?.name || "Unknown Artist"}
            </p>
          </div>
        </div>
        <div className="audio-player-wrapper">
          <AudioPlayer
            ref={audioPlayerRef}
            src={track.songUrl}
            showSkipControls={true}
            showJumpControls={false}
            onClickNext={handleClickNext}
            onClickPrevious={handleClickPrev}
            onEnded={handleClickNext}
            layout="horizontal-reverse"
          />
        </div>
      </div>
    </div>
  );
}
