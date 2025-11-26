import type React from "react";
import { useEffect, useState } from "react";
import { useAudioPlayer } from "@/contexts/useAudioPlayer";
import {
  Music2,
  ChevronDown,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
} from "lucide-react";
import type { Song } from "@/types/music/song";

const GlobalAudioPlayer: React.FC = () => {
  const {
    currentSong,
    playlist,
    playSong,
    audioRef,
    isPlaying,
    togglePlayPause,
    currentTime,
    duration,
    volume,
    setVolume,
    repeatMode,
    cycleRepeatMode,
  } = useAudioPlayer();
  const [isMinimized, setIsMinimized] = useState(false);

  const handleClickNext = () => {
    if (!currentSong || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(
      (song: Song) => song.id === currentSong.id
    );
    const nextIndex = (currentIndex + 1) % playlist.length;
    playSong(playlist[nextIndex]);
  };

  const handleClickPrevious = () => {
    if (!currentSong || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(
      (song: Song) => song.id === currentSong.id
    );
    const prevIndex =
      currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    playSong(playlist[prevIndex]);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      handleClickNext();
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentSong, playlist, audioRef]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number.parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 1);
  };

  if (!currentSong) return null;

  return (
    <div
      className={`fixed bottom-0 left-16 right-0 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 shadow-2xl transition-all duration-300 z-50 ${
        isMinimized ? "h-16" : "h-24"
      }`}
    >
      {/* Minimized View */}
      {isMinimized ? (
        <div className="h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img
              src={currentSong.coverImageUrl || "/abstract-album-cover.png"}
              alt={currentSong.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="text-white">
              <p className="font-medium text-sm truncate max-w-xs">
                {currentSong.title}
              </p>
              <p className="text-xs text-gray-400 truncate max-w-xs">
                {currentSong.mainArtist.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-white hover:text-blue-400 transition-colors p-2 hover:bg-gray-700 rounded-full"
            title="Expand player"
          >
            <Music2 className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          {/* Full Player View */}
          <button
            onClick={() => setIsMinimized(true)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors z-10 p-1 hover:bg-gray-700 rounded-full"
            title="Minimize player"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          <div className="h-full flex items-center px-6 gap-4">
            {/* Song Info */}
            <div className="flex items-center gap-4 w-1/4 min-w-0">
              <img
                src={currentSong.coverImageUrl || "/abstract-album-cover.png"}
                alt={currentSong.title}
                className="w-14 h-14 rounded object-cover shadow-lg"
              />
              <div className="text-white min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">
                  {currentSong.title}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {currentSong.mainArtist.name}
                  {currentSong.featuredArtists.length > 0 &&
                    `, ${currentSong.featuredArtists
                      .map((a) => a.name)
                      .join(", ")}`}
                </p>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleClickPrevious}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Previous"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="bg-white text-gray-900 rounded-full p-2 hover:scale-105 transition-transform"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleClickNext}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Next"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime || 0}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                  style={{
                    background: `linear-gradient(to right, white 0%, white ${
                      (currentTime / duration) * 100
                    }%, #4b5563 ${
                      (currentTime / duration) * 100
                    }%, #4b5563 100%)`,
                  }}
                />
                <span className="text-xs text-gray-400 w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Loop/Repeat Button */}
              <button
                onClick={cycleRepeatMode}
                className={`transition-colors ${
                  repeatMode === "off"
                    ? "text-gray-400 hover:text-white"
                    : repeatMode === "one"
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-green-400 hover:text-green-300"
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
                  <Repeat1 className="w-5 h-5" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
              </button>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-gray-400 hover:text-white transition-colors"
                  title={volume > 0 ? "Mute" : "Unmute"}
                >
                  {volume > 0 ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <span className="text-xs text-gray-400 w-8">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalAudioPlayer;
