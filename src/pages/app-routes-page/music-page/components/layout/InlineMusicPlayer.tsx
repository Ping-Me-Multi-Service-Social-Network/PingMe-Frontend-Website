import type React from "react";
import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
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
    UsersRound,
} from "lucide-react";
import type { Song } from "@/types/music/song";
import PlaylistDropdown from "@/pages/app-routes-page/music-page/components/dialogs/PlaylistDropdown";
import { useFavorites } from "@/hooks/useFavorites";
import type { RootState } from "@/features/store";
import { MusicSocketManager } from "@/features/websocket/core/musicSocketManager";
import { joinSessionStart } from "@/features/music/musicSessionSlice";

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

// --- Sub-components for lower Cognitive Complexity & Modularity ---

const SongInfoSection: React.FC<{
    currentSong: Song;
    isFavorite: boolean;
    onToggleFavorite: () => void;
}> = ({ currentSong, isFavorite, onToggleFavorite }) => {
    const featuredArtistsText = currentSong.featuredArtists?.length
        ? `, ${currentSong.featuredArtists.map((a) => a.name).join(", ")}`
        : "";

    return (
        <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-none">
            <img
                src={currentSong.coverImageUrl || "/abstract-album-cover.png"}
                alt={currentSong.title}
                className="w-12 h-12 rounded-lg object-cover shadow-lg shrink-0 border border-purple-500/20"
            />
            <div className="min-w-0 max-w-[150px] sm:max-w-[200px]">
                <p className="text-sm font-semibold text-white truncate">{currentSong.title}</p>
                <p className="text-[10px] sm:text-xs text-zinc-400 truncate">
                    {currentSong.mainArtist?.name || "Unknown Artist"}{featuredArtistsText}
                </p>
            </div>
            <button
                onClick={onToggleFavorite}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${isFavorite ? "text-pink-400" : "text-zinc-500 hover:text-white"}`}
            >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
        </div>
    );
};

const PlayerControlsSection: React.FC<{
    repeatMode: "off" | "one" | "all";
    isPlaying: boolean;
    isListener: boolean;
    currentTime: number;
    duration: number;
    showPlaylistMenu: boolean;
    onOpenChange: (open: boolean) => void;
    onPlayPause: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onCycleRepeatMode: () => void;
    songId: number;
}> = ({
    repeatMode,
    isPlaying,
    isListener,
    currentTime,
    duration,
    showPlaylistMenu,
    onOpenChange,
    onPlayPause,
    onNext,
    onPrevious,
    onCycleRepeatMode,
    songId,
}) => {
    const repeatConfig = REPEAT_CONFIG[repeatMode] || REPEAT_CONFIG.off;
    const RepeatIcon = repeatConfig.Icon;
    const PlayPauseIcon = isPlaying ? Pause : Play;

    return (
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
            <div className="flex items-center gap-3 sm:gap-5">
                <button
                    onClick={onCycleRepeatMode}
                    className={`transition-colors hidden xs:block ${repeatConfig.color}`}
                    title={repeatConfig.title}
                >
                    <RepeatIcon className="w-4 h-4" />
                </button>

                <button
                    onClick={onPrevious}
                    disabled={isListener}
                    className={`${isListener ? "text-zinc-800 cursor-not-allowed" : "text-zinc-400 hover:text-white"} transition-colors`}
                    title={isListener ? "Chế độ người nghe" : "Bài trước"}
                >
                    <SkipBack className="w-5 h-5" />
                </button>

                <button
                    onClick={onPlayPause}
                    disabled={isListener}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 
                        ${isListener 
                            ? "bg-zinc-800/50 text-zinc-600 cursor-not-allowed" 
                            : "bg-gradient-to-br from-purple-600 to-fuchsia-600 hover:scale-105 shadow-[0_0_20px_rgba(168,85,247,0.4)] text-white"
                        }`}
                >
                    <PlayPauseIcon className={`w-5 h-5 ${isPlaying ? "" : "ml-0.5"}`} />
                </button>

                <button
                    onClick={onNext}
                    disabled={isListener}
                    className={`${isListener ? "text-zinc-800 cursor-not-allowed" : "text-zinc-400 hover:text-white"} transition-colors`}
                    title={isListener ? "Chế độ người nghe" : "Bài tiếp theo"}
                >
                    <SkipForward className="w-5 h-5" />
                </button>

                <PlaylistDropdown
                    songId={songId}
                    open={showPlaylistMenu}
                    onOpenChange={onOpenChange}
                    variant="full"
                    trigger={
                        <button className="text-zinc-500 hover:text-white transition-colors flex items-center cursor-pointer" title="Thêm vào danh sách phát">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    }
                />
            </div>

            <div className="flex items-center gap-2 text-[10px] text-zinc-500 tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>
    );
};

