import type { AlbumResponse } from "@/services/music/albumApi.ts";
import { useNavigate } from "react-router-dom";
import { Disc3 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AlbumCardProps {
  album: AlbumResponse;
}

export default function AlbumCard({ album }: Readonly<AlbumCardProps>) {
  const navigate = useNavigate();
  const { t } = useTranslation("music");

  const handleClick = () => {
    navigate(
      `/app/music/songs?type=album&id=${album.id}&name=${encodeURIComponent(
        album.title
      )}&imageUrl=${encodeURIComponent(album.coverImgUrl || "")}`
    );
  };

  return (
    <button
      onClick={handleClick}
      className="group rounded-lg border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all duration-200 cursor-pointer w-full text-left"
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
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/45" />
        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-semibold text-white truncate text-sm">
            {album.title}
          </h3>
          <p className="text-xs text-zinc-300 mt-1">
            {t("cards.plays", { playCount: album.playCount?.toLocaleString() })}
          </p>
        </div>
      </div>
    </button>
  );
}
