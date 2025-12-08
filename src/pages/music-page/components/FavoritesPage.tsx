import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import { favoriteApi } from "@/services/music/favoriteApi";
import { songApi } from "@/services/music/songApi";
import { useAudioPlayer } from "@/contexts/useAudioPlayer";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import { EmptyState } from "@/components/custom/EmptyState";
import type { FavoriteDto } from "@/types/music/favorite";

export default function FavoritesPage() {
    const navigate = useNavigate();
    const { playSong, setPlaylist } = useAudioPlayer();
    const [favorites, setFavorites] = useState<FavoriteDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const data = await favoriteApi.getFavorites();
            setFavorites(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching favorites:", err);
            setError("Failed to load favorites");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (songId: number) => {
        try {
            await favoriteApi.removeFavorite(songId);
            setFavorites(prev => prev.filter(fav => fav.songId !== songId));
        } catch (err) {
            console.error("Error removing favorite:", err);
        }
    };

    const handlePlaySong = async (favorite: FavoriteDto) => {
        try {
            const songDetails = await songApi.getSongById(favorite.songId);
            playSong(songDetails);

            // Set playlist to all favorite songs
            const allSongs = await Promise.all(
                favorites.map(fav => songApi.getSongById(fav.songId))
            );
            setPlaylist(allSongs);
        } catch (err) {
            console.error("Error playing song:", err);
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
        <div className="bg-gray-900 pb-32" style={{ minHeight: '100vh' }}>
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/music")}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Music
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                            <Heart className="w-8 h-8 text-white fill-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Favorite Songs</h1>
                            <p className="text-zinc-400">{favorites.length} {favorites.length === 1 ? 'song' : 'songs'}</p>
                        </div>
                    </div>
                </div>

                {/* Favorites List */}
                {favorites.length === 0 ? (
                    <EmptyState
                        icon={Heart}
                        title="No favorite songs yet"
                        description="Songs you like will appear here"
                    />
                ) : (
                    <div className="space-y-2">
                        {favorites.map((favorite, index) => (
                            <div
                                key={favorite.id}
                                className="group flex items-center gap-4 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
                            >
                                <span className="text-zinc-400 font-medium w-8 text-center">
                                    {index + 1}
                                </span>

                                <button
                                    onClick={() => handlePlaySong(favorite)}
                                    className="flex-1 flex items-center gap-4 text-left"
                                >
                                    <div className="flex-1">
                                        <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                            {favorite.title}
                                        </h3>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleRemoveFavorite(favorite.songId)}
                                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                                    title="Remove from favorites"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
