import { Play } from "lucide-react";
import type { SongResponseWithAllAlbum } from "@/types/music";

interface TwoColumnLayoutProps<T> {
    items: T[];
    renderRankItem: (item: T, index: number) => React.ReactNode;
    renderSongItem: (item: T, song: SongResponseWithAllAlbum | undefined) => React.ReactNode;
    itemSongsMap: Map<number, SongResponseWithAllAlbum[]>;
    getItemId: (item: T) => number;
    rankTitle?: string;
    songTitle?: string;
}

export default function TwoColumnLayout<T>({
    items,
    renderRankItem,
    renderSongItem,
    itemSongsMap,
    getItemId,
    rankTitle = "🏆 Rank",
    songTitle = "🔥 Trending song"
}: Readonly<TwoColumnLayoutProps<T>>) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Rank Column */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    {rankTitle}
                </h2>
                <div className="space-y-3">
                    {items.slice(0, 10).map((item, index) => renderRankItem(item, index))}
                </div>
            </div>

            {/* Song Column */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    {songTitle}
                </h2>
                <div className="space-y-3">
                    {items.slice(0, 10).map((item) => {
                        const songs = itemSongsMap.get(getItemId(item));
                        const song = songs?.[0];
                        return renderSongItem(item, song);
                    })}
                </div>
            </div>
        </div>
    );
}

interface SongItemCardProps {
    imageUrl: string;
    imageAlt: string;
    title: string;
    subtitle: string;
    additionalInfo?: React.ReactNode;
    onItemClick: () => void;
    onPlayClick?: (e: React.MouseEvent) => void;
    showPlayButton?: boolean;
}

export function SongItemCard({
    imageUrl,
    imageAlt,
    title,
    subtitle,
    additionalInfo,
    onItemClick,
    onPlayClick,
    showPlayButton = true
}: Readonly<SongItemCardProps>) {
    return (
        <button
            onClick={onItemClick}
            className="flex items-center gap-4 p-4 bg-zinc-800/30 hover:bg-zinc-800/60 rounded-lg transition group cursor-pointer w-full text-left"
        >
            <div className="relative">
                <img
                    src={imageUrl}
                    alt={imageAlt}
                    className="w-16 h-16 rounded-lg object-cover"
                />
                {showPlayButton && onPlayClick && (
                    <button
                        onClick={onPlayClick}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition rounded-lg"
                    >
                        <Play className="w-6 h-6 text-white fill-white" />
                    </button>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{title}</h3>
                <p className="text-sm text-zinc-400 truncate">{subtitle}</p>
                {additionalInfo}
            </div>
        </button>
    );
}

interface EmptySongItemProps {
    imageUrl: string;
    imageAlt: string;
    emptyMessage: string;
    subtitle: string;
}

export function EmptySongItem({ imageUrl, imageAlt, emptyMessage, subtitle }: Readonly<EmptySongItemProps>) {
    return (
        <div className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-lg">
            <img
                src={imageUrl}
                alt={imageAlt}
                className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
                <p className="text-zinc-500 text-sm">{emptyMessage}</p>
                <p className="text-zinc-600 text-xs">{subtitle}</p>
            </div>
        </div>
    );
}
