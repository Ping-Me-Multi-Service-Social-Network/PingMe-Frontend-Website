import type { Genre } from "@/types/music/genre"

interface GenreTagProps {
  genre: Genre
  onClick?: (genre: Genre) => void
}

export default function GenreTag({ genre, onClick }: GenreTagProps) {
  return (
    <button
      onClick={() => onClick?.(genre)}
      className="px-5 py-2.5 bg-zinc-800/80 text-zinc-200 border border-zinc-700 rounded-full text-sm font-medium hover:bg-zinc-700 hover:border-zinc-600 hover:text-white transition-all duration-200"
    >
      {genre.name}
    </button>
  )
}
