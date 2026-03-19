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

// ─── Animated bars (Spotify-style) ───────────────────────────────────────────
function AnimatedBars() {
  return (
    <span className="inline-flex items-end gap-px h-4">
      <span className="w-0.5 bg-purple-400 animate-[musicBar1_1s_ease-in-out_infinite]" />
      <span className="w-0.5 bg-purple-400 animate-[musicBar2_1s_ease-in-out_infinite]" />
      <span className="w-0.5 bg-purple-400 animate-[musicBar3_1s_ease-in-out_infinite]" />
    </span>
  );
}

// ─── Index / play-pause area ──────────────────────────────────────────────────
interface IndexAreaProps {
  index: number;
  isCurrent: boolean;
  isSongPlaying: boolean;
  showPlayPause: boolean;
  onPlayPause: (e: React.MouseEvent) => void;
  labelPlay: string;
  labelPause: string;
}

function IndexArea({
  index,
  isCurrent,
  isSongPlaying,
  showPlayPause,
  onPlayPause,
  labelPlay,
  labelPause,
}: Readonly<IndexAreaProps>) {
  if (showPlayPause) {
    return (
      <button
        type="button"
        onClick={onPlayPause}
        className="inline-flex items-center justify-center h-8 w-8 text-white hover:bg-purple-600 rounded transition-colors"
        aria-label={isSongPlaying ? labelPause : labelPlay}
      >
        {isSongPlaying ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-4 w-4 fill-current" />
        )}
      </button>
    );
  }

  return (
    <span
      className={`text-sm font-medium ${isCurrent ? "text-purple-400" : "text-white"}`}
    >
      {isSongPlaying ? <AnimatedBars /> : index}
    </span>
  );
}

// ─── Cover image ──────────────────────────────────────────────────────────────
interface CoverImageProps {
  coverImageUrl?: string | null;
  title: string;
  showOverlay: boolean;
  isSongPlaying: boolean;
}

