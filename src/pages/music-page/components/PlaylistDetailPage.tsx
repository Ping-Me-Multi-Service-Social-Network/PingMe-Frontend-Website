import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play, Trash2, GripVertical, Music2, Lock, Globe } from "lucide-react";
import { playlistApi } from "@/services/music/playlistApi";
import { songApi } from "@/services/music/songApi";
import { useAudioPlayer } from "@/contexts/useAudioPlayer";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import { EmptyState } from "@/components/custom/EmptyState";
import type { PlaylistDetailDto, PlaylistSongDto } from "@/types/music/playlist";

export default function PlaylistDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { playSong, setPlaylist: setAudioPlaylist } = useAudioPlayer();
    const [playlistDetail, setPlaylistDetail] = useState<PlaylistDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchPlaylistDetail(parseInt(id));
        }
    }, [id]);

    const fetchPlaylistDetail = async (playlistId: number) => {
        try {
            setLoading(true);
            const data = await playlistApi.getPlaylistDetail(playlistId);
            setPlaylistDetail(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching playlist details:", err);
            setError("Failed to load playlist");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSong = async (songId: number) => {
        if (!playlistDetail) return;

        try {
            await playlistApi.removeSongFromPlaylist(playlistDetail.id, songId);
            setPlaylistDetail({
                ...playlistDetail,
                items: playlistDetail.items.filter(item => item.songId !== songId)
            });
        } catch (err) {
            console.error("Error removing song:", err);
        }
    };

    const handlePlaySong = async (playlistSong: PlaylistSongDto) => {
        try {
            const songDetails = await songApi.getSongById(playlistSong.songId);
            playSong(songDetails);

            // Set playlist to all songs in order
            if (playlistDetail) {
                const allSongs = await Promise.all(
                    playlistDetail.items.map(item => songApi.getSongById(item.songId))
                );
                setAudioPlaylist(allSongs);
            }
        } catch (err) {
            console.error("Error playing song:", err);
        }
    };

    const handlePlayAll = async () => {
        if (!playlistDetail || playlistDetail.items.length === 0) return;

        try {
            const allSongs = await Promise.all(
                playlistDetail.items.map(item => songApi.getSongById(item.songId))
            );
            setAudioPlaylist(allSongs);
            playSong(allSongs[0]);
        } catch (err) {
            console.error("Error playing playlist:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-900">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !playlistDetail) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-900">
                <p className="text-red-400">{error || "Playlist not found"}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 pb-32" style={{ minHeight: '100vh' }}>
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/music/playlists")}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Playlists
                    </button>

                    <div className="flex items-start gap-6 mb-6">
                        <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <Music2 className="w-24 h-24 text-white" />
                        </div>

                        <div className="flex-1">
                            <p className="text-sm text-zinc-400 mb-2">PLAYLIST</p>
                            <h1 className="text-5xl font-bold text-white mb-4">{playlistDetail.name}</h1>
                            <div className="flex items-center gap-4 text-zinc-400">
                                <div className="flex items-center gap-2">
                                    {playlistDetail.isPublic ? (
                                        <>
                                            <Globe className="w-4 h-4" />
                                            <span>Public</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            <span>Private</span>
                                        </>
                                    )}
                                </div>
                                <span>•</span>
                                <span>{playlistDetail.items.length} {playlistDetail.items.length === 1 ? 'song' : 'songs'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Play All Button */}
                    {playlistDetail.items.length > 0 && (
                        <button
                            onClick={handlePlayAll}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white font-semibold transition-colors"
                        >
                            <Play className="w-5 h-5 fill-white" />
                            Play All
                        </button>
                    )}
                </div>

                {/* Songs List */}
                {playlistDetail.items.length === 0 ? (
                    <EmptyState
                        icon={Music2}
                        title="No songs in this playlist"
                        description="Add songs to start building your playlist"
                    />
                ) : (
                    <div className="space-y-2">
                        {playlistDetail.items
                            .sort((a, b) => a.position - b.position)
                            .map((item, index) => (
                                <div
                                    key={item.id}
                                    className="group flex items-center gap-4 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
                                >
                                    <GripVertical className="w-5 h-5 text-zinc-500 cursor-grab" />

                                    <span className="text-zinc-400 font-medium w-8 text-center">
                                        {index + 1}
                                    </span>

                                    <button
                                        onClick={() => handlePlaySong(item)}
                                        className="flex-1 flex items-center gap-4 text-left"
                                    >
                                        <div className="flex-1">
                                            <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                                {item.title}
                                            </h3>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleRemoveSong(item.songId)}
                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                                        title="Remove from playlist"
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
