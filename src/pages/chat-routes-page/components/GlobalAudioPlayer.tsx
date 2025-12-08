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
  Heart,
  ListPlus,
} from "lucide-react";
import type { Song } from "@/types/music/song";
import { favoriteApi } from "@/services/music/favoriteApi";
import { playlistApi } from "@/services/music/playlistApi";
import type { PlaylistDto } from "@/types/music/playlist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

import { toast } from "sonner";

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
  const [isFavorite, setIsFavorite] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  // Check if current song is favorited
  useEffect(() => {
    const checkFavorite = async () => {
      if (currentSong) {
        try {
          const result = await favoriteApi.isFavorite(currentSong.id);
          setIsFavorite(result);
        } catch (err) {
          console.error("Error checking favorite:", err);
        }
      }
    };
    checkFavorite();
  }, [currentSong]);

  // Listen for favorite updates from other components
  useEffect(() => {
    const handleFavoriteAdded = (event: Event) => {
      const customEvent = event as CustomEvent<{ songId: number }>;
      if (currentSong && customEvent.detail.songId === currentSong.id) {
        setIsFavorite(true);
      }
    };

    const handleFavoriteRemoved = (event: Event) => {
      const customEvent = event as CustomEvent<{ songId: number }>;
      if (currentSong && customEvent.detail.songId === currentSong.id) {
        setIsFavorite(false);
      }
    };

    window.addEventListener('favorite-added', handleFavoriteAdded);
    window.addEventListener('favorite-removed', handleFavoriteRemoved);

    return () => {
      window.removeEventListener('favorite-added', handleFavoriteAdded);
      window.removeEventListener('favorite-removed', handleFavoriteRemoved);
    };
  }, [currentSong]);

  // Load playlists
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const data = await playlistApi.getPlaylists();
        setPlaylists(data);
      } catch (err) {
        console.error("Error loading playlists:", err);
      }
    };
    loadPlaylists();
  }, []);

  const handleToggleFavorite = async () => {
    if (!currentSong) return;

    try {
      if (isFavorite) {
        await favoriteApi.removeFavorite(currentSong.id);
        setIsFavorite(false);
        // Dispatch event to notify FavoritesPage to refresh
        window.dispatchEvent(new CustomEvent('favorite-removed', {
          detail: { songId: currentSong.id }
        }));
      } else {
        await favoriteApi.addFavorite(currentSong.id);
        setIsFavorite(true);
        // Dispatch event to notify FavoritesPage to refresh
        window.dispatchEvent(new CustomEvent('favorite-added', {
          detail: { songId: currentSong.id }
        }));
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      const error = err as { response?: { data?: unknown; status?: number } };
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim() || !currentSong) return;

    try {
      setCreating(true);
      const newPlaylist = await playlistApi.createPlaylist({
        name: newPlaylistName,
        isPublic: isPublic,
      });

      // Add current song to the newly created playlist
      await playlistApi.addSongToPlaylist(newPlaylist.id, currentSong.id);

      setPlaylists(prev => [...prev, newPlaylist]);
      setShowCreateDialog(false);
      setNewPlaylistName("");
      setIsPublic(false);
      toast.success(`Playlist "${newPlaylist.name}" created and "${currentSong.title}" added!`);

      // Dispatch event to refresh playlist detail page
      window.dispatchEvent(new CustomEvent('playlist-updated', {
        detail: { playlistId: newPlaylist.id, songId: currentSong.id }
      }));
    } catch (err) {
      console.error("Error creating playlist:", err);
      toast.error("Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: number) => {
    if (!currentSong) return;

    try {
      const result = await playlistApi.addSongToPlaylist(playlistId, currentSong.id);
      const playlist = playlists.find(p => p.id === playlistId);

      if (result?.alreadyExists) {
        toast.error(`"${currentSong.title}" is already in playlist "${playlist?.name}"`);
      } else {
        toast.success(`Added "${currentSong.title}" to playlist "${playlist?.name}"`);
        // Dispatch custom event to notify PlaylistDetailPage to refresh
        window.dispatchEvent(new CustomEvent('playlist-updated', {
          detail: { playlistId, songId: currentSong.id }
        }));
      }
      setShowPlaylistMenu(false);
    } catch (err) {
      console.error("Error adding to playlist:", err);
      toast.error("Failed to add song to playlist");
    }
  }; const handleClickNext = () => {
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
      className={`fixed bottom-0 left-16 right-0 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 shadow-2xl transition-all duration-300 z-50 ${isMinimized ? "h-16" : "h-24"
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
                  {currentSong.featuredArtists?.length > 0 &&
                    `, ${currentSong.featuredArtists
                      .map((a) => a.name)
                      .join(", ")}`}
                </p>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {/* Favorite Button */}
                <button
                  onClick={handleToggleFavorite}
                  className={`transition-colors ${isFavorite ? "text-red-500" : "text-gray-400 hover:text-white"
                    }`}
                  title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                </button>

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

                {/* Add to Playlist Button */}
                <DropdownMenu open={showPlaylistMenu} onOpenChange={setShowPlaylistMenu}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Add to playlist"
                    >
                      <ListPlus className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56 bg-zinc-800 border-zinc-700">
                    <DropdownMenuItem
                      onClick={() => {
                        setShowPlaylistMenu(false);
                        setShowCreateDialog(true);
                      }}
                      className="cursor-pointer hover:bg-zinc-700 text-blue-400 font-medium"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Playlist
                    </DropdownMenuItem>
                    {playlists.length > 0 && (
                      <>
                        <DropdownMenuSeparator className="bg-zinc-700" />
                        {playlists.map((playlist) => (
                          <DropdownMenuItem
                            key={playlist.id}
                            onClick={() => handleAddToPlaylist(playlist.id)}
                            className="cursor-pointer hover:bg-zinc-700 text-zinc-200"
                          >
                            {playlist.name}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
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
                    background: `linear-gradient(to right, white 0%, white ${(currentTime / duration) * 100
                      }%, #4b5563 ${(currentTime / duration) * 100
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
                className={`transition-colors ${repeatMode === "off"
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

      {/* Create Playlist Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="playlist-name" className="text-zinc-200">
                Playlist Name
              </Label>
              <Input
                id="playlist-name"
                placeholder="Enter playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="is-public" className="text-zinc-200 cursor-pointer">
                Make this playlist public
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlaylist}
              disabled={!newPlaylistName.trim() || creating}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GlobalAudioPlayer;