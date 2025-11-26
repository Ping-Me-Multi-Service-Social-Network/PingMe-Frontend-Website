import React from "react";

import { useEffect, useState } from "react";
import { useAudioPlayer } from "@/contexts/useAudioPlayer";
import {
  Music2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
} from "lucide-react";
import type { Song } from "@/types/music/song";

const DraggableMiniPlayer: React.FC = () => {
  const {
    currentSong,
    playlist,
    playSong,
    isPlaying,
    togglePlayPause,
    audioRef,
    volume,
    setVolume,
    repeatMode,
    cycleRepeatMode,
  } = useAudioPlayer();
  const [position, setPosition] = useState({
    x: window.innerWidth - 320,
    y: window.innerHeight - 140,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const miniPlayerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (miniPlayerRef.current) {
      const rect = miniPlayerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(
          0,
          Math.min(e.clientX - dragOffset.x, window.innerWidth - 280)
        );
        const newY = Math.max(
          0,
          Math.min(e.clientY - dragOffset.y, window.innerHeight - 120)
        );
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handlePlayPause = () => {
    togglePlayPause();
  };

  const handleNext = () => {
    if (!currentSong || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(
      (song: Song) => song.id === currentSong.id
    );
    const nextIndex = (currentIndex + 1) % playlist.length;
    playSong(playlist[nextIndex]);
  };

  const handlePrevious = () => {
    if (!currentSong || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(
      (song: Song) => song.id === currentSong.id
    );
    const prevIndex =
      currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    playSong(playlist[prevIndex]);
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    //MẶC KỆ LỖI, NÓ CHẠY LÀ ĐƯỢC, MAI MỐT FIX SAU
    playSong(null as unknown as Song);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 1);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentSong, playlist, audioRef]);

  if (!currentSong) return null;

  return (
    <div
      ref={miniPlayerRef}
      className="fixed bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-xl shadow-2xl backdrop-blur-sm border border-purple-500/30 z-[100]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "280px",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors z-10"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <X className="w-4 h-4" />
      </button>

      <div className="p-3">
        {/* Album Art & Info */}
        <div className="flex items-center gap-2 mb-2">
          <img
            src={currentSong?.coverImageUrl || "/placeholder.svg"}
            alt={currentSong?.title || "Song"}
            className="w-12 h-12 rounded-lg object-cover shadow-lg"
          />
          <div className="text-white flex-1 min-w-0">
            <p className="font-semibold text-xs truncate">
              {currentSong?.title}
            </p>
            <p className="text-[10px] text-purple-200 truncate">
              {currentSong?.mainArtist?.name}
            </p>
          </div>
          <Music2 className="w-4 h-4 text-purple-300" />
        </div>

        {/* Controls */}
        <div
          className="flex items-center justify-center gap-3 mb-2"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={handlePrevious}
            className="text-white/70 hover:text-white transition-colors hover:scale-110 transform"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={handlePlayPause}
            className="bg-white text-purple-900 rounded-full p-2 hover:scale-110 transform transition-all shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleNext}
            className="text-white/70 hover:text-white transition-colors hover:scale-110 transform"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume and loop controls */}
        <div
          className="flex items-center justify-between px-1"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Loop/Repeat Button with 3 states */}
          <button
            onClick={cycleRepeatMode}
            className={`transition-colors ${
              repeatMode === "off"
                ? "text-white/50 hover:text-white"
                : repeatMode === "one"
                ? "text-purple-300 hover:text-purple-200"
                : "text-green-300 hover:text-green-200"
            }`}
            title={
              repeatMode === "off"
                ? "Enable repeat all"
                : repeatMode === "all"
                ? "Enable repeat one"
                : "Disable repeat"
            }
          >
            {repeatMode === "one" ? (
              <Repeat1 className="w-3.5 h-3.5" />
            ) : (
              <Repeat className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Volume Control - always visible */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="text-white/70 hover:text-white transition-colors"
              title={volume > 0 ? "Mute" : "Unmute"}
            >
              {volume > 0 ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-purple-600 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <span className="text-[10px] text-purple-200 w-7">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraggableMiniPlayer;
