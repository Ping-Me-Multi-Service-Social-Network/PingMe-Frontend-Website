import { useNavigate } from "react-router-dom";
import type { ArtistResponse } from "@/types/music";
import { User2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ArtistCardProps {
  artist: ArtistResponse;
}

export default function ArtistCard({ artist }: Readonly<ArtistCardProps>) {
  const navigate = useNavigate();
  const { t } = useTranslation("music");

  const handleClick = () => {
    // Navigate to artist's songs page
    navigate(
      `/app/music/songs?type=artist&id=${artist.id}&name=${encodeURIComponent(
        artist.name
      )}&imageUrl=${encodeURIComponent(artist.imgUrl || "")}`
    );
  };

  return (
    <button
      onClick={handleClick}
      className="group rounded-lg border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all duration-200 cursor-pointer w-full text-left"
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-800">
        {artist.imgUrl ? (
          <img
            src={artist.imgUrl || "/placeholder.svg"}
            alt={artist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User2 className="h-16 w-16 text-zinc-700" />
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/45" />
        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-semibold text-white truncate text-sm">
            {artist.name}
          </h3>
          <p className="text-xs text-zinc-300 mt-1">
            {t("cards.artist")}
          </p>
        </div>
      </div>
    </button>
  );
}
