"use client";

import type { Song } from "@/types/music/song";
import { Play, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SongListItemProps {
  song: Song;
  onPlay: (song: Song) => void;
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
    <div className="group flex items-center gap-4 px-4 py-3 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all duration-200">
      {index && (
        <div className="w-8 text-center">
          <span className="text-zinc-500 group-hover:hidden text-sm font-medium">
            {index}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onPlay(song)}
            className="hidden group-hover:inline-flex h-8 w-8 text-white hover:bg-zinc-700"
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
            className="w-full h-full rounded object-cover"
          />
        ) : (
          <div className="w-full h-full rounded bg-zinc-800 flex items-center justify-center">
            <Music2 className="h-5 w-5 text-zinc-600" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate text-sm">
          {song.title}
        </h3>
        <p className="text-xs text-zinc-400 truncate">
          {song.mainArtist?.name || "Unknown Artist"}
        </p>
      </div>
      <div className="hidden sm:block text-sm text-zinc-500">
        {/* {song.album?.title || "Unknown Album"} */}
      </div>
      <div className="text-sm text-zinc-500 text-right">
        <div>{formatDuration(song.duration)}</div>
      </div>
      {!index && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onPlay(song)}
          className="ml-2 text-white hover:bg-zinc-700"
        >
          <Play className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
