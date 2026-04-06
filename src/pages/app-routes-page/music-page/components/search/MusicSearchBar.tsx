import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import SearchDropdown from "./SearchDropdown.tsx";
import type { SongResponseWithAllAlbum, ArtistResponse } from "@/types/music";
import type { AlbumResponse } from "@/services/music/albumApi.ts";
import { useTranslation } from "react-i18next";

interface MusicSearchBarProps {
    onSongPlay?: (song: SongResponseWithAllAlbum) => void;
}

export default function MusicSearchBar({ onSongPlay }: Readonly<MusicSearchBarProps>) {
    const navigate = useNavigate();
    const { t } = useTranslation("music");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setShowSearchDropdown(true);
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setShowSearchDropdown(false);
    };

    const handleAlbumSelect = (album: AlbumResponse) => {
        setSearchQuery("");
        setShowSearchDropdown(false);
        navigate(
            `/app/music/songs?type=album&id=${album.id}&name=${encodeURIComponent(
                album.title
            )}&imageUrl=${encodeURIComponent(album.coverImgUrl || "")}`
        );
    };

    const handleArtistSelect = (artist: ArtistResponse) => {
        setSearchQuery("");
        setShowSearchDropdown(false);
        navigate(
            `/app/music/songs?type=artist&id=${artist.id}&name=${encodeURIComponent(
                artist.name
            )}&imageUrl=${encodeURIComponent(artist.imgUrl || "")}`
        );
    };

    const handleViewAllSongs = () => {
        setShowSearchDropdown(false);
        navigate(`/app/music/search?q=${encodeURIComponent(searchQuery)}&type=songs`);
    };

    const handleViewAllAlbums = () => {
        setShowSearchDropdown(false);
        navigate(`/app/music/search?q=${encodeURIComponent(searchQuery)}&type=albums`);
    };

    const handleViewAllArtists = () => {
        setShowSearchDropdown(false);
        navigate(`/app/music/search?q=${encodeURIComponent(searchQuery)}&type=artists`);
    };

    return (
        <div className="relative w-full">
            <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder={t("layout.header.searchPlaceholder")}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSearchDropdown(true)}
                    className="w-full pl-10 pr-10 py-2 rounded-full text-sm text-white placeholder-zinc-500 focus:outline-none transition"
                    style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onBlur={(e) => {
                        // Delay hiding dropdown to allow click events
                        setTimeout(() => {
                            if (!e.currentTarget.contains(document.activeElement)) {
                                setShowSearchDropdown(false);
                            }
                        }, 200);
                    }}
                />
                {searchQuery && (
                    <button
                        onClick={handleClearSearch}
                        className="absolute right-3 text-zinc-400 hover:text-white transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            <SearchDropdown
                query={searchQuery}
                isOpen={showSearchDropdown && searchQuery.length > 0}
                onSongSelect={(song: SongResponseWithAllAlbum) => {
                    setSearchQuery("");
                    setShowSearchDropdown(false);
                    if (onSongPlay) {
                        onSongPlay(song);
                    }
                }}
                onAlbumSelect={handleAlbumSelect}
                onArtistSelect={handleArtistSelect}
                onViewMoreSongs={handleViewAllSongs}
                onViewMoreAlbums={handleViewAllAlbums}
                onViewMoreArtists={handleViewAllArtists}
            />
        </div>
    );
}
