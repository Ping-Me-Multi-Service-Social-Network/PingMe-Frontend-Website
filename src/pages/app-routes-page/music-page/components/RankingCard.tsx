import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { TopSongPlayCounter } from "@/types/music";
import { Music2 } from "lucide-react";
import { getRankingErrorMessage, logError } from "@/utils/errorHandler";

interface RankingCardProps {
    title: string;
    description: string;
    gradientFrom: string;
    gradientVia: string;
    hoverFrom: string;
    hoverTo: string;
    fetchData: () => Promise<TopSongPlayCounter[]>;
    tabType: "today" | "week" | "month";
}

export default function RankingCard({
    title,
    description,
    gradientFrom,
    gradientVia,
    hoverFrom,
    hoverTo,
    fetchData,
    tabType
}: RankingCardProps) {
    const navigate = useNavigate();
    const [songs, setSongs] = useState<TopSongPlayCounter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadSongs = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchData();

                if (isMounted) {
                    setSongs(data.slice(0, 4)); // Get top 4 songs
                }
            } catch (err: unknown) {
                console.error("Error fetching ranking data:", err);
                if (isMounted) {
                    logError(`RankingCard - ${title}`, err);
                    const errorMessage = getRankingErrorMessage(err);
                    setError(errorMessage);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadSongs();

        return () => {
            isMounted = false;
        };
    }, [title]); // Re-fetch if title changes (component type changes)

    const renderSongsContent = () => {
        if (loading) {
            return (
                <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-black/20 animate-pulse">
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

        if (error) {
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2 p-2 bg-yellow-900/20 rounded">
                        <span className="text-yellow-400 text-xs">⚠️</span>
                        <p className="text-yellow-400/90 text-xs flex-1">{error}</p>
                    </div>
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={`error-${i}`}
                            className="flex items-center gap-3 p-2 rounded-lg bg-black/10 opacity-30"
                        >
                            <span className="text-gray-600 font-bold text-sm w-5">{i}</span>
                            <div className="w-10 h-10 rounded bg-gray-800/50"></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-600 text-sm">—</p>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (songs.length === 0) {
            return (
                <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={`empty-${i}`}
                            className="flex items-center gap-3 p-2 rounded-lg bg-black/10 opacity-30"
                        >
                            <span className="text-gray-600 font-bold text-sm w-5">{i}</span>
                            <div className="w-10 h-10 rounded bg-gray-800/50"></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-600 text-sm">—</p>
                            </div>
                        </div>
                    ))}
                    <p className="text-gray-500 text-xs text-center mt-2">No data available</p>
                </div>
            );
        }

        // Always render 4 slots, fill empty ones with placeholders
        const displayItems = [...songs];
        while (displayItems.length < 4) {
            displayItems.push({
                songId: -displayItems.length,
                title: "",
                playCount: 0,
                imgUrl: "",
            } as TopSongPlayCounter);
        }

        return (
            <div className="space-y-2">
                {displayItems.map((song, index) => {
                    if (!song.title) {
                        // Empty placeholder
                        return (
                            <div
                                key={`empty-${index}`}
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
                                    className="w-10 h-10 rounded object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center">
                                    <Music2 className="w-5 h-5 text-gray-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{song.title}</p>
                                <p className="text-gray-400 text-xs truncate">{song.playCount.toLocaleString()} plays</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <button
            className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientVia} to-gray-800 p-6 cursor-pointer hover:scale-105 transition-transform w-full text-left`}
            onClick={() => navigate(`/app/music/rankings?tab=${tabType}`)}
        >
            <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-300 mb-4">{description}</p>

                {/* Top 4 Songs */}
                {renderSongsContent()}
            </div>
            <div className={`absolute inset-0 bg-gradient-to-r ${hoverFrom} ${hoverTo} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </button>
    );
}
