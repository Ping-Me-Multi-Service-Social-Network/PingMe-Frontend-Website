import { useNavigate } from "react-router-dom";
import type { TopSongPlayCounter } from "@/types/music";
import { Music2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RankingCardProps {
    title: string;
    description: string;
    gradientFrom: string;
    gradientVia: string;
    hoverFrom: string;
    hoverTo: string;
    songs: TopSongPlayCounter[];
    tabType: "today" | "week" | "month";
    loading?: boolean;
}

export default function RankingCard({
    title,
    description,
    gradientFrom,
    gradientVia,
    hoverFrom,
    hoverTo,
    songs = [],
    tabType,
    loading = false,
}: Readonly<RankingCardProps>) {
    const navigate = useNavigate();
    const { t } = useTranslation("music");

    const displaySongs = songs.slice(0, 4);

    const renderSongsContent = () => {
        if (loading) {
            return (
                <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={`loading-${title}-${i}`} className="flex items-center gap-3 p-2 rounded-lg bg-black/20 animate-pulse">
                            <div className="w-10 h-10 bg-gray-700 rounded"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                                <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (displaySongs.length === 0) {
            return (
                <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={`empty-${title}-${i}`}
                            className="flex items-center gap-3 p-2 rounded-lg bg-black/10 opacity-30"
                        >
                            <span className="text-gray-600 font-bold text-sm w-5">{i}</span>
                            <div className="w-10 h-10 rounded bg-gray-800/50"></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-600 text-sm">—</p>
                            </div>
                        </div>
                    ))}
                    <p className="text-gray-500 text-xs text-center mt-2">{t("cards.noData")}</p>
                </div>
            );
        }

        // Always render 4 slots, fill empty ones with placeholders
        const items = [...displaySongs];
        while (items.length < 4) {
            items.push({
                songId: -items.length,
                title: "",
                playCount: 0,
                imgUrl: "",
            } as TopSongPlayCounter);
        }

        return (
            <div className="space-y-2">
                {items.map((song, index) => {
                    if (!song.title) {
                        // Empty placeholder
                        return (
                            <div
                                key={`placeholder-${title}-${song.songId}`}
                                className="flex items-center gap-3 p-2 rounded-lg bg-black/10 opacity-40"
                            >
                                <span className="text-gray-500 font-bold text-sm w-5">{index + 1}</span>
                                <div className="w-10 h-10 rounded bg-gray-700/50"></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-500 text-sm">—</p>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={song.songId}
                            className="flex items-center gap-3 p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"
                        >
                            <span className="text-white font-bold text-sm w-5">{index + 1}</span>
                            {song.imgUrl ? (
                                <img
                                    src={song.imgUrl}
                                    alt={song.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-10 h-10 rounded object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center">
                                    <Music2 className="w-5 h-5 text-gray-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{song.title}</p>
                                <p className="text-gray-400 text-xs truncate">{t("cards.plays", { playCount: song.playCount.toLocaleString() })}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <button
            className={`group relative overflow-hidden rounded-xl bg-linear-to-br ${gradientFrom} ${gradientVia} to-gray-800 p-6 cursor-pointer hover:scale-105 transition-transform w-full text-left`}
            onClick={() => navigate(`/app/music/rankings?tab=${tabType}`)}
        >
            <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-300 mb-4">{description}</p>

                {/* Top 4 Songs */}
                {renderSongsContent()}
            </div>
            <div className={`absolute inset-0 bg-linear-to-r ${hoverFrom} ${hoverTo} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </button>
    );
}
