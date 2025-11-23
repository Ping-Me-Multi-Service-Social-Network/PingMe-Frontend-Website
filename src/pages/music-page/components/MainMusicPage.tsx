import { useState, useEffect } from "react";
import { songApi } from "@/services/music/songApi";
import { albumApi } from "@/services/music/albumApi";
import { genreApi } from "@/services/music/genreApi";
import SongListItem from "./SongListItem";
import AlbumCard from "./AlbumCard";
import GenreTag from "./GenreTag";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import type { Song } from "@/types/music/song";
import type { AlbumResponse } from "@/services/music/albumApi";
import type { Genre } from "@/types/music/genre";

interface MainMusicPageProps {
  onSongSelect?: (song: Song) => void;
  onPlaylistReady?: (songs: Song[]) => void;
}

export default function MainMusicPage({
  onSongSelect,
  onPlaylistReady,
}: MainMusicPageProps) {
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<AlbumResponse[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("[v0] Fetching music data...");
        const [songsData, albumsData, genresData] = await Promise.all([
          songApi.getTopSongs(10),
          albumApi.getAllAlbums(),
          genreApi.getAllGenres(),
        ]);
        console.log("[v0] Data fetched successfully");
        setTopSongs(songsData);
        setAlbums(albumsData);
        setGenres(genresData);
        setError(null);

        if (onPlaylistReady) {
          onPlaylistReady(songsData);
        }
      } catch (err) {
        console.error("[v0] Error fetching music data:", err);
        setError("Failed to load music data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array to fetch only once on mount

  const handleSongPlay = (song: Song) => {
    if (onSongSelect) {
      onSongSelect(song);
    }
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
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto pb-32">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Music</h1>
          <p className="text-gray-600">
            Discover and enjoy your favorite tracks
          </p>
        </div>

        {/* Genres Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Genres</h2>
          <div className="flex flex-wrap gap-3">
            {genres.length > 0 ? (
              genres.map((genre) => <GenreTag key={genre.id} genre={genre} />)
            ) : (
              <p className="text-gray-500">No genres available</p>
            )}
          </div>
        </section>

        {/* Albums Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Albums</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {albums.length > 0 ? (
              albums.map((album) => <AlbumCard key={album.id} album={album} />)
            ) : (
              <p className="text-gray-500">No albums available</p>
            )}
          </div>
        </section>

        {/* Top Songs Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Top 10 Songs
          </h2>
          <div className="space-y-3">
            {topSongs.length > 0 ? (
              topSongs.map((song) => (
                <SongListItem
                  key={song.id}
                  song={song}
                  onPlay={handleSongPlay}
                />
              ))
            ) : (
              <p className="text-gray-500">No songs available</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
