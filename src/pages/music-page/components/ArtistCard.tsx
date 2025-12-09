import { useNavigate } from "react-router-dom";
import type { ArtistResponse } from "@/types/music";

interface ArtistCardProps {
  artist: ArtistResponse;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to artist's songs page
    navigate(
      `/music/songs?type=artist&id=${artist.id}&name=${encodeURIComponent(
        artist.name
      )}&imageUrl=${encodeURIComponent(artist.imgUrl || "")}`
    );
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
    >
      <img
        src={artist.imgUrl || "/placeholder.svg"}
        alt={artist.name}
        className="w-full aspect-square object-cover rounded-full"
      />
      <h3 className="text-sm font-semibold text-white text-center truncate">
        {artist.name}
      </h3>
    </div>
  );
}
