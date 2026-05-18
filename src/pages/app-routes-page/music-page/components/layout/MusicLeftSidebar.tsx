import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Music, Heart, ListMusic, ChevronRight, Lock, Globe, Loader2, Library, Compass, Trophy } from "lucide-react";
import { playlistApi } from "@/services/music/playlistApi.ts";
import type { PlaylistDto } from "@/types/music/playlist.ts";
import CreatePlaylistDialog from "../dialogs/CreatePlaylistDialog";
import { useTranslation } from "react-i18next";

export default function MusicLeftSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation("music");
    const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const data = await playlistApi.getPlaylists();
            setPlaylists(data);
        } catch (err) {
            console.error("Error fetching playlists:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    // Refresh playlists when navigating back to a playlist-related page
    useEffect(() => {
        if (location.pathname.includes("/app/music/playlists")) {
            fetchPlaylists();
        }
    }, [location.pathname]);

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

    const getNavPillClasses = (path: string) => {
        let classes = "text-xs px-3 py-1.5 rounded-full font-medium transition-all ";
        if (isActive(path)) {
            classes += "bg-white text-black";
        } else {
            classes += "bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600/60 hover:text-white";
        }
        return classes;
    };

    const getBtnContainerClasses = (path: string) => {
        let classes = "mx-2 mb-1 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ";
        if (isActive(path)) {
            classes += "bg-purple-600/20 text-white";
        } else {
            classes += "text-zinc-400 hover:bg-zinc-700/40 hover:text-white";
        }
        return classes;
    };

    const getFavIconBoxClasses = (path: string) => {
        let classes = "w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center shadow-lg ";
        if (isActive(path)) {
            classes += "bg-gradient-to-br from-red-500 to-pink-600";
        } else {
            classes += "bg-gradient-to-br from-red-600/70 to-pink-700/70 group-hover:from-red-500 group-hover:to-pink-600";
        }
        return classes;
    };

    const getDiscoverIconBoxClasses = (path: string) => {
        let classes = "w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center shadow-lg ";
        if (isActive(path)) {
            classes += "bg-gradient-to-br from-green-500 to-teal-600";
        } else {
            classes += "bg-gradient-to-br from-green-600/70 to-teal-700/70 group-hover:from-green-500 group-hover:to-teal-600";
        }
        return classes;
    };

    const getGuessIconBoxClasses = (path: string) => {
        let classes = "w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center shadow-lg ";
        if (isActive(path)) {
            classes += "bg-gradient-to-br from-amber-400 to-rose-500";
        } else {
            classes += "bg-gradient-to-br from-amber-500/80 to-rose-600/80 group-hover:from-amber-400 group-hover:to-rose-500";
        }
        return classes;
    };

    const getPlaylistBtnClasses = (id: number) => {
        let classes = "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all group text-left ";
        if (isActive(`/app/music/playlists/${id}`)) {
            classes += "bg-purple-600/20 text-white";
        } else {
            classes += "text-zinc-400 hover:bg-zinc-700/40 hover:text-white";
        }
        return classes;
    };
    
    const getTextColor = (path: string) => {
        if (isActive(path)) return "text-white";
        return "text-zinc-200";
    };

    let contentToRender = null;
    if (loading) {
        contentToRender = (
            <div className="flex items-center justify-center py-6">
                <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
            </div>
        );
    } else if (playlists.length === 0) {
        contentToRender = (
            <div className="px-3 py-4">
                <button
                    type="button"
                    className="w-full border border-dashed border-zinc-700 rounded-xl p-4 text-center cursor-pointer hover:border-purple-600/40 transition-colors group"
                    onClick={() => setShowCreateDialog(true)}
                >
                    <ListMusic className="w-7 h-7 text-zinc-600 group-hover:text-purple-400 transition-colors mx-auto mb-2" />
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                        {t("sidebar.createFirstPlaylist") || "Tạo playlist đầu tiên"}
                    </p>
                </button>
            </div>
        );
    } else {
        contentToRender = (
            <div className="space-y-0.5">
                {playlists.map((playlist) => {
                    let lockIcon = <Lock className="w-3 h-3 text-zinc-500" />;
                    if (playlist.isPublic) {
                        lockIcon = <Globe className="w-3 h-3 text-zinc-500" />;
                    }

                    const playlistPath = `/app/music/playlists/${playlist.id}`;
                    const textColor = getTextColor(playlistPath);
                    const hue1 = (playlist.id * 47) % 360;
                    const hue2 = (playlist.id * 47 + 120) % 360;
                    const gradientBackground = `linear-gradient(135deg, hsl(${hue1}, 60%, 40%), hsl(${hue2}, 60%, 30%))`;

                    return (
                        <button
                            key={playlist.id}
                            onClick={() => navigate(playlistPath)}
                            className={getPlaylistBtnClasses(playlist.id)}
                        >
                            {/* Playlist Thumbnail */}
                            <div
                                className="w-10 h-10 rounded-md flex-shrink-0 flex items-center justify-center"
                                style={{ background: gradientBackground }}
                            >
                                <Music className="w-4 h-4 text-white/80" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${textColor}`}>
                                    {playlist.name}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    {lockIcon}
                                    <span className="text-xs text-zinc-500">
                                        {t("sidebar.playlistLabel") || "Playlist"}
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}

                {/* View all playlists */}
                <button
                    onClick={() => navigate("/app/music/playlists")}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-zinc-500 hover:text-purple-400 transition-colors text-xs font-medium mt-1"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                    {t("sidebar.viewAllPlaylists") || "Xem tất cả"}
                </button>
            </div>
        );
    }

    return (
        <>
            <aside
                className="music-left-sidebar flex flex-col h-full w-full music-smart-scroll"
                style={{
                    background: "linear-gradient(180deg, #0f0f1a 0%, #111118 100%)",
                    borderRight: "1px solid rgba(139,92,246,0.12)",
                    overflowY: "auto",
                    overflowX: "hidden",
                }}
            >
                {/* Library Header */}
                <div className="flex items-center justify-between px-4 pt-5 pb-3">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 group"
                        title="Your Library"
                    >
                        <Library className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                        <span className="text-sm font-semibold text-zinc-400 group-hover:text-white transition-colors">
                            {t("sidebar.library") || "Thư viện"}
                        </span>
                    </button>
                    <button
                        onClick={() => setShowCreateDialog(true)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-all group relative"
                        title={t("pages.playlists.createTitle") || "Tạo playlist"}
                    >
                        <Plus className="w-4 h-4" />
                        {/* Tooltip */}
                        <span className="absolute left-10 top-1/2 -translate-y-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                            {t("sidebar.createPlaylist") || "Tạo playlist"}
                        </span>
                    </button>
                </div>

                {/* Quick Nav Pills */}
                <div className="px-2 pb-3 flex gap-2 flex-wrap">
                    <button
                        onClick={() => navigate("/app/music/playlists")}
                        className={getNavPillClasses("/app/music/playlists")}
                    >
                        {t("nav.playlists") || "Playlists"}
                    </button>
                    <button
                        onClick={() => navigate("/app/music/favorites")}
                        className={getNavPillClasses("/app/music/favorites")}
                    >
                        {t("nav.favorites") || "Yêu thích"}
                    </button>
                </div>

                {/* Divider */}
                <div className="mx-4 mb-3 border-t border-zinc-800/60" />

                {/* Favorites Quick Link */}
                <button
                    onClick={() => navigate("/app/music/favorites")}
                    className={getBtnContainerClasses("/app/music/favorites")}
                >
                    <div className={getFavIconBoxClasses("/app/music/favorites")}>
                        <Heart className="w-5 h-5 text-white fill-white" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className={`text-sm font-semibold truncate ${getTextColor("/app/music/favorites")}`}>
                            {t("home.quickLinks.favorites") || "Bài hát yêu thích"}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                            {t("sidebar.pinnedPlaylist") || "Danh sách phát"}
                        </p>
                    </div>
                </button>

                {/* Discover Playlists Quick Link */}
                <button
                    onClick={() => navigate("/app/music/playlists/discover")}
                    className={getBtnContainerClasses("/app/music/playlists/discover")}
                >
                    <div className={getDiscoverIconBoxClasses("/app/music/playlists/discover")}>
                        <Compass className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className={`text-sm font-semibold truncate ${getTextColor("/app/music/playlists/discover")}`}>
                            {t("home.quickLinks.discover") || "Khám phá Playlist"}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                            {t("home.quickLinks.discoverDesc") || "Cộng đồng chia sẻ"}
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => navigate("/app/music/guess")}
                    className={getBtnContainerClasses("/app/music/guess")}
                >
                    <div className={getGuessIconBoxClasses("/app/music/guess")}>
                        <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className={`text-sm font-semibold truncate ${getTextColor("/app/music/guess")}`}>
                            Đoán âm nhạc
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                            Solo & phòng đấu
                        </p>
                    </div>
                </button>
                
                {/* Expanded Menu */}
                {isExpanded && (
                    <div className="flex-1 px-2 pb-4">
                        {/* Section label */}
                        <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                                {t("sidebar.playlists") || "Playlists"}
                            </span>
                            <button
                                onClick={() => navigate("/app/music/playlists")}
                                className="text-zinc-500 hover:text-white transition-colors"
                                title="View all playlists"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {contentToRender}
                    </div>
                )}
            </aside>

            {/* Create Playlist Dialog */}
            <CreatePlaylistDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={fetchPlaylists}
            />
        </>
    );
}
