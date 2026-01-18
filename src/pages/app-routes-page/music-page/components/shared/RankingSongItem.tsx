import { Play } from "lucide-react";
import type { TopSongPlayCounter } from "@/types/music";

interface RankingSongItemProps {
    item: TopSongPlayCounter;
    rank: number;
    onClick: () => void;
}

const formatPlayCount = (count: number): string => {
    if (count >= 1_000_000) {
        return `${(count / 1_000_000).toFixed(1)}M`;
    }
    if (count >= 1_000) {
        return `${(count / 1_000).toFixed(1)}K`;
    }
    return count.toString();
};

export default function RankingSongItem({ item, rank, onClick }: Readonly<RankingSongItemProps>) {
    return (
        <button
            className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer w-full text-left"
            onClick={onClick}
        >
            {/* Rank Number */}
            <div className="w-12 text-center">
                <span
                    className={`text-2xl font-bold ${rank <= 3
                        ? "bg-linear-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"
                        : "text-gray-400"
                        }`}
                >
                    {rank}
                </span>
            </div>

            {/* Album Cover */}
            <div className="relative w-14 h-14 shrink-0">
                <img
                    src={item.imgUrl}
                    alt={item.title}
                    className="w-full h-full object-cover rounded"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white" />
                </div>
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate group-hover:text-purple-400 transition-colors">
                    {item.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="truncate">{item.playCount} plays</span>
                </div>
            </div>

            {/* Play Count */}
            <div className="text-sm text-gray-400">
                {formatPlayCount(item.playCount)}
            </div>
        </button>
    );
}
