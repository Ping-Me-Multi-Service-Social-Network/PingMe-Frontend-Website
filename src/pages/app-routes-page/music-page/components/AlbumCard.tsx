import type { AlbumResponse } from "@/services/music/albumApi.ts";
import { useNavigate } from "react-router-dom";
import { Disc3 } from "lucide-react";

interface AlbumCardProps {
  album: AlbumResponse;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(
      `/app/music/songs?type=album&id=${album.id}&name=${encodeURIComponent(
        album.title
      )}&imageUrl=${encodeURIComponent(album.coverImgUrl || "")}`
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="group rounded-lg border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all duration-200 cursor-pointer"
    >
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
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-semibold text-white truncate text-sm">
            {album.title}
          </h3>
          <p className="text-xs text-zinc-300 mt-1">
            {album.playCount?.toLocaleString()} plays
          </p>
        </div>
      </div>
    </div>
  );
}
