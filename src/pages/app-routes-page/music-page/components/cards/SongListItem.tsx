import type { Song } from "@/types/music/song";
import type { SongResponseWithAllAlbum } from "@/types/music";
import { Play, Music2, MoreVertical, Heart } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useState, useEffect } from "react";
import { favoriteApi } from "@/services/music/favoriteApi";
import { toast } from "sonner";
import PlaylistDropdown from "../dialogs/PlaylistDropdown";
import { dispatchFavoriteEvent } from "@/hooks/useFavoriteEvents";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song.id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const action = isFavorite ? favoriteApi.removeFavorite : favoriteApi.addFavorite;
    const successMessage = isFavorite ? "Đã xóa khỏi bài hát yêu thích" : "Đã thêm vào bài hát yêu thích";
    const eventType = isFavorite ? 'favorite-removed' : 'favorite-added';

    try {
      await action(song.id);
      setIsFavorite(!isFavorite);
      toast.success(successMessage);
      dispatchFavoriteEvent(eventType, song.id);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRowClick = () => {
    onPlay(song);
  };

  return (
    <button
      type="button"
      onClick={handleRowClick}
      aria-label={`Phát bài hát ${song.title} của ${song.mainArtist?.name || "Unknown Artist"}`}
      className="group flex items-center gap-4 px-4 py-3 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 hover:bg-linear-to-r hover:from-purple-900 hover:via-gray-800/60 hover:to-gray-800/40 hover:border-purple-700/50 hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 w-full text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {index && (
        <div className="w-8 text-center">
          <span className="text-white group-hover:hidden text-sm font-medium">
            {index}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onPlay(song)}
            className="hidden group-hover:inline-flex h-8 w-8 text-white hover:bg-purple-600 hover:text-zinc-100 transition-colors"
          >
            <Play className="h-4 w-4 fill-current" />
          </Button>
        </div>
      )}
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
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white group-hover:text-purple-300 truncate text-sm transition-colors">
          {song.title}
        </h3>
        <p className="text-xs text-gray-400 truncate">
          {song.mainArtist?.name || "Unknown Artist"}
        </p>
      </div>

      {/* Three sections with fixed widths: Heart, Duration, Three Dots */}
      <div className="flex items-center gap-2">
        {/* Heart Icon - Show on hover or when favorited */}
        <div className="w-14 flex justify-center">
          {(isHovered || isFavorite) && (
            <button
              type="button"
              aria-label={isFavorite ? `Xóa ${song.title} khỏi yêu thích` : `Thêm ${song.title} vào yêu thích`}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(e);
              }}
              className={`transition-colors ${isFavorite
                ? "text-purple-500 hover:text-purple-400"
                : "text-gray-400 hover:text-white"
                }`}
            >
              <Heart
                className={`h-6 w-6 ${isFavorite ? "fill-current" : ""}`}
              />
            </button>
          )}
        </div>

        {/* Duration - Always visible, Fixed width */}
        <div className="w-16 text-base text-gray-400 text-center font-medium">
          {formatDuration(song.duration)}
        </div>

        {/* Three Dots Menu - Show on hover */}
        <div className="w-14 flex justify-center">
          {(isHovered || isMenuOpen) && (
            <PlaylistDropdown
              songId={song.id}
              open={isMenuOpen}
              onOpenChange={setIsMenuOpen}
              variant="full"
              trigger={
                <button
                  type="button"
                  aria-label={`Thêm bài hát ${song.title} vào playlist`}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical className="h-6 w-6" />
                </button>
              }
            />
          )}
        </div>
      </div>

      {!index && !isHovered && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onPlay(song)}
          className="ml-2 text-white hover:bg-purple-600 hover:text-white transition-colors"
        >
          <Play className="h-4 w-4" />
        </Button>
      )}
    </button>
  );
}
