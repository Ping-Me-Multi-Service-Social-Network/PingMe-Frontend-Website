import type { Song } from "@/types/music/song";
import type { SongResponseWithAllAlbum } from "@/types/music";
import { Play, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

interface SongListItemProps {
  song: Song | SongResponseWithAllAlbum;
  onPlay: (song: Song | SongResponseWithAllAlbum) => void;
  index?: number;
}

export default function SongListItem({
  song,
  onPlay,
  index,
}: SongListItemProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="group flex items-center gap-4 px-4 py-3 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 hover:bg-gradient-to-r hover:from-purple-900 hover:via-gray-800/60 hover:to-gray-800/40 hover:border-purple-700/50 hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300">
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
      <div className="relative w-12 h-12 flex-shrink-0">
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
      <div className="hidden sm:block text-sm text-gray-500">
        {/* Support both album (singular) and albums (plural array) */}
        {/* {"album" in song && song.album?.title || "albums" in song && song.albums?.[0]?.title || "Unknown Album"} */}
      </div>
      <div className="text-sm text-gray-500 text-right">
        <div>{formatDuration(song.duration)}</div>
      </div>
      {!index && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onPlay(song)}
          className="ml-2 text-white hover:bg-purple-600 hover:text-white transition-colors"
        >
          <Play className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
