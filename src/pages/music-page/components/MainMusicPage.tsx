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
import { useAudioPlayer } from "@/contexts/useAudioPlayer";

export default function MainMusicPage() {
  const { playSong, setPlaylist } = useAudioPlayer();

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
          songApi.getTopSongs(10),
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

  const handleSongPlay = (song: Song) => {
    playSong(song);
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
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 pb-32">
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-10">
        {/* Genres Section */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Browse by Genre</h2>
          <div className="flex flex-wrap gap-3">
            {genres.length > 0 ? (
              genres.map((genre) => <GenreTag key={genre.id} genre={genre} />)
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
          <h2 className="text-2xl font-bold text-white">Top 10 Tracks</h2>
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
