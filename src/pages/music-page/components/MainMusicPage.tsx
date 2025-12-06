import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { songApi } from "@/services/music/songApi";
import { albumApi } from "@/services/music/albumApi";
import { genreApi } from "@/services/music/genreApi";
import SongListItem from "./SongListItem";
import AlbumCard from "./AlbumCard";
import GenreTag from "./GenreTag";
import SearchDropdown from "./SearchDropdown";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import type { Song } from "@/types/music/song";
import type { AlbumResponse } from "@/services/music/albumApi";
import type { Genre } from "@/types/music/genre";
import type { SongResponseWithAllAlbum, ArtistResponse } from "@/types/music";
import { useAudioPlayer } from "@/contexts/useAudioPlayer";
import { Search, X } from "lucide-react";

export default function MainMusicPage() {
  const { playSong, setPlaylist } = useAudioPlayer();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<AlbumResponse[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [songsData, albumsData, genresData] = await Promise.all([
          songApi.getTopSongs(5),
          albumApi.getAllAlbums(),
          genreApi.getAllGenres(),
        ]);
        setTopSongs(songsData);
        setPlaylist(songsData);
        setAlbums(albumsData);
        setGenres(genresData);
        setError(null);
      } catch (err) {
        console.error("Error fetching music data:", err);
        setError("Failed to load music data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setPlaylist]);

  const handleSongPlay = (song: Song | SongResponseWithAllAlbum) => {
    const songToPlay: Song = {
      id: song.id,
      title: song.title,
      duration: song.duration,
      playCount: song.playCount,
      songUrl: song.songUrl,
      coverImageUrl: song.coverImageUrl,
      mainArtist: song.mainArtist,
      featuredArtists: "otherArtists" in song ? song.otherArtists : [],
      genre: "genres" in song ? song.genres : [],
      album: "albums" in song ? song.albums : [],
    };
    playSong(songToPlay);
  };

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

  const handleGenreSelect = (genre: Genre) => {
    navigate(
      `/music/songs?type=genre&id=${genre.id}&name=${encodeURIComponent(
        genre.name
      )}`
    );
  };

  // Added handlers for "View all" buttons in search dropdown
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-900 pb-32">
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-10">
        <section className="relative">
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
              handleSongPlay(song);
            }}
            onAlbumSelect={handleAlbumSelect}
            onArtistSelect={handleArtistSelect}
            onViewMoreSongs={handleViewAllSongs}
            onViewMoreAlbums={handleViewAllAlbums}
            onViewMoreArtists={handleViewAllArtists}
          />
        </section>

        {/* Genres Section */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Browse by Genre</h2>
          <div className="flex flex-wrap gap-3">
            {genres.length > 0 ? (
              genres.map((genre) => (
                <GenreTag
                  key={genre.id}
                  genre={genre}
                  onClick={handleGenreSelect}
                />
              ))
            ) : (
              <p className="text-zinc-500">No genres available</p>
            )}
          </div>
        </section>

        {/* Albums Section */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Popular Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {albums.length > 0 ? (
              albums.map((album) => <AlbumCard key={album.id} album={album} />)
            ) : (
              <p className="text-zinc-500">No albums available</p>
            )}
          </div>
        </section>

        {/* Top Songs Section */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Top 5 Tracks</h2>
          <div className="space-y-2">
            {topSongs.length > 0 ? (
              topSongs.map((song, index) => (
                <SongListItem
                  key={song.id}
                  song={song}
                  onPlay={handleSongPlay}
                  index={index + 1}
                />
              ))
            ) : (
              <p className="text-zinc-500">No songs available</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
