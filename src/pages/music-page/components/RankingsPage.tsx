import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Play, ChevronRight, ArrowLeft } from "lucide-react";
import { songApi } from "@/services/music/songApi";
import { useAudioPlayer } from "@/contexts/useAudioPlayer";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import type { TopSongPlayCounter } from "@/types/music";

type RankingTab = "today" | "week" | "month";

export default function RankingsPage() {
    const navigate = useNavigate();
    const { playSong } = useAudioPlayer();
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get("tab") as RankingTab | null;
    const [activeTab, setActiveTab] = useState<RankingTab>(tabParam || "today");
    const [todaySongs, setTodaySongs] = useState<TopSongPlayCounter[]>([]);
    const [weekSongs, setWeekSongs] = useState<TopSongPlayCounter[]>([]);
    const [monthSongs, setMonthSongs] = useState<TopSongPlayCounter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Update active tab when URL param changes
    useEffect(() => {
        if (tabParam && ["today", "week", "month"].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                setLoading(true);
                const [today, week, month] = await Promise.all([
                    songApi.getTopSongsToday(50),
                    songApi.getTopSongsThisWeek(50),
                    songApi.getTopSongsThisMonth(50),
                ]);

                console.log("Rankings data:", { today, week, month });
                setTodaySongs(today);
                setWeekSongs(week);
                setMonthSongs(month);
                setError(null);
            } catch (err) {
                console.error("Error fetching rankings:", err);
                setError("Failed to load rankings");
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, []);

    const getCurrentSongs = () => {
        switch (activeTab) {
            case "today":
                return todaySongs;
            case "week":
                return weekSongs;
            case "month":
                return monthSongs;
            default:
                return [];
        }
    };

    const getTabConfig = () => {
        switch (activeTab) {
            case "today":
                return {
                    title: "Top 50 Today",
                    subtitle: "Most listened songs today",
                    bgColor: "from-pink-900/40 via-red-900/40 to-gray-900",
                    accentColor: "from-pink-600 to-red-700",
                };
            case "week":
                return {
                    title: "Top 50 This Week",
                    subtitle: "This week's rankings",
                    bgColor: "from-blue-900/40 via-cyan-900/40 to-gray-900",
                    accentColor: "from-blue-600 to-cyan-700",
                };
            case "month":
                return {
                    title: "Top 50 This Month",
                    subtitle: "This month's rankings",
                    bgColor: "from-purple-900/40 via-indigo-900/40 to-gray-900",
                    accentColor: "from-purple-600 to-indigo-700",
                };
        }
    };

    const handleSongPlay = async (topSong: TopSongPlayCounter) => {
        try {
            // Fetch full song details to play
            const songDetails = await songApi.getSongById(topSong.songId);
            playSong(songDetails);

            // Set playlist to current tab's songs (will need to fetch each one)
            // For now, just play the single song
        } catch (err) {
            console.error("Error fetching song details:", err);
        }
    }; const formatPlayCount = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-900 min-h-full">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-900 min-h-full">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    const config = getTabConfig();
    const currentSongs = getCurrentSongs();

    return (
        <div className="bg-gray-900 pb-32" style={{ minHeight: '100vh' }}>
            {/* Header Tabs */}
            <div className="border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex items-center gap-8">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate("/music")}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-4"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Back</span>
                        </button>

                        {/* Tabs */}
                        <div className="flex gap-8">
                            <button
                                onClick={() => setActiveTab("today")}
                                className={`py-4 px-2 font-semibold transition-colors relative ${activeTab === "today"
                                    ? "text-white"
                                    : "text-gray-400 hover:text-gray-300"
                                    }`}
                            >
                                Top 50 Today
                                {activeTab === "today" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-600 to-red-700" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("week")}
                                className={`py-4 px-2 font-semibold transition-colors relative ${activeTab === "week"
                                    ? "text-white"
                                    : "text-gray-400 hover:text-gray-300"
                                    }`}
                            >
                                Top 50 This Week
                                {activeTab === "week" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-700" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("month")}
                                className={`py-4 px-2 font-semibold transition-colors relative ${activeTab === "month"
                                    ? "text-white"
                                    : "text-gray-400 hover:text-gray-300"
                                    }`}
                            >
                                Top 50 This Month
                                {activeTab === "month" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-700" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Hero Section */}
                <div className={`relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-br ${config.bgColor}`}>
                    <div className="p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-4">
                            <h1 className="text-4xl md:text-5xl font-bold text-white">
                                {config.title}
                            </h1>
                            <button
                                onClick={() => currentSongs.length > 0 && handleSongPlay(currentSongs[0])}
                                className={`p-4 rounded-full bg-gradient-to-r ${config.accentColor} hover:scale-110 transition-transform shadow-lg`}
                            >
                                <Play className="w-8 h-8 text-white fill-white" />
                            </button>
                        </div>
                        <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                            <span className="text-sm font-medium">Add</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Rankings Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {currentSongs.length === 0 ? (
                        <div className="col-span-2 text-center py-12">
                            <p className="text-gray-400 text-lg mb-2">No songs in this ranking yet</p>
                            <p className="text-gray-500 text-sm">Check back later for updated rankings</p>
                        </div>
                    ) : (
                        <>
                            {/* Left Column - Songs 1-25 */}
                            <div className="space-y-3">
                                {currentSongs.slice(0, 25).map((item, index) => (
                                    <div
                                        key={item.songId}
                                        className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                                        onClick={() => handleSongPlay(item)}
                                    >
                                        {/* Rank Number */}
                                        <div className="w-12 text-center">
                                            <span
                                                className={`text-2xl font-bold ${index < 3
                                                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"
                                                    : "text-gray-400"
                                                    }`}
                                            >
                                                {index + 1}
                                            </span>
                                        </div>

                                        {/* Album Cover */}
                                        <div className="relative w-14 h-14 flex-shrink-0">
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
                                            <h3 className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <span className="truncate">
                                                    {item.playCount} plays
                                                </span>
                                            </div>
                                        </div>

                                        {/* Play Count */}
                                        <div className="text-sm text-gray-400">
                                            {formatPlayCount(item.playCount)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Right Column - Songs 26-50 */}
                            <div className="space-y-3">
                                {currentSongs.slice(25, 50).map((item, index) => (
                                    <div
                                        key={item.songId}
                                        className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                                        onClick={() => handleSongPlay(item)}
                                    >
                                        {/* Rank Number */}
                                        <div className="w-12 text-center">
                                            <span className="text-2xl font-bold text-gray-400">
                                                {index + 26}
                                            </span>
                                        </div>

                                        {/* Album Cover */}
                                        <div className="relative w-14 h-14 flex-shrink-0">
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
                                            <h3 className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <span className="truncate">
                                                    {item.playCount} plays
                                                </span>
                                            </div>
                                        </div>

                                        {/* Play Count */}
                                        <div className="text-sm text-gray-400">
                                            {formatPlayCount(item.playCount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
