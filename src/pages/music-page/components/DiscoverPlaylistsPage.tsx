import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Music, Globe, Users, Loader2 } from "lucide-react";
import { playlistApi } from "@/services/music/playlistApi";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import { EmptyState } from "@/components/custom/EmptyState";
import type { PlaylistDto } from "@/types/music/playlist";
import { Button } from "@/components/ui/button";

export default function DiscoverPlaylistsPage() {
    const navigate = useNavigate();
    const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const pageSize = 20;

    useEffect(() => {
        fetchPublicPlaylists(0);
    }, []);

    const fetchPublicPlaylists = async (page: number) => {
        try {
            if (page === 0) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const data = await playlistApi.getPublicPlaylists(page, pageSize);

            if (page === 0) {
                setPlaylists(data.content);
            } else {
                setPlaylists(prev => [...prev, ...data.content]);
            }

            setCurrentPage(page);
            setHasMore(data.hasMore);
            setError(null);
        } catch (err) {
            console.error("Error fetching public playlists:", err);
            setError("Failed to load public playlists");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchPublicPlaylists(currentPage + 1);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-900">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-900">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 min-h-screen pb-32">
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="space-y-6 mb-8">
                    <button
                        onClick={() => navigate("/music")}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Music
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                                <Globe className="w-10 h-10 text-green-500" />
                                Discover Public Playlists
                            </h1>
                            <p className="text-zinc-400 mt-2">
                                Explore playlists shared by the community
                            </p>
                        </div>
                    </div>
                </div>

                {/* Playlists Grid */}
                {playlists.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No public playlists yet"
                        description="Be the first to share your playlist with the community!"
                        action={
                            <Button onClick={() => navigate("/music/playlists")}>
                                Go to Your Playlists
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {playlists.map((playlist) => (
                                <div
                                    key={playlist.id}
                                    className="group relative rounded-lg bg-zinc-800/50 p-4 hover:bg-zinc-700/50 transition-all cursor-pointer hover:scale-105"
                                    onClick={() => navigate(`/music/playlists/${playlist.id}`)}
                                >
                                    <div className="aspect-square rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mb-4 relative">
                                        <Music className="w-12 h-12 text-white" />
                                        <div className="absolute top-2 right-2">
                                            <Globe className="w-5 h-5 text-white/80" />
                                        </div>
                                    </div>

                                    <h3 className="font-semibold text-white mb-1 truncate">
                                        {playlist.name}
                                    </h3>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                                            <Users className="w-3 h-3" />
                                            <span>Public</span>
                                        </div>
                                    </div>

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                        <div className="text-center p-4">
                                            <p className="text-white font-semibold mb-2">
                                                View Playlist
                                            </p>
                                            <p className="text-xs text-zinc-300">
                                                Click to explore songs
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="flex justify-center mt-8">
                                <Button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="bg-green-600 hover:bg-green-500 text-white px-8"
                                >
                                    {loadingMore ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        `Load More Playlists`
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
