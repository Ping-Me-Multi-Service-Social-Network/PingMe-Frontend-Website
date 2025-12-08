import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import "../audio-player-styles.css";
import { useState, useEffect, useRef } from "react";
import { Heart, ListPlus } from "lucide-react";
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
} from "@/components/ui/dropdown-menu";

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
      } else {
        await favoriteApi.addFavorite(currentSong.id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const handleAddToPlaylist = async (playlistId: number) => {
    if (!currentSong) return;

    try {
      await playlistApi.addSongToPlaylist(playlistId, currentSong.id);
      setShowPlaylistMenu(false);
    } catch (err) {
      console.error("Error adding to playlist:", err);
    }
  };

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
                {playlists.length === 0 ? (
                  <div className="p-3 text-sm text-zinc-400 text-center">
                    No playlists available. Create one first!
                  </div>
                ) : (
                  playlists.map((playlist) => (
                    <DropdownMenuItem
                      key={playlist.id}
                      onClick={() => handleAddToPlaylist(playlist.id)}
                      className="cursor-pointer hover:bg-zinc-700 text-zinc-200"
                    >
                      {playlist.name}
                    </DropdownMenuItem>
                  ))
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
    </div>
  );
}
