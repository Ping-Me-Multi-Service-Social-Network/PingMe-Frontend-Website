import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { AlbumResponse } from "@/services/music/albumApi.ts";
import { searchService } from "@/services/music/musicService.ts";
import type { SongResponseWithAllAlbum } from "@/types/music";
import { useAudioPlayer } from "@/contexts/useAudioPlayer.tsx";
import { ArrowLeft, Music2 } from "lucide-react";
import { convertToSong } from "../../utils/commonHandlers.ts";
import { LoadingState, ErrorState } from "../shared/LoadingErrorStates";
import { useAppDispatch, useAppSelector } from "@/features/hooks";
import { fetchAllAlbums } from "@/features/slices/musicSlice";
import { isCacheValid } from "@/utils/musicCacheUtils";
import { DEFAULT_ALBUMS_LIMIT, TOP_ARTISTS_FOR_PREVIEW } from "@/constants/musicConstants";
import TwoColumnLayout, { SongItemCard, EmptySongItem } from "../shared/TwoColumnLayout";

export default function AlbumsPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { playSong } = useAudioPlayer();
    const { allAlbums, cacheExpiry } = useAppSelector(state => state.music);
    const [albumSongs, setAlbumSongs] = useState<Map<number, SongResponseWithAllAlbum[]>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Check cache validity
                if (!allAlbums || !isCacheValid(allAlbums.lastFetched, cacheExpiry)) {
                    await dispatch(fetchAllAlbums(DEFAULT_ALBUMS_LIMIT)).unwrap();
                }

                // Fetch top song for each album (first 10 albums)
                const albumsData = allAlbums?.data || [];
                const songsMap = new Map<number, SongResponseWithAllAlbum[]>();
                await Promise.all(
                    albumsData.slice(0, TOP_ARTISTS_FOR_PREVIEW).map(async (album) => {
                        try {
                            const res = await searchService.getSongsByAlbum(album.id);
                            const songs = res?.data?.content || [];
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

        fetchData();
    }, [dispatch, allAlbums?.lastFetched, allAlbums?.data, cacheExpiry, allAlbums]);

    const albums = allAlbums?.data || [];

    const handleAlbumClick = (album: AlbumResponse) => {
        navigate(
            `/music/songs?type=album&id=${album.id}&name=${encodeURIComponent(
                album.title
            )}&imageUrl=${encodeURIComponent(album.coverImgUrl || "")}`
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
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url(${albums[0]?.coverImgUrl || ""})` }}
                />
                <div className="relative max-w-7xl mx-auto px-8 h-full flex flex-col justify-end pb-8">
                    <button
                        onClick={() => navigate("/app/music")}
                        className="absolute top-8 left-8 p-2 hover:bg-zinc-800/50 rounded-full transition"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-5xl font-bold text-white mb-2">Album Phổ Biến</h1>
                    <p className="text-zinc-300">Cập nhật vào lúc {new Date().toLocaleDateString("vi-VN")}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                <TwoColumnLayout
                    items={albums}
                    itemSongsMap={albumSongs}
                    getItemId={(album) => album.id}
                    rankTitle="🏆 Rank"
                    songTitle="🎵 Top song"
                    renderRankItem={(album, index) => (
                        <button
                            key={album.id}
                            onClick={() => handleAlbumClick(album)}
                            className="flex items-center gap-4 p-4 bg-zinc-800/30 hover:bg-zinc-800/60 rounded-lg transition cursor-pointer group w-full text-left"
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
                        </button>
                    )}
                    renderSongItem={(album, song) => {
                        if (!song) {
                            return (
                                <EmptySongItem
                                    key={album.id}
                                    imageUrl={album.coverImgUrl || "/placeholder.svg"}
                                    imageAlt={album.title}
                                    emptyMessage="No songs available"
                                    subtitle={album.title}
                                />
                            );
                        }

                        return (
                            <SongItemCard
                                key={album.id}
                                imageUrl={song.coverImageUrl || album.coverImgUrl || "/placeholder.svg"}
                                imageAlt={song.title}
                                title={song.title}
                                subtitle={`${song.mainArtist.name}${song.otherArtists && song.otherArtists.length > 0
                                    ? `, ${song.otherArtists.map((a) => a.name).join(", ")}`
                                    : ''
                                    }`}
                                additionalInfo={
                                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                                        <Music2 className="w-3 h-3" /> {album.title}
                                    </p>
                                }
                                onItemClick={() => handleSongPlay(song)}
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
