import type { Song } from "@/types/music/song";
import type { SongResponseWithAllAlbum } from "@/types/music";
import { Play, Pause, Music2, MoreVertical, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { favoriteApi } from "@/services/music/favoriteApi";
import { toast } from "sonner";
import PlaylistDropdown from "../dialogs/PlaylistDropdown";
import { dispatchFavoriteEvent } from "@/hooks/useFavoriteEvents";
import { useTranslation } from "react-i18next";
import { useSongPlayState } from "@/hooks/usePlayState";

interface SongListItemProps {
  song: Song | SongResponseWithAllAlbum;
  onPlay: (song: Song | SongResponseWithAllAlbum) => void;
  index?: number;
}

export default function SongListItem({
  song,
  onPlay,
  index,
}: Readonly<SongListItemProps>) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation("music");

  const { isSongPlaying, isCurrent, handlePlayPause } =
    useSongPlayState(song.id, () => onPlay(song));

  const checkIfFavorite = async () => {
    try {
      const result = await favoriteApi.isFavorite(song.id);
      setIsFavorite(result);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  useEffect(() => {
    checkIfFavorite();

    const handleFavoriteAdded = (event: Event) => {
      const customEvent = event as CustomEvent<{ songId: number }>;
      if (customEvent.detail.songId === song.id) setIsFavorite(true);
    };

    const handleFavoriteRemoved = (event: Event) => {
      const customEvent = event as CustomEvent<{ songId: number }>;
      if (customEvent.detail.songId === song.id) setIsFavorite(false);
    };

    globalThis.addEventListener("favorite-added", handleFavoriteAdded);
    globalThis.addEventListener("favorite-removed", handleFavoriteRemoved);

    return () => {
      globalThis.removeEventListener("favorite-added", handleFavoriteAdded);
      globalThis.removeEventListener("favorite-removed", handleFavoriteRemoved);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song.id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const action = isFavorite ? favoriteApi.removeFavorite : favoriteApi.addFavorite;
    const successMessage = isFavorite ? t("cards.favoriteRemoved") : t("cards.favoriteAdded");
    const eventType = isFavorite ? "favorite-removed" : "favorite-added";

    try {
      await action(song.id);
      setIsFavorite(!isFavorite);
      toast.success(successMessage);
      dispatchFavoriteEvent(eventType, song.id);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error(t("cards.error"));
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Show play/pause icon in the index area when hovered OR this song is current
  const showPlayPauseInIndex = isHovered || isCurrent;

  return (
    <li
      className={`group relative flex items-center gap-4 px-4 py-3 backdrop-blur-sm rounded-lg border transition-all duration-300 list-none ${
        isCurrent
          ? "bg-purple-900/40 border-purple-700/60 shadow-lg shadow-purple-900/20"
          : "bg-gray-800/60 border-gray-700/50 hover:bg-linear-to-r hover:from-purple-900 hover:via-gray-800/60 hover:to-gray-800/40 hover:border-purple-700/50 hover:shadow-lg hover:shadow-purple-900/20"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Invisible full-row click area — real <button>, sits behind content via z-index */}
      <button
        type="button"
        aria-label={
          isSongPlaying
            ? t("cards.pauseSong", { title: song.title })
            : t("cards.playSong", { title: song.title, artist: song.mainArtist?.name || t("cards.unknownArtist") })
        }
        onClick={(e) => handlePlayPause(e)}
        className="absolute inset-0 w-full h-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer z-0"
      />

      {/* All content sits above the click area via z-10 */}
      <div className="relative z-10 flex items-center gap-4 w-full">

        {/* Index / Play / Pause icon */}
        {index ? (
          <div className="w-8 text-center shrink-0">
            {showPlayPauseInIndex ? (
              // On hover or if current: show play/pause button
              <button
                type="button"
                onClick={(e) => handlePlayPause(e)}
                className="inline-flex items-center justify-center h-8 w-8 text-white hover:bg-purple-600 rounded transition-colors"
                aria-label={isSongPlaying ? t("cards.pause") : t("cards.play")}
              >
                {isSongPlaying ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
              </button>
            ) : (
              // Idle: show index number, with purple color if this song is current
              <span
                className={`text-sm font-medium ${
                  isCurrent ? "text-purple-400" : "text-white"
                }`}
              >
                {isSongPlaying ? (
                  // Animated bars like Spotify when playing
                  <span className="inline-flex items-end gap-px h-4">
                    <span className="w-0.5 bg-purple-400 animate-[musicBar1_1s_ease-in-out_infinite]" />
                    <span className="w-0.5 bg-purple-400 animate-[musicBar2_1s_ease-in-out_infinite]" />
                    <span className="w-0.5 bg-purple-400 animate-[musicBar3_1s_ease-in-out_infinite]" />
                  </span>
                ) : (
                  index
                )}
              </span>
            )}
          </div>
        ) : null}

        {/* Cover image */}
        <div className="relative w-12 h-12 shrink-0">
          {song.coverImageUrl ? (
            <img
              src={song.coverImageUrl || "/placeholder.svg"}
              alt={song.title}
              className="w-full h-full rounded object-cover shadow-md"
            />
          ) : (
            <div className="w-full h-full rounded bg-gray-700 flex items-center justify-center">
              <Music2 className="h-5 w-5 text-white" />
            </div>
          )}
          {/* Playing indicator overlay on image when no index */}
          {!index && isCurrent && (
            <div className="absolute inset-0 rounded bg-black/50 flex items-center justify-center">
              {isSongPlaying ? (
                <span className="inline-flex items-end gap-px h-4">
                  <span className="w-0.5 bg-purple-400 animate-[musicBar1_1s_ease-in-out_infinite]" />
                  <span className="w-0.5 bg-purple-400 animate-[musicBar2_1s_ease-in-out_infinite]" />
                  <span className="w-0.5 bg-purple-400 animate-[musicBar3_1s_ease-in-out_infinite]" />
                </span>
              ) : (
                <Pause className="h-4 w-4 text-purple-400" />
              )}
            </div>
          )}
        </div>

        {/* Song info */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold truncate text-sm transition-colors ${
              isCurrent
                ? "text-purple-300"
                : "text-white group-hover:text-purple-300"
            }`}
          >
            {song.title}
          </h3>
          <p className="text-xs text-gray-400 truncate">
            {song.mainArtist?.name || t("cards.unknownArtist")}
          </p>
        </div>

        {/* Right-side actions: Heart, Duration, Three Dots */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Heart Icon - Show on hover or when favorited */}
          <div className="w-14 flex justify-center">
            {(isHovered || isFavorite) && (
              <button
                type="button"
                aria-label={
                  isFavorite
                    ? t("cards.removeFavorite", { title: song.title })
                    : t("cards.addFavorite", { title: song.title })
                }
                onClick={handleToggleFavorite}
                className={`transition-colors ${
                  isFavorite
                    ? "text-purple-500 hover:text-purple-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
            )}
          </div>

          {/* Duration - Always visible */}
          <div
            className={`w-16 text-sm text-center font-medium ${
              isCurrent ? "text-purple-400" : "text-gray-400"
            }`}
          >
            {formatDuration(song.duration)}
          </div>

          {/* Three Dots Menu - Show on hover */}
          <div className="w-10 flex justify-center">
            {(isHovered || isMenuOpen) && (
              <PlaylistDropdown
                songId={song.id}
                open={isMenuOpen}
                onOpenChange={setIsMenuOpen}
                variant="full"
                trigger={
                  <button
                    type="button"
                    aria-label={t("cards.addToPlaylist", { title: song.title })}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                }
              />
            )}
          </div>

          {/* Play/Pause button when no index */}
          {!index && (
            <button
              type="button"
              onClick={(e) => handlePlayPause(e)}
              aria-label={isSongPlaying ? t("cards.pause") : t("cards.play")}
              className={`ml-1 flex items-center justify-center h-8 w-8 rounded transition-colors ${
                isCurrent
                  ? "text-purple-400 hover:text-purple-300 hover:bg-purple-800/50"
                  : "text-white hover:bg-purple-600"
              } ${isHovered || isCurrent ? "opacity-100" : "opacity-0"}`}
            >
              {isSongPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}