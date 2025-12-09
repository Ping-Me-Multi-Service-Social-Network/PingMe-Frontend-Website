import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import "../audio-player-styles.css";
import { useState, useEffect, useRef } from "react";
import { Heart, ListPlus, Plus } from "lucide-react";
import type { Song } from "@/types/music/song";
import { useAudioPlayer } from "@/contexts/useAudioPlayer";
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
import { toast } from "sonner";

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
  const [isFavorite, setIsFavorite] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const { audioRef, setIsPlaying } = useAudioPlayer();

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

  // Load playlists when dropdown opens
  useEffect(() => {
    const loadPlaylists = async () => {
      if (!showPlaylistMenu) return;

      try {
        const data = await playlistApi.getPlaylists();
        setPlaylists(data);
      } catch (err) {
        console.error("Error loading playlists:", err);
      }
    };
    loadPlaylists();
  }, [showPlaylistMenu]);

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
  }; useEffect(() => {
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
        {/* Top row: Song info and Action Buttons */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={track.coverImageUrl || "/placeholder.svg"}
              alt={track.title}
              className="w-14 h-14 rounded-md object-cover shadow-lg flex-shrink-0"
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

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className={`p-3 rounded-lg border-2 transition-all font-medium text-sm flex items-center gap-2 ${isFavorite
                ? 'text-red-500 bg-red-500/20 border-red-500/50 hover:bg-red-500/30'
                : 'text-zinc-300 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-white hover:border-zinc-600'
                }`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">
                {isFavorite ? 'Favorited' : 'Favorite'}
              </span>
            </button>

            {/* Add to Playlist Button */}
            <DropdownMenu open={showPlaylistMenu} onOpenChange={setShowPlaylistMenu}>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-3 rounded-lg border-2 border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white hover:border-zinc-600 transition-all font-medium text-sm flex items-center gap-2"
                  title="Add to playlist"
                >
                  <ListPlus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add to Playlist</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-zinc-800 border-zinc-700">
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
}
