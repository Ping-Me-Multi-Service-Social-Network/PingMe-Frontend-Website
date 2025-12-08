import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import MusicSearchBar from "./MusicSearchBar";
import { useAudioPlayer } from "@/contexts/useAudioPlayer";
import type { Song } from "@/types/music/song";
import type { SongResponseWithAllAlbum } from "@/types/music";

export default function MusicLayout() {
    const { playSong } = useAudioPlayer();
    const location = useLocation();
    const scrollRef = useRef<HTMLDivElement>(null);

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
        <div className="flex flex-col h-full bg-gray-900" style={{ minHeight: '100vh' }}>
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
