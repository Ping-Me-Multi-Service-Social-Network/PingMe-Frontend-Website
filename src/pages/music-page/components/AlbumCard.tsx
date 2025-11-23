import type { AlbumResponse } from "@/services/music/albumApi";

interface AlbumCardProps {
  album: AlbumResponse;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer">
      <img
        src={album.coverImgUrl || "/placeholder.svg"}
        alt={album.title}
        className="w-full aspect-square object-cover bg-gray-100"
      />
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{album.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{album.playCount} plays</p>
      </div>
    </div>
  );
}
