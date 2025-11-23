import type { Genre } from "@/types/music/genre";

interface GenreTagProps {
  genre: Genre;
}

export default function GenreTag({ genre }: GenreTagProps) {
  return (
    <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition">
      {genre.name}
    </button>
  );
}
