import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchService } from "@/services/music/musicService.ts";
import type { ArtistResponse, SongResponseWithAllAlbum } from "@/types/music";
import { useAudioPlayer } from "@/contexts/useAudioPlayer.tsx";
import { ArrowLeft } from "lucide-react";
import { convertToSong } from "../../utils/commonHandlers.ts";
import { LoadingState, ErrorState } from "../shared/LoadingErrorStates";
import { useAppDispatch, useAppSelector } from "@/features/hooks";
import { fetchAllArtists } from "@/features/slices/musicSlice";
import { isCacheValid } from "@/utils/musicCacheUtils";
import { DEFAULT_ARTISTS_LIMIT, TOP_ARTISTS_FOR_PREVIEW } from "@/constants/musicConstants";
import TwoColumnLayout, { SongItemCard, EmptySongItem } from "../shared/TwoColumnLayout";

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
            <div className="relative h-80 bg-linear-to-b from-zinc-800/50 to-transparent">
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
                <TwoColumnLayout
                    items={artists}
                    itemSongsMap={artistSongs}
                    getItemId={(artist) => artist.id}
                    rankTitle="🏆 Rank"
                    songTitle="🔥 Trending song"
                    renderRankItem={(artist, index) => (
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
                    )}
                    renderSongItem={(artist, song) => {
                        if (!song) {
                            return (
                                <EmptySongItem
                                    key={artist.id}
                                    imageUrl={artist.imgUrl || "/placeholder.svg"}
                                    imageAlt={artist.name}
                                    emptyMessage="No trending song"
                                    subtitle={artist.name}
                                />
                            );
                        }

                        return (
                            <SongItemCard
                                key={artist.id}
                                imageUrl={song.coverImageUrl || artist.imgUrl || "/placeholder.svg"}
                                imageAlt={song.title}
                                title={song.title}
                                subtitle={`${song.mainArtist.name}${song.otherArtists && song.otherArtists.length > 0
                                        ? `, ${song.otherArtists.map(a => a.name).join(', ')}`
                                        : ''
                                    }`}
                                additionalInfo={
                                    song.albums && song.albums.length > 0 && (
                                        <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
                                            <span>🎵</span> {song.albums[0].title}
                                        </p>
                                    )
                                }
                                onItemClick={() => handleArtistClick(artist)}
                                onPlayClick={(e) => {
                                    e.stopPropagation();
                                    handleSongPlay(song);
                                }}
                            />
                        );
                    }}
                />
            </div>
        </div>
    );
}
