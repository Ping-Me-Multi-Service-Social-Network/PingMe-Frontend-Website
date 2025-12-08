import type { Genre } from "@/types/music/genre";

interface GenreTagProps {
  genre: Genre;
  onClick?: (genre: Genre) => void;
}

const genreColors: { [key: string]: string } = {
  Pop: "from-pink-500 to-pink-700",
  Rock: "from-red-600 to-red-800",
  Jazz: "from-blue-500 to-blue-700",
  Classical: "from-purple-500 to-purple-700",
  "Hip-Hop": "from-orange-500 to-orange-700",
  Electronic: "from-cyan-500 to-cyan-700",
  "R&B": "from-rose-500 to-rose-700",
  Country: "from-amber-600 to-amber-800",
  Indie: "from-teal-500 to-teal-700",
  Folk: "from-green-600 to-green-800",
  Metal: "from-gray-700 to-gray-900",
  Blues: "from-indigo-500 to-indigo-700",
  Reggae: "from-yellow-500 to-yellow-700",
  Soul: "from-violet-500 to-violet-700",
  Dance: "from-fuchsia-500 to-fuchsia-700",
  Alternative: "from-lime-600 to-lime-800",
  "K-Pop": "from-pink-400 to-rose-600",
  Latin: "from-red-500 to-orange-600",
  Synthwave: "from-purple-600 to-pink-600",
  Electropop: "from-blue-600 to-purple-600",
};

const getGenreColor = (genreName: string): string => {
  // Tìm màu theo tên chính xác
  if (genreColors[genreName]) {
    return genreColors[genreName];
  }

  // Tìm màu theo partial match
  const matchedKey = Object.keys(genreColors).find(key =>
    genreName.toLowerCase().includes(key.toLowerCase()) ||
    key.toLowerCase().includes(genreName.toLowerCase())
  );

  if (matchedKey) {
    return genreColors[matchedKey];
  }

  // Màu mặc định
  const colors = Object.values(genreColors);
  const hash = genreName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function GenreTag({ genre, onClick }: GenreTagProps) {
  const colorClass = getGenreColor(genre.name);

  return (
    <button
      onClick={() => onClick?.(genre)}
      className={`relative h-32 w-full rounded-xl bg-gradient-to-br ${colorClass} overflow-hidden group hover:scale-105 transition-transform duration-200 shadow-lg`}
    >
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
      <div className="relative h-full flex items-center justify-center p-4">
        <h3 className="text-white font-bold text-xl text-center drop-shadow-lg">
          {genre.name}
        </h3>
      </div>
    </button>
  );
}
