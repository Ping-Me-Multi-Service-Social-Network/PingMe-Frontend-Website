"use client";

import type { Song } from "@/types/music/song";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SongListItemProps {
  song: Song;
  onPlay: (song: Song) => void;
}

export default function SongListItem({ song, onPlay }: SongListItemProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition">
      <img
        src={song.coverImageUrl || "/placeholder.svg"}
        alt={song.title}
        className="w-12 h-12 rounded object-cover"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{song.title}</h3>
        <p className="text-sm text-gray-600 truncate">
          {song.mainArtist?.name || "Unknown Artist"}
        </p>
      </div>
      <div className="text-sm text-gray-500 text-right">
        <div>{formatDuration(song.duration)}</div>
        <div className="text-xs">{song.playCount} plays</div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onPlay(song)}
        className="ml-2"
      >
        <Play className="h-4 w-4" />
      </Button>
    </div>
  );
}
