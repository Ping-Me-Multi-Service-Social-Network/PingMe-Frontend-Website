import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import SearchDropdown from "./SearchDropdown";
import type { SongResponseWithAllAlbum, ArtistResponse } from "@/types/music";
import type { AlbumResponse } from "@/services/music/albumApi";

interface MusicSearchBarProps {
    onSongPlay?: (song: SongResponseWithAllAlbum) => void;
}

export default function MusicSearchBar({ onSongPlay }: MusicSearchBarProps) {
    const navigate = useNavigate();
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
            `/music/songs?type=album&id=${album.id}&name=${encodeURIComponent(
                album.title
            )}&imageUrl=${encodeURIComponent(album.coverImgUrl || "")}`
        );
    };

    const handleArtistSelect = (artist: ArtistResponse) => {
        setSearchQuery("");
        setShowSearchDropdown(false);
        navigate(
            `/music/songs?type=artist&id=${artist.id}&name=${encodeURIComponent(
                artist.name
            )}&imageUrl=${encodeURIComponent(artist.imgUrl || "")}`
        );
    };

    const handleViewAllSongs = () => {
        setShowSearchDropdown(false);
        navigate(`/music/search?q=${encodeURIComponent(searchQuery)}&type=songs`);
    };

    const handleViewAllAlbums = () => {
        setShowSearchDropdown(false);
        navigate(`/music/search?q=${encodeURIComponent(searchQuery)}&type=albums`);
    };

    const handleViewAllArtists = () => {
        setShowSearchDropdown(false);
        navigate(`/music/search?q=${encodeURIComponent(searchQuery)}&type=artists`);
    };

    return (
        <div className="sticky top-0 z-50 bg-gray-900 border-b border-zinc-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-8 py-4">
                <div className="relative">
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 w-5 h-5 text-zinc-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search songs, albums, artists..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => setShowSearchDropdown(true)}
                            className="w-full pl-10 pr-10 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                        />
                        {searchQuery && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 text-zinc-400 hover:text-white transition"
                            >
                                <X className="w-5 h-5" />
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
            </div>
        </div>
    );
}
