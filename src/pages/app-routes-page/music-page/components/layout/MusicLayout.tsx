import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import MusicSearchBar from "../search/MusicSearchBar.tsx";
import { useAudioPlayer } from "@/contexts/useAudioPlayer.tsx";
import type { Song } from "@/types/music/song";
import type { SongResponseWithAllAlbum } from "@/types/music";

export default function MusicLayout() {
    const { playSong } = useAudioPlayer();
    const location = useLocation();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isEntering, setIsEntering] = useState(true);

    // Trigger entrance animation on mount
    useEffect(() => {
        setIsEntering(true);
        const timer = setTimeout(() => setIsEntering(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // Scroll to top when route changes (without animation to prevent jank)
    useEffect(() => {
        if (scrollRef.current) {
            // Use requestAnimationFrame to prevent layout shift
            requestAnimationFrame(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = 0;
                }
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

    return (
        <div
            className={`flex flex-col h-full bg-gray-900 ${isEntering ? 'music-module-enter' : ''}`}
            style={{
                minHeight: '100vh',
                transition: 'background-color 0.6s ease-in-out'
            }}
        >
            <div
                ref={scrollRef}
                className="flex-1"
                style={{
                    overflowY: 'scroll',
                    scrollbarGutter: 'stable',
                    scrollbarWidth: 'auto'
                }}
            >
                <MusicSearchBar onSongPlay={handleSongPlay} />
                <div style={{ minHeight: 'calc(100vh - 80px)' }}>
                    <Outlet />
                </div>
            </div>

        </div>
    );
}