const VolumeControlSection: React.FC<{
    volume: number;
    onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onToggleMute: () => void;
    activeHostUserId: string | null;
    onToggleListenTogether: () => void;
}> = ({ volume, onVolumeChange, onToggleMute, activeHostUserId, onToggleListenTogether }) => {
    const VolumeIcon = volume > 0 ? Volume2 : VolumeX;

    return (
        <div className="hidden sm:flex items-center gap-3 ml-auto min-w-[150px] justify-end">
            <button
                onClick={onToggleListenTogether}
                className={`transition-colors ${activeHostUserId ? "text-purple-400" : "text-zinc-400 hover:text-purple-400"}`}
                title="Nghe chung"
            >
                <UsersRound className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 group">
                <button onClick={onToggleMute} className="text-zinc-400 hover:text-white transition-colors">
                    <VolumeIcon className="w-4 h-4" />
                </button>
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={onVolumeChange}
                    className="w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    style={{
                        background: `linear-gradient(to right, #a855f7 ${volume * 100}%, #27272a ${volume * 100}%)`,
                    }}
                />
            </div>
            <span className="text-[10px] text-zinc-500 w-6 tabular-nums">{Math.round(volume * 100)}</span>
        </div>
    );
};

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

    const { isFavorite: checkFavorite, toggleFavorite } = useFavorites();
    const activeHostUserId = useSelector((state: RootState) => state.musicSession.activeHostUserId);
    const isCoListeningHost = useSelector((state: RootState) => state.musicSession.isHost);
    const currentUserId = useSelector((state: RootState) => state.auth.userSession?.id?.toString());
    const dispatch = useDispatch();
    const isListener = !!activeHostUserId && !isCoListeningHost;
    
    const isFavorite = currentSong ? checkFavorite(currentSong.id) : false;
    const [isHoveringProgress, setIsHoveringProgress] = useState(false);
    const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

    const handleToggleListenTogether = () => {
        if (!currentUserId) return;
        dispatch(joinSessionStart({ hostUserId: currentUserId, currentUserId }));
    };

    const handleToggleFavorite = async () => {
        if (!currentSong) return;
        await toggleFavorite(currentSong.id);
    };

    const handleClickNext = useCallback(() => {
        if (!currentSong || playlist.length === 0 || isListener) return;
        const currentIndex = playlist.findIndex((s: Song) => s.id === currentSong.id);
        const nextIndex = (currentIndex + 1) % playlist.length;
        const nextSong = playlist[nextIndex];
        playSong(nextSong, playbackContext);
    }, [currentSong, isListener, playlist, playSong, playbackContext]);

    const handleClickPrevious = useCallback(() => {
        if (!currentSong || playlist.length === 0 || isListener) return;
        const currentIndex = playlist.findIndex((s: Song) => s.id === currentSong.id);
        const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
        const previousSong = playlist[prevIndex];
        playSong(previousSong, playbackContext);
    }, [currentSong, isListener, playlist, playSong, playbackContext]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isListener) return;
        const newTime = Number.parseFloat(e.target.value);
        if (audioRef.current) audioRef.current.currentTime = newTime;
        if (isCoListeningHost && activeHostUserId && currentSong) {
            MusicSocketManager.sendCommand(activeHostUserId, {
                command: "SEEK",
                payload: {
                    currentTrackId: currentSong.id.toString(),
                    positionMs: Math.round(newTime * 1000),
                },
            });
        }
    };

    const handlePlayPause = () => {
        if (isListener) return;
        togglePlayPause();
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(Number.parseFloat(e.target.value));
    };

    const toggleMute = () => setVolume(volume > 0 ? 0 : 1);

    if (!currentSong) return null;

    const progressValue = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="sticky bottom-0 z-40 shrink-0 w-full h-[88px] bg-gradient-to-b from-[#0d0d1a] to-[#09090f] border-t border-purple-500/15 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
            {/* Progress bar */}
            <div className="relative group h-[3px] bg-white/5">
                <div 
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 transition-all duration-300"
                    style={{ width: `${progressValue}%` }}
                />
                <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime || 0}
                    onChange={handleSeek}
                    disabled={isListener}
                    onMouseEnter={() => setIsHoveringProgress(true)}
                    onMouseLeave={() => setIsHoveringProgress(false)}
                    className={`absolute inset-0 w-full opacity-0 z-10 ${isListener ? "cursor-not-allowed" : "cursor-pointer"}`}
                    aria-label="Progress"
                />
                {isHoveringProgress && !isListener && (
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg pointer-events-none transition-all"
                        style={{ left: `calc(${progressValue}% - 6px)` }}
                    />
                )}
            </div>

            {/* Player Content */}
            <div className="flex h-full w-full px-4 items-center relative">
                <SongInfoSection
                    currentSong={currentSong}
                    isFavorite={isFavorite}
                    onToggleFavorite={handleToggleFavorite}
                />

                <PlayerControlsSection
                    repeatMode={repeatMode}
                    isPlaying={isPlaying}
                    isListener={isListener}
                    currentTime={currentTime}
                    duration={duration}
                    showPlaylistMenu={showPlaylistMenu}
                    onOpenChange={setShowPlaylistMenu}
                    onPlayPause={handlePlayPause}
                    onNext={handleClickNext}
                    onPrevious={handleClickPrevious}
                    onCycleRepeatMode={cycleRepeatMode}
                    songId={currentSong.id}
                />

                <VolumeControlSection
                    volume={volume}
                    onVolumeChange={handleVolumeChange}
                    onToggleMute={toggleMute}
                    activeHostUserId={activeHostUserId}
                    onToggleListenTogether={handleToggleListenTogether}
                />
            </div>
        </div>
    );
};

export default InlineMusicPlayer;
