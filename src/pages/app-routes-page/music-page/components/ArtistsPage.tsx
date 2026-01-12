import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchService } from "@/services/music/musicService.ts";
import type { ArtistResponse, SongResponseWithAllAlbum } from "@/types/music";
import { useAudioPlayer } from "@/contexts/useAudioPlayer.tsx";
import { ArrowLeft, Play } from "lucide-react";
import { convertToSong } from "../utils/commonHandlers";
import { LoadingState, ErrorState } from "./LoadingErrorStates";
import { useAppDispatch, useAppSelector } from "@/features/hooks";
import { fetchAllArtists } from "@/features/slices/musicSlice";
import { isCacheValid } from "@/utils/musicCacheUtils";
import { DEFAULT_ARTISTS_LIMIT, TOP_ARTISTS_FOR_PREVIEW } from "@/constants/musicConstants";

export default function ArtistsPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { playSong } = useAudioPlayer();
    const { allArtists, cacheExpiry } = useAppSelector(state => state.music);
    const [artistSongs, setArtistSongs] = useState<Map<number, SongResponseWithAllAlbum[]>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Check cache validity
                if (!allArtists || !isCacheValid(allArtists.lastFetched, cacheExpiry)) {
                    await dispatch(fetchAllArtists(DEFAULT_ARTISTS_LIMIT)).unwrap();
                }

                // Fetch trending song for each artist (top 1 song)
                const artistsData = allArtists?.data || [];
                const songsMap = new Map<number, SongResponseWithAllAlbum[]>();
                await Promise.all(
                    artistsData.slice(0, TOP_ARTISTS_FOR_PREVIEW).map(async (artist: ArtistResponse) => {
                        try {
                            const songs = await searchService.getSongsByArtist(artist.id);
                            if (songs.length > 0) {
                                songsMap.set(artist.id, [songs[0]]);
                            }
                        } catch (err) {
                            console.error(`Error fetching songs for artist ${artist.id}:`, err);
                        }
                    })
                );
                setArtistSongs(songsMap);
                setError(null);
            } catch (err) {
                console.error("Error fetching artists:", err);
                setError("Failed to load artists");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dispatch, allArtists?.lastFetched, allArtists?.data, cacheExpiry, allArtists]);

    const artists = allArtists?.data || [];

    const handleArtistClick = (artist: ArtistResponse) => {
        navigate(
            `/music/songs?type=artist&id=${artist.id}&name=${encodeURIComponent(
                artist.name
            )}&imageUrl=${encodeURIComponent(artist.imgUrl || "")}`
        );
    };

    const handleSongPlay = (song: SongResponseWithAllAlbum) => {
        playSong(convertToSong(song));
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    return (
        <div className="bg-gray-900 pb-32" style={{ minHeight: '100vh' }}>
            {/* Hero Banner */}
            <div className="relative h-80 bg-gradient-to-b from-zinc-800/50 to-transparent">
                <div className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url(${artists[0]?.imgUrl || ''})` }} />
                <div className="relative max-w-7xl mx-auto px-8 h-full flex flex-col justify-end pb-8">
                    <button
                        onClick={() => navigate("/app/music")}
                        className="absolute top-8 left-8 p-2 hover:bg-zinc-800/50 rounded-full transition"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-5xl font-bold text-white mb-2">Nghệ Sĩ Nổi Tiếng</h1>
                    <p className="text-zinc-300">Cập nhật vào lúc {new Date().toLocaleDateString('vi-VN')}</p>
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
                            {artists.slice(0, 10).map((artist, index) => (
                                <button
                                    key={artist.id}
                                    onClick={() => handleArtistClick(artist)}
                                    className="flex items-center gap-4 p-4 bg-zinc-800/30 hover:bg-zinc-800/60 rounded-lg transition cursor-pointer group w-full text-left"
                                >
                                    <div className="text-2xl font-bold text-white w-8">
                                        #{index + 1}
                                    </div>
                                    <img
                                        src={artist.imgUrl || "/placeholder.svg"}
                                        alt={artist.name}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-white font-semibold">{artist.name}</h3>
                                        <p className="text-sm text-zinc-400">{artist.bio?.slice(0, 50) || 'followers'}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Trending Song Column */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">🔥</span> Trending song
                        </h2>
                        <div className="space-y-3">
                            {artists.slice(0, 10).map((artist) => {
                                const songs = artistSongs.get(artist.id);
                                const song = songs?.[0];

                                if (!song) {
                                    return (
                                        <div
                                            key={artist.id}
                                            className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-lg"
                                        >
                                            <img
                                                src={artist.imgUrl || "/placeholder.svg"}
                                                alt={artist.name}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div className="flex-1">
                                                <p className="text-zinc-500 text-sm">No trending song</p>
                                                <p className="text-zinc-600 text-xs">{artist.name}</p>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <button
                                        key={artist.id}
                                        onClick={() => handleArtistClick(artist)}
                                        className="flex items-center gap-4 p-4 bg-zinc-800/30 hover:bg-zinc-800/60 rounded-lg transition group cursor-pointer w-full text-left"
                                    >
                                        <div className="relative">
                                            <img
                                                src={song.coverImageUrl || artist.imgUrl || "/placeholder.svg"}
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
                                                    `, ${song.otherArtists.map(a => a.name).join(', ')}`
                                                }
                                            </p>
                                            {song.albums && song.albums.length > 0 && (
                                                <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
                                                    <span>🎵</span> {song.albums[0].title}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
