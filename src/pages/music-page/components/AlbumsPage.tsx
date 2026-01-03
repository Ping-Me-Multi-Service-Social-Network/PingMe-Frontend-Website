import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { albumApi, type AlbumResponse } from "@/services/music/albumApi";
import { searchService } from "@/services/music/musicService";
import type { SongResponseWithAllAlbum } from "@/types/music";
import type { Song } from "@/types/music/song";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import { useAudioPlayer } from "@/contexts/useAudioPlayer";
import { ArrowLeft, Play, Music2 } from "lucide-react";

export default function AlbumsPage() {
    const navigate = useNavigate();
    const { playSong } = useAudioPlayer();
    const [albums, setAlbums] = useState<AlbumResponse[]>([]);
    const [albumSongs, setAlbumSongs] = useState<Map<number, SongResponseWithAllAlbum[]>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                setLoading(true);
                const albumsData = await albumApi.getPopularAlbums(20);
                setAlbums(albumsData);

                // Fetch top song for each album (first 10 albums)
                const songsMap = new Map<number, SongResponseWithAllAlbum[]>();
                await Promise.all(
                    albumsData.slice(0, 10).map(async (album) => {
                        try {
                            const songs = await searchService.getSongsByAlbum(album.id);
                            if (songs.length > 0) {
                                songsMap.set(album.id, [songs[0]]);
                            }
                        } catch (err) {
                            console.error(`Error fetching songs for album ${album.id}:`, err);
                        }
                    })
                );
                setAlbumSongs(songsMap);
                setError(null);
            } catch (err) {
                console.error("Error fetching albums:", err);
                setError("Failed to load albums");
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
    }, []);

    const handleAlbumClick = (album: AlbumResponse) => {
        navigate(
            `/music/songs?type=album&id=${album.id}&name=${encodeURIComponent(
                album.title
            )}&imageUrl=${encodeURIComponent(album.coverImgUrl || "")}`
        );
    };

    const handleSongPlay = (song: SongResponseWithAllAlbum) => {
        const songToPlay: Song = {
            id: song.id,
            title: song.title,
            duration: song.duration,
            playCount: song.playCount,
            songUrl: song.songUrl,
            coverImageUrl: song.coverImageUrl,
            mainArtist: song.mainArtist,
            featuredArtists: song.otherArtists,
            genre: song.genres,
            album: song.albums,
        };
        playSong(songToPlay);
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

    return (
        <div className="bg-gray-900 pb-32" style={{ minHeight: '100vh' }}>
            {/* Hero Banner */}
            <div className="relative h-80 bg-gradient-to-b from-zinc-800/50 to-transparent">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url(${albums[0]?.coverImgUrl || ""})` }}
                />
                <div className="relative max-w-7xl mx-auto px-8 h-full flex flex-col justify-end pb-8">
                    <button
                        onClick={() => navigate("/music")}
                        className="absolute top-8 left-8 p-2 hover:bg-zinc-800/50 rounded-full transition"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-5xl font-bold text-white mb-2">Popular Albums</h1>
                    <p className="text-zinc-300">Cập nhật vào lúc {new Date().toLocaleDateString("vi-VN")}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Rank Column */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">🏆</span> Rank
                        </h2>
                        <div className="space-y-3">
                            {albums.slice(0, 10).map((album, index) => (
                                <div
                                    key={album.id}
                                    onClick={() => handleAlbumClick(album)}
                                    className="flex items-center gap-4 p-4 bg-zinc-800/30 hover:bg-zinc-800/60 rounded-lg transition cursor-pointer group"
                                >
                                    <div className="text-2xl font-bold text-white w-8">
                                        #{index + 1}
                                    </div>
                                    <img
                                        src={album.coverImgUrl || "/placeholder.svg"}
                                        alt={album.title}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-semibold truncate">{album.title}</h3>
                                        <p className="text-sm text-zinc-400">
                                            {album.playCount?.toLocaleString()} plays
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Song Column */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">🎵</span> Top song
                        </h2>
                        <div className="space-y-3">
                            {albums.slice(0, 10).map((album) => {
                                const songs = albumSongs.get(album.id);
                                const song = songs?.[0];

                                if (!song) {
                                    return (
                                        <div
                                            key={album.id}
                                            className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-lg"
                                        >
                                            <img
                                                src={album.coverImgUrl || "/placeholder.svg"}
                                                alt={album.title}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div className="flex-1">
                                                <p className="text-zinc-500 text-sm">No songs available</p>
                                                <p className="text-zinc-600 text-xs">{album.title}</p>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={album.id}
                                        className="flex items-center gap-4 p-4 bg-zinc-800/30 hover:bg-zinc-800/60 rounded-lg transition group cursor-pointer"
                                    >
                                        <div className="relative">
                                            <img
                                                src={song.coverImageUrl || album.coverImgUrl || "/placeholder.svg"}
                                                alt={song.title}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSongPlay(song);
                                                }}
                                                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition rounded-lg"
                                            >
                                                <Play className="w-6 h-6 text-white fill-white" />
                                            </button>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-medium truncate">{song.title}</h3>
                                            <p className="text-sm text-zinc-400 truncate">
                                                {song.mainArtist.name}
                                                {song.otherArtists && song.otherArtists.length > 0 &&
                                                    `, ${song.otherArtists.map((a) => a.name).join(", ")}`}
                                            </p>
                                            <p className="text-xs text-zinc-500 flex items-center gap-1">
                                                <Music2 className="w-3 h-3" /> {album.title}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
