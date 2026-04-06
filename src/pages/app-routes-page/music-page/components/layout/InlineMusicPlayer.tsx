import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { useAudio, useAudioTime } from "@/hooks/useAudio.tsx";
import {
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Volume2,
    VolumeX,
    Repeat,
    Repeat1,
    Heart,
    MoreVertical,
} from "lucide-react";
import type { Song } from "@/types/music/song";
import { favoriteApi } from "@/services/music/favoriteApi.ts";
import PlaylistDropdown from "@/pages/app-routes-page/music-page/components/dialogs/PlaylistDropdown";
import { toast } from "sonner";

function formatTime(seconds: number) {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const REPEAT_CONFIG = {
    off: {
        color: "text-zinc-500 hover:text-white",
        title: "Bật lặp",
        Icon: Repeat,
    },
    one: {
        color: "text-blue-400",
        title: "Tắt lặp",
        Icon: Repeat1,
    },
    all: {
        color: "text-green-400",
        title: "Lặp 1 bài",
        Icon: Repeat,
    },
} as const;

const InlineMusicPlayer: React.FC = () => {
    const {
        currentSong,
        playlist,
        playSong,
        audioRef,
        isPlaying,
        togglePlayPause,
        volume,
        setVolume,
        repeatMode,
        cycleRepeatMode,
        playbackContext,
    } = useAudio();
    const { currentTime, duration } = useAudioTime();

    const [isFavorite, setIsFavorite] = useState(false);
    const [isHoveringProgress, setIsHoveringProgress] = useState(false);
    const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

    const repeatConfig = REPEAT_CONFIG[repeatMode] || REPEAT_CONFIG.off;
    const RepeatIcon = repeatConfig.Icon;

    const featuredArtistsText = currentSong?.featuredArtists?.length
        ? `, ${currentSong.featuredArtists.map((a) => a.name).join(", ")}`
        : "";

    const progressValue = duration > 0 ? (currentTime / duration) * 100 : 0;
    const progressBarWidth = `${progressValue}%`;
    const thumbLeft = duration > 0 ? `calc(${progressValue}% - 6px)` : "-6px";

    const favoriteButtonColor = isFavorite ? "text-pink-400" : "text-zinc-500 hover:text-white";
    const favoriteButtonTitle = isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích";
    const favoriteIconClass = isFavorite ? "fill-current" : "";

    const PlayPauseIcon = isPlaying ? Pause : Play;
    const VolumeIcon = volume > 0 ? Volume2 : VolumeX;

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

    useEffect(() => {
        const handleFavoriteAdded = (event: Event) => {
            const customEvent = event as CustomEvent<{ songId: number }>;
            if (currentSong?.id === customEvent.detail.songId) setIsFavorite(true);
        };
        const handleFavoriteRemoved = (event: Event) => {
            const customEvent = event as CustomEvent<{ songId: number }>;
            if (currentSong?.id === customEvent.detail.songId) setIsFavorite(false);
        };
        globalThis.addEventListener("favorite-added", handleFavoriteAdded);
        globalThis.addEventListener("favorite-removed", handleFavoriteRemoved);
        return () => {
            globalThis.removeEventListener("favorite-added", handleFavoriteAdded);
            globalThis.removeEventListener("favorite-removed", handleFavoriteRemoved);
        };
    }, [currentSong]);

    const handleToggleFavorite = async () => {
        if (!currentSong) return;
        try {
            if (isFavorite) {
                await favoriteApi.removeFavorite(currentSong.id);
                setIsFavorite(false);
                toast.success("Đã xóa khỏi yêu thích");
                globalThis.dispatchEvent(new CustomEvent("favorite-removed", { detail: { songId: currentSong.id } }));
            } else {
                await favoriteApi.addFavorite(currentSong.id);
                setIsFavorite(true);
                toast.success("Đã thêm vào yêu thích");
                globalThis.dispatchEvent(new CustomEvent("favorite-added", { detail: { songId: currentSong.id } }));
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
        }
    };

    const handleClickNext = useCallback(() => {
        if (!currentSong || playlist.length === 0) return;
        const currentIndex = playlist.findIndex((s: Song) => s.id === currentSong.id);
        const nextIndex = (currentIndex + 1) % playlist.length;
        playSong(playlist[nextIndex], playbackContext);
    }, [currentSong, playlist, playSong, playbackContext]);

    const handleClickPrevious = useCallback(() => {
        if (!currentSong || playlist.length === 0) return;
        const currentIndex = playlist.findIndex((s: Song) => s.id === currentSong.id);
        const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
        playSong(playlist[prevIndex], playbackContext);
    }, [currentSong, playlist, playSong, playbackContext]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = Number.parseFloat(e.target.value);
        if (audioRef.current) audioRef.current.currentTime = newTime;
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(Number.parseFloat(e.target.value));
    };

    const toggleMute = () => setVolume(volume > 0 ? 0 : 1);

    if (!currentSong) return null;

    return (
        <div
            className="sticky bottom-0 z-40 shrink-0 w-full"
            style={{
                background: "linear-gradient(180deg, #0d0d1a 0%, #09090f 100%)",
                borderTop: "1px solid rgba(139,92,246,0.15)",
                boxShadow: "0 -8px 32px rgba(0,0,0,0.5)",
                height: "88px",
            }}
        >
            {/* Progress bar — full width at very top */}
            <div
                className="relative group"
                style={{ height: "3px", background: "rgba(255,255,255,0.06)" }}
            >
                <div
                    className="absolute left-0 top-0 h-full transition-all duration-300"
                    style={{
                        width: progressBarWidth,
                        background: "linear-gradient(90deg, #7c3aed, #a855f7)",
                    }}
                />
                <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime || 0}
                    onChange={handleSeek}
                    onMouseEnter={() => setIsHoveringProgress(true)}
                    onMouseLeave={() => setIsHoveringProgress(false)}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    style={{ height: "100%", zIndex: 1 }}
                    aria-label="Progress"
                />
                {/* Thumb dot */}
                {isHoveringProgress && (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg pointer-events-none"
                        style={{
                            left: thumbLeft,
                        }}
                    />
                )}
            </div>

            {/* Player Content */}
            <div 
                className="flex h-full w-full px-4 items-center relative" 
                style={{ height: "85px" }}
            >
                {/* Left: Song Info */}
                <div className="flex items-center gap-3 min-w-0 justify-start z-10">
                    <img
                        src={currentSong.coverImageUrl || "/abstract-album-cover.png"}
                        alt={currentSong.title}
                        className="w-12 h-12 rounded-lg object-cover shadow-lg flex-shrink-0 hidden xs:block"
                        style={{ border: "1px solid rgba(139,92,246,0.2)" }}
                    />
                    <div className="flex-1 min-w-0 hidden sm:block max-w-[200px]">
                        <p className="text-sm font-semibold text-white truncate">{currentSong.title}</p>
                        <p className="text-xs text-zinc-400 truncate">
                            {currentSong.mainArtist?.name || "Unknown Artist"}
                            {featuredArtistsText}
                        </p>
                    </div>
                    {/* Favorite */}
                    <button
                        onClick={handleToggleFavorite}
                        className={`w-8 h-8 rounded-full hidden sm:flex items-center justify-center transition-all flex-shrink-0 ${favoriteButtonColor}`}
                        title={favoriteButtonTitle}
                    >
                        <Heart className={`w-4 h-4 ${favoriteIconClass}`} />
                    </button>
                </div>

                {/* CENTER AREA (Absolute Center for stability) */}
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col justify-center items-center gap-1.5 min-w-0 pointer-events-auto">
                    {/* Playback Controls */}
                    <div className="flex items-center justify-center gap-4">
                        {/* Repeat */}
                        <button
                            onClick={cycleRepeatMode}
                            className={`transition-colors hidden sm:block ${repeatConfig.color}`}
                            title={repeatConfig.title}
                        >
                            <RepeatIcon className="w-4 h-4" />
                        </button>

                        {/* Prev */}
                        <button
                            onClick={handleClickPrevious}
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <SkipBack className="w-5 h-5" />
                        </button>

                        {/* Play/Pause */}
                        <button
                            onClick={togglePlayPause}
                            className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform shrink-0"
                            style={{
                                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                                boxShadow: "0 0 20px rgba(168,85,247,0.4)",
                            }}
                        >
                            <PlayPauseIcon className={`w-5 h-5 text-white ${isPlaying ? "" : "ml-0.5"}`} />
                        </button>

                        {/* Next */}
                        <button
                            onClick={handleClickNext}
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <SkipForward className="w-5 h-5" />
                        </button>

                        {/* Playlist menu */}
                        {currentSong?.id && (
                            <div className="hidden sm:block">
                                <PlaylistDropdown
                                    songId={currentSong.id}
                                    open={showPlaylistMenu}
                                    onOpenChange={setShowPlaylistMenu}
                                    variant="full"
                                    trigger={
                                        <button className="text-zinc-500 hover:text-white transition-colors flex items-center h-full">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    }
                                />
                            </div>
                        )}
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-zinc-500 tabular-nums w-full justify-center">
                        <span>{formatTime(currentTime)}</span>
                        <span className="hidden sm:inline">/</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Right: Volume */}
                <div className="ml-auto flex items-center gap-2 justify-end min-w-0 z-10">
                    <button
                        onClick={toggleMute}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        <VolumeIcon className="w-4 h-4" />
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 rounded-lg cursor-pointer"
                        style={{
                            accentColor: "#a855f7",
                            background: `linear-gradient(to right, #a855f7 ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`,
                        }}
                    />
                    <span className="text-xs text-zinc-500 w-8 text-right">{Math.round(volume * 100)}%</span>
                </div>
            </div>
        </div>
    );
};

export default InlineMusicPlayer;