function CoverImage({
  coverImageUrl,
  title,
  showOverlay,
  isSongPlaying,
}: Readonly<CoverImageProps>) {
  return (
    <div className="relative w-12 h-12 shrink-0">
      {coverImageUrl ? (
        <img
          src={coverImageUrl}
          alt={title}
          className="w-full h-full rounded object-cover shadow-md"
        />
      ) : (
        <div className="w-full h-full rounded bg-gray-700 flex items-center justify-center">
          <Music2 className="h-5 w-5 text-white" />
        </div>
      )}

      {showOverlay && (
        <div className="absolute inset-0 rounded bg-black/50 flex items-center justify-center">
          {isSongPlaying ? (
            <AnimatedBars />
          ) : (
            <Pause className="h-4 w-4 text-purple-400" />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Right-side actions (heart, duration, menu, play button) ──────────────────
interface RightActionsProps {
  song: Song | SongResponseWithAllAlbum;
  hasIndex: boolean;
  isCurrent: boolean;
  isSongPlaying: boolean;
  isHovered: boolean;
  isMenuOpen: boolean;
  isFavorite: boolean;
  onMenuChange: (open: boolean) => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onPlayPause: (e: React.MouseEvent) => void;
  duration: string;
  labelFavorite: string;
  labelPlay: string;
  labelPause: string;
  labelAddToPlaylist: string;
}

function RightActions({
  song,
  hasIndex,
  isCurrent,
  isSongPlaying,
  isHovered,
  isMenuOpen,
  isFavorite,
  onMenuChange,
  onToggleFavorite,
  onPlayPause,
  duration,
  labelFavorite,
  labelPlay,
  labelPause,
  labelAddToPlaylist,
}: Readonly<RightActionsProps>) {
  const showFavoriteButton = isHovered || isFavorite;
  const showMenuButton = isHovered || isMenuOpen;
  const playPauseVisible = isHovered || isCurrent ? "opacity-100" : "opacity-0";
  const playPauseColor = isCurrent
    ? "text-purple-400 hover:text-purple-300 hover:bg-purple-800/50"
    : "text-white hover:bg-purple-600";

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Heart */}
      <div className="w-14 flex justify-center">
        {showFavoriteButton && (
          <button
            type="button"
            aria-label={labelFavorite}
            onClick={onToggleFavorite}
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

      {/* Duration */}
      <div
        className={`w-16 text-sm text-center font-medium ${
          isCurrent ? "text-purple-400" : "text-gray-400"
        }`}
      >
        {duration}
      </div>

      {/* Three-dot menu */}
      <div className="w-10 flex justify-center">
        {showMenuButton && (
          <PlaylistDropdown
            songId={song.id}
            open={isMenuOpen}
            onOpenChange={onMenuChange}
            variant="full"
            trigger={
              <button
                type="button"
                aria-label={labelAddToPlaylist}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            }
          />
        )}
      </div>

      {/* Play/Pause (only when there is no index column) */}
      {!hasIndex && (
        <button
          type="button"
          onClick={onPlayPause}
          aria-label={isSongPlaying ? labelPause : labelPlay}
          className={`ml-1 flex items-center justify-center h-8 w-8 rounded transition-colors ${playPauseColor} ${playPauseVisible}`}
        >
          {isSongPlaying ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
        </button>
      )}
    </div>
  );
}

// ─── useFavorite hook ─────────────────────────────────────────────────────────
function useFavorite(songId: number) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    favoriteApi
      .isFavorite(songId)
      .then(setIsFavorite)
      .catch((err) => console.error("Error checking favorite status:", err));

    const onAdded = (e: Event) => {
      if ((e as CustomEvent<{ songId: number }>).detail.songId === songId)
        setIsFavorite(true);
    };
    const onRemoved = (e: Event) => {
      if ((e as CustomEvent<{ songId: number }>).detail.songId === songId)
        setIsFavorite(false);
    };

    globalThis.addEventListener("favorite-added", onAdded);
    globalThis.addEventListener("favorite-removed", onRemoved);
    return () => {
      globalThis.removeEventListener("favorite-added", onAdded);
      globalThis.removeEventListener("favorite-removed", onRemoved);
    };
  }, [songId]);

  return { isFavorite, setIsFavorite };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SongListItem({
  song,
  onPlay,
  index,
}: Readonly<SongListItemProps>) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation("music");

  const { isSongPlaying, isCurrent, handlePlayPause } = useSongPlayState(
    song.id,
    () => onPlay(song),
  );

  const { isFavorite, setIsFavorite } = useFavorite(song.id);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const action = isFavorite
      ? favoriteApi.removeFavorite
      : favoriteApi.addFavorite;
    const successMsg = isFavorite
      ? t("cards.favoriteRemoved")
      : t("cards.favoriteAdded");
    const eventType = isFavorite ? "favorite-removed" : "favorite-added";

    try {
      await action(song.id);
      setIsFavorite(!isFavorite);
      toast.success(successMsg);
      dispatchFavoriteEvent(eventType, song.id);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error(t("cards.error"));
    }
  };

  const rowClass = isCurrent
    ? "bg-purple-900/40 border-purple-700/60 shadow-lg shadow-purple-900/20"
    : "bg-gray-800/60 border-gray-700/50 hover:bg-linear-to-r hover:from-purple-900 hover:via-gray-800/60 hover:to-gray-800/40 hover:border-purple-700/50 hover:shadow-lg hover:shadow-purple-900/20";

  const unknownArtist = t("cards.unknownArtist");

  return (
    <li
      className={`group relative flex items-center gap-4 px-4 py-3 backdrop-blur-sm rounded-lg border transition-all duration-300 list-none ${rowClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Invisible full-row click area */}
      <button
        type="button"
        aria-label={
          isSongPlaying
            ? t("cards.pauseSong", { title: song.title })
            : t("cards.playSong", {
                title: song.title,
                artist: song.mainArtist?.name ?? unknownArtist,
              })
        }
        onClick={handlePlayPause}
        className="absolute inset-0 w-full h-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer z-0"
      />

      {/* Content above click area */}
      <div className="relative z-10 flex items-center gap-4 w-full">

        {/* Index column */}
        {index ? (
          <div className="w-8 text-center shrink-0">
            <IndexArea
              index={index}
              isCurrent={isCurrent}
              isSongPlaying={isSongPlaying}
              showPlayPause={isHovered || isCurrent}
              onPlayPause={handlePlayPause}
              labelPlay={t("cards.play")}
              labelPause={t("cards.pause")}
            />
          </div>
        ) : null}

        {/* Cover image */}
        <CoverImage
          coverImageUrl={song.coverImageUrl}
          title={song.title}
          showOverlay={!index && isCurrent}
          isSongPlaying={isSongPlaying}
        />

        {/* Song info */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold truncate text-sm transition-colors ${
              isCurrent ? "text-purple-300" : "text-white group-hover:text-purple-300"
            }`}
          >
            {song.title}
          </h3>
          <p className="text-xs text-gray-400 truncate">
            {song.mainArtist?.name ?? unknownArtist}
          </p>
        </div>

        {/* Right actions */}
        <RightActions
          song={song}
          hasIndex={Boolean(index)}
          isCurrent={isCurrent}
          isSongPlaying={isSongPlaying}
          isHovered={isHovered}
          isMenuOpen={isMenuOpen}
          isFavorite={isFavorite}
          onMenuChange={setIsMenuOpen}
          onToggleFavorite={handleToggleFavorite}
          onPlayPause={handlePlayPause}
          duration={formatDuration(song.duration)}
          labelFavorite={
            isFavorite
              ? t("cards.removeFavorite", { title: song.title })
              : t("cards.addFavorite", { title: song.title })
          }
          labelPlay={t("cards.play")}
          labelPause={t("cards.pause")}
          labelAddToPlaylist={t("cards.addToPlaylist", { title: song.title })}
        />
      </div>
    </li>
  );
}