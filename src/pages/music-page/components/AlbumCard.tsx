import type { AlbumResponse } from "@/services/music/albumApi";
import { Disc3 } from "lucide-react";

interface AlbumCardProps {
  album: AlbumResponse;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  return (
    <div className="group bg-zinc-900/50 rounded-lg border border-zinc-800 overflow-hidden hover:bg-zinc-800/80 hover:border-zinc-700 transition-all duration-200 cursor-pointer">
      <div className="relative aspect-square overflow-hidden bg-zinc-800">
        {album.coverImgUrl ? (
          <img
            src={album.coverImgUrl || "/placeholder.svg"}
            alt={album.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Disc3 className="h-16 w-16 text-zinc-700" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white truncate text-sm">
          {album.title}
        </h3>
        <p className="text-xs text-zinc-500 mt-1">
          {album.playCount?.toLocaleString()} plays
        </p>
      </div>
    </div>
  );
}
