import { useAudio, useAudioTime } from "@/hooks/useAudio.tsx";
import { useEffect, useState } from "react";
import { Heart, MoreVertical, Music2, Disc3, User2, Clock3, Radio } from "lucide-react";
import { favoriteApi } from "@/services/music/favoriteApi.ts";
import PlaylistDropdown from "../dialogs/PlaylistDropdown";
import {
    useFavoriteEventListener,
    dispatchFavoriteEvent
} from "@/hooks/useFavoriteEvents";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

function formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function MusicRightPanel() {
    const { currentSong, isPlaying } = useAudio();
    const { duration } = useAudioTime();
    const { t } = useTranslation("music");
    const [isFavorite, setIsFavorite] = useState(false);
    const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    // Reset image load state when song changes
    useEffect(() => {
        setIsImageLoaded(false);
    }, [currentSong?.id]);

    // Check favorite status
    useEffect(() => {
        const checkFavorite = async () => {
            if (currentSong?.id) {
                try {
                    const result = await favoriteApi.isFavorite(currentSong.id);
                    setIsFavorite(result);
                } catch {
                    setIsFavorite(false);
                }
            } else {
                setIsFavorite(false);
            }
        };
        checkFavorite();
    }, [currentSong]);

    // Listen for favorite events
    useFavoriteEventListener(
        (songId) => {
            if (currentSong?.id === songId) setIsFavorite(true);
        },
        (songId) => {
            if (currentSong?.id === songId) setIsFavorite(false);
        }
    );

    const handleToggleFavorite = async () => {
        if (!currentSong) return;
        try {
            if (isFavorite) {
                await favoriteApi.removeFavorite(currentSong.id);
                setIsFavorite(false);
                dispatchFavoriteEvent("favorite-removed", currentSong.id);
                toast.success("Đã xóa khỏi yêu thích");
            } else {
                await favoriteApi.addFavorite(currentSong.id);
                setIsFavorite(true);
                dispatchFavoriteEvent("favorite-added", currentSong.id);
                toast.success("Đã thêm vào yêu thích");
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
        }
    };

    let favBtnClass = "w-8 h-8 rounded-full flex items-center justify-center transition-all text-zinc-500 hover:text-white hover:bg-zinc-700/50";
    let favTitle = "Thêm vào yêu thích";
    let favIconClass = "w-4 h-4";
    if (isFavorite) {
        favBtnClass = "w-8 h-8 rounded-full flex items-center justify-center transition-all text-purple-500 bg-purple-500/10 hover:bg-purple-500/20";
        favTitle = "Xóa khỏi yêu thích";
        favIconClass = "w-4 h-4 fill-current";
    }

    let imageClasses = "w-full h-full object-cover transition-all duration-700 opacity-0 scale-105";
    if (isImageLoaded) {
        imageClasses = "w-full h-full object-cover transition-all duration-700 opacity-100 scale-100";
    }

    let contentNode = null;
    if (!currentSong) {
        contentNode = (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
                <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                    style={{
                        background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(168,85,247,0.08))",
                        border: "1px solid rgba(139,92,246,0.2)",
                    }}
                >
                    <Music2 className="w-9 h-9 text-purple-500/60" />
                </div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">
                    {t("player.noSongPlaying") || "Chưa có bài hát nào"}
                </p>
                <p className="text-xs text-zinc-600 leading-relaxed">
                    {t("player.selectSong") || "Chọn một bài hát để bắt đầu phát"}
                </p>
            </div>
        );
    } else {
        contentNode = (
            <div className="flex flex-col px-5 pb-6 gap-5">
                {/* Album Art */}
                <div className="relative pt-2">
                    <div
                        className="relative overflow-hidden rounded-xl shadow-2xl"
                        style={{
                            aspectRatio: "1",
                            boxShadow: "0 20px 60px -10px rgba(139,92,246,0.4), 0 10px 30px -5px rgba(0,0,0,0.8)",
                        }}
                    >
                        {/* Blur placeholder while loading */}
                        {!isImageLoaded && (
                            <div
                                className="absolute inset-0 flex items-center justify-center"
                                style={{
                                    background: "linear-gradient(135deg, #1e1b4b, #312e81, #1e1b4b)",
                                }}
                            >
                                <Disc3 className="w-12 h-12 text-purple-400/40" />
                            </div>
                        )}
                        <img
                            key={currentSong.id}
                            src={currentSong.coverImageUrl || "/abstract-album-cover.png"}
                            alt={currentSong.title}
                            onLoad={() => setIsImageLoaded(true)}
                            className={imageClasses}
                        />
                        {/* Vinyl spin overlay when playing */}
                        {isPlaying && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div
                                    className="absolute inset-0 rounded-xl"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(139,92,246,0.05) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Playing indicator dots */}
                    {isPlaying && (
                        <div className="flex items-end gap-0.5 justify-center mt-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-1 rounded-full bg-purple-400"
                                    style={{
                                        height: `${8 + (i % 3) * 4}px`,
                                        transformOrigin: "bottom",
                                        animation: `music-bar ${0.8 + i * 0.1}s ease-in-out infinite alternate`,
                                        animationDelay: `${i * 0.1}s`,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Song Info */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-white truncate leading-tight mb-1" title={currentSong.title}>
                            {currentSong.title}
                        </h3>
                        <p className="text-sm text-zinc-400 truncate" title={currentSong.mainArtist?.name}>
                            {currentSong.mainArtist?.name || t("player.unknownArtist") || "Unknown Artist"}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                        <button
                            onClick={handleToggleFavorite}
                            className={favBtnClass}
                            title={favTitle}
                        >
                            <Heart className={favIconClass} />
                        </button>

                        {currentSong?.id && (
                            <PlaylistDropdown
                                songId={currentSong.id}
                                open={showPlaylistMenu}
                                onOpenChange={setShowPlaylistMenu}
                                variant="full"
                                trigger={
                                    <button
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700/50 transition-all"
                                        title="Thêm vào playlist"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                }
                            />
                        )}
                    </div>
                </div>


                {/* Divider */}
                <div className="border-t border-zinc-800/60" />

                {/* Song Details */}
                <div className="space-y-3">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        {t("sidebar.songInfo") || "Thông tin"}
                    </p>

                    {/* Artist */}
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center shrink-0">
                            <User2 className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-zinc-600 mb-0.5">
                                {t("sidebar.artist") || "Nghệ sĩ chính"}
                            </p>
                            <p className="text-sm font-medium text-zinc-200 truncate">
                                {currentSong.mainArtist?.name || "—"}
                            </p>
                        </div>
                    </div>

                    {/* Featured Artists */}
                    {currentSong.featuredArtists && currentSong.featuredArtists.length > 0 && (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center shrink-0">
                                <User2 className="w-4 h-4 text-zinc-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-zinc-600 mb-0.5">
                                    {t("sidebar.featuredArtists") || "Nghệ sĩ tham gia"}
                                </p>
                                <p className="text-sm font-medium text-zinc-200 truncate">
                                    {currentSong.featuredArtists.map((a) => a.name).join(", ")}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Album */}
                    {currentSong.album && currentSong.album.length > 0 && (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center shrink-0">
                                <Disc3 className="w-4 h-4 text-zinc-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-zinc-600 mb-0.5">
                                    {t("sidebar.album") || "Album"}
                                </p>
                                <p className="text-sm font-medium text-zinc-200 truncate">
                                    {currentSong.album[0]?.title || "—"}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Duration */}
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center shrink-0">
                            <Clock3 className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-zinc-600 mb-0.5">
                                {t("sidebar.duration") || "Thời lượng"}
                            </p>
                            <p className="text-sm font-medium text-zinc-200">
                                {formatDuration(currentSong.duration || duration)}
                            </p>
                        </div>
                    </div>

                    {/* Genres */}
                    {currentSong.genre && currentSong.genre.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {currentSong.genre.slice(0, 4).map((g) => (
                                <span
                                    key={g.id}
                                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                                    style={{
                                        background: "rgba(139,92,246,0.12)",
                                        border: "1px solid rgba(139,92,246,0.25)",
                                        color: "#c4b5fd",
                                    }}
                                >
                                    {g.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Play count */}
                {currentSong.playCount != null && (
                    <>
                        <div className="border-t border-zinc-800/60" />
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-600">
                                {t("sidebar.playCount") || "Lượt phát"}
                            </span>
                            <span className="text-xs font-semibold text-zinc-400">
                                {currentSong.playCount.toLocaleString()}
                            </span>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <aside
            className="music-right-panel flex flex-col h-full w-full music-smart-scroll"
            style={{
                background: "linear-gradient(180deg, #0f0f1a 0%, #111118 100%)",
                borderLeft: "1px solid rgba(139,92,246,0.12)",
                overflowY: "auto",
                overflowX: "hidden",
            }}
        >
            {/* Panel Header */}
            <div className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        {t("sidebar.nowPlaying") || "Đang phát"}
                    </span>
                </div>
            </div>

            {contentNode}
        </aside>
    );
}
