import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import MusicSearchBar from "../search/MusicSearchBar.tsx";
import MusicLeftSidebar from "./MusicLeftSidebar.tsx";
import MusicRightPanel from "./MusicRightPanel.tsx";
import { useAudio } from "@/hooks/useAudio.tsx";
import type { Song } from "@/types/music/song";
import type { SongResponseWithAllAlbum } from "@/types/music";
import { Home, PanelLeftOpen, PanelRightOpen } from "lucide-react";
import InlineMusicPlayer from "./InlineMusicPlayer.tsx";

/**
 * Music Layout — Spotify-style 3-column layout
 *
 * Structure:
 *   [Header: toggle | home + search (centered) | toggle]
 *   [Left Sidebar | Center (1fr) | Right Panel]   ← CSS Grid, NOT flex
 *   [Inline Player Bar]
 *
 * Dùng CSS Grid cho middle section thay vì flex:
 *   - Cột giữa dùng "1fr" → luôn lấy đúng phần còn lại, KHÔNG bao giờ overflow
 *   - Right panel không bao giờ bị squeeze dù content bên trong main rộng cỡ nào
 */
export default function MusicLayout() {
    const { playSong } = useAudio();
    const location = useLocation();
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [showLeftSidebar, setShowLeftSidebar] = useState(true);
    const [showRightPanel, setShowRightPanel] = useState(true);

    useEffect(() => {
        const applyResponsive = () => {
            const w = window.innerWidth;
            if (w < 768) {
                setShowLeftSidebar(false);
                setShowRightPanel(false);
            } else if (w < 1100) {
                setShowLeftSidebar(true);
                setShowRightPanel(false);
            } else {
                setShowLeftSidebar(true);
                setShowRightPanel(true);
            }
        };
        applyResponsive();
        window.addEventListener("resize", applyResponsive);
        return () => window.removeEventListener("resize", applyResponsive);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            requestAnimationFrame(() => {
                if (scrollRef.current) scrollRef.current.scrollTop = 0;
            });
        }
    }, [location.pathname]);

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

    const leftWidth  = "clamp(180px, 15vw, 240px)";
    const rightWidth = "clamp(200px, 16vw, 260px)";

    // CSS Grid columns: sidebar widths collapse to 0 when hidden
    let lWidth = "0px";
    if (showLeftSidebar) {
        lWidth = leftWidth;
    }
    let rWidth = "0px";
    if (showRightPanel) {
        rWidth = rightWidth;
    }
    const gridCols = [lWidth, "1fr", rWidth].join(" ");

    let homeBtnBg = "rgba(255,255,255,0.08)";
    let homeBtnColor = "#a1a1aa";
    if (location.pathname === "/app/music") {
        homeBtnBg = "linear-gradient(135deg, #7c3aed, #9333ea)";
        homeBtnColor = "#fff";
    }

    let leftSidebarBtnTitle = "Hiện thư viện";
    let leftSidebarBtnColor = "#a1a1aa";
    let leftSidebarOpacity = 0;
    let leftSidebarPointer = "none";
    if (showLeftSidebar) {
        leftSidebarBtnTitle = "Ẩn thư viện";
        leftSidebarBtnColor = "#a78bfa";
        leftSidebarOpacity = 1;
        leftSidebarPointer = "auto";
    }

    let rightPanelBtnTitle = "Hiện thông tin bài hát";
    let rightPanelBtnColor = "#a1a1aa";
    let rightPanelOpacity = 0;
    let rightPanelPointer = "none";
    if (showRightPanel) {
        rightPanelBtnTitle = "Ẩn thông tin bài hát";
        rightPanelBtnColor = "#a78bfa";
        rightPanelOpacity = 1;
        rightPanelPointer = "auto";
    }

    return (
        <div
            className="flex flex-col h-screen bg-[#07070a] text-zinc-100 select-none relative w-full overflow-hidden"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
        >
            <style>{`
                .music-smart-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: transparent transparent;
                    transition: scrollbar-color 0.3s ease;
                }
                .music-smart-scroll:hover {
                    scrollbar-color: rgba(139, 92, 246, 0.4) transparent;
                }
                .music-smart-scroll::-webkit-scrollbar {
                    width: 6px;
                    background-color: transparent;
                }
                .music-smart-scroll::-webkit-scrollbar-thumb {
                    background-color: transparent;
                    border-radius: 9999px;
                }
                .music-smart-scroll:hover::-webkit-scrollbar-thumb {
                    background-color: rgba(139, 92, 246, 0.4);
                }
            `}</style>

            {/* ── TOP HEADER ── */}
            <header
                className="shrink-0 z-40 relative"
                style={{
                    background: "linear-gradient(180deg, #0a0a14 0%, rgba(10,10,20,0.92) 100%)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(139,92,246,0.1)",
                    height: "64px",
                    width: "100%",
                }}
            >
                {/* CENTER: home + search (Luôn đứng yên chính giữa màn hình, không phụ thuộc vào sidebar) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-2 px-4 min-w-0 w-full max-w-[600px] h-full pointer-events-auto z-10">
                    <button
                        onClick={() => navigate("/app/music")}
                        id="music-home-btn"
                        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105"
                        title="Trang chủ"
                        style={{
                            background: homeBtnBg,
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        <Home
                            className="w-4 h-4"
                            style={{ color: homeBtnColor }}
                        />
                    </button>
                    <div className="flex-1 w-full min-w-0">
                        <MusicSearchBar onSongPlay={handleSongPlay} />
                    </div>
                </div>

                {/* LEFT: library toggle (Absolutely positioned so it never disappears) */}
                <div className="absolute left-6 top-0 h-full flex items-center justify-start z-10 pointer-events-auto">
                    <button
                        onClick={() => setShowLeftSidebar((v) => !v)}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 bg-white/5 hover:bg-white/10"
                        title={leftSidebarBtnTitle}
                        style={{ color: leftSidebarBtnColor }}
                    >
                        <PanelLeftOpen className="w-5 h-5" />
                    </button>
                </div>

                {/* RIGHT: now-playing toggle (Absolutely positioned) */}
                <div className="absolute right-6 top-0 h-full flex items-center justify-end z-10 pointer-events-auto">
                    <button
                        onClick={() => setShowRightPanel((v) => !v)}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 bg-white/5 hover:bg-white/10"
                        title={rightPanelBtnTitle}
                        style={{ color: rightPanelBtnColor }}
                    >
                        <PanelRightOpen className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* ── MIDDLE: CSS Grid (key fix) ── */}
            <div
                className="flex-1 min-h-0 w-full"
                style={{
                    display: "grid",
                    gridTemplateColumns: gridCols,
                    transition: "grid-template-columns 300ms ease-in-out",
                    overflow: "hidden",
                }}
            >
                {/* Left Sidebar */}
                <div
                    className="h-full overflow-hidden"
                    style={{
                        opacity: leftSidebarOpacity,
                        pointerEvents: leftSidebarPointer as any,
                        transition: "opacity 300ms ease-in-out",
                    }}
                >
                    <MusicLeftSidebar />
                </div>

                {/* Center — 1fr: always gets exactly its allocated space, never overflows */}
                <main
                    ref={scrollRef}
                    className="relative overflow-hidden music-smart-scroll"
                    style={{
                        overflowY: "scroll",
                        overflowX: "hidden",
                        scrollbarGutter: "stable",
                        background: "linear-gradient(180deg, #111118 0%, #0d0d14 100%)",
                    }}
                >
                    <Outlet />
                </main>

                {/* Right Panel */}
                <div
                    className="h-full overflow-hidden"
                    style={{
                        opacity: rightPanelOpacity,
                        pointerEvents: rightPanelPointer as any,
                        transition: "opacity 300ms ease-in-out",
                    }}
                >
                    <MusicRightPanel />
                </div>
            </div>

            {/* ── BOTTOM PLAYER ── */}
            <InlineMusicPlayer />
        </div>
    );
}