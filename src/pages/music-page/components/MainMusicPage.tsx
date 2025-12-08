import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { songApi } from "@/services/music/songApi";
import { albumApi } from "@/services/music/albumApi";
import { artistApi } from "@/services/music/artistApi";
import { genreApi } from "@/services/music/genreApi";
import SongListItem from "./SongListItem";
import AlbumCard from "./AlbumCard";
import ArtistCard from "./ArtistCard";
import GenreTag from "./GenreTag";
import RankingCard from "./RankingCard";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import type { Song } from "@/types/music/song";
import type { AlbumResponse } from "@/services/music/albumApi";
import type { Genre } from "@/types/music/genre";
import type { SongResponseWithAllAlbum, ArtistResponse } from "@/types/music";
import { useAudioPlayer } from "@/contexts/useAudioPlayer";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MainMusicPage() {
  const { playSong, setPlaylist } = useAudioPlayer();
  const navigate = useNavigate();
  const genreScrollRef = useRef<HTMLDivElement>(null);

  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<AlbumResponse[]>([]);
  const [artists, setArtists] = useState<ArtistResponse[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [songsData, albumsData, artistsData, genresData] = await Promise.all([
          songApi.getTopSongs(5),
          albumApi.getPopularAlbums(5),
          artistApi.getPopularArtists(5),
          genreApi.getAllGenres(),
        ]);
        setTopSongs(songsData);
        setPlaylist(songsData);
        setAlbums(albumsData);
        setArtists(artistsData);
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

  useEffect(() => {
    const checkScroll = () => {
      if (genreScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = genreScrollRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    checkScroll();
    const scrollElement = genreScrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, [genres]);

  const scrollGenres = (direction: "left" | "right") => {
    if (genreScrollRef.current) {
      const cardWidth = 192; // w-48 = 192px
      const gap = 16; // gap-4 = 16px
      const scrollAmount = cardWidth + gap; // Scroll 1 card at a time
      const newScrollLeft = genreScrollRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
      genreScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

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

  const handleGenreSelect = (genre: Genre) => {
    navigate(
      `/music/songs?type=genre&id=${genre.id}&name=${encodeURIComponent(
        genre.name
      )}`
    );
  };

  // Memoize fetch functions to prevent re-creation on every render
  const fetchTodaySongs = useCallback(() => songApi.getTopSongsToday(50), []);
  const fetchWeekSongs = useCallback(() => songApi.getTopSongsThisWeek(50), []);
  const fetchMonthSongs = useCallback(() => songApi.getTopSongsThisMonth(50), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 min-h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 min-h-full">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 pb-32" style={{ minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Rankings Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Rankings</h2>
            <button
              onClick={() => navigate("/music/rankings")}
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top 50 Today */}
            <RankingCard
              title="Top 50 Today"
              description="Most listened songs today"
              gradientFrom="from-pink-900/40"
              gradientVia="via-red-900/40"
              hoverFrom="from-pink-600/20"
              hoverTo="to-red-700/20"
              fetchData={fetchTodaySongs}
              tabType="today"
            />

            {/* Top 50 Week */}
            <RankingCard
              title="Top 50 This Week"
              description="This week's rankings"
              gradientFrom="from-blue-900/40"
              gradientVia="via-cyan-900/40"
              hoverFrom="from-blue-600/20"
              hoverTo="to-cyan-700/20"
              fetchData={fetchWeekSongs}
              tabType="week"
            />

            {/* Top 50 Month */}
            <RankingCard
              title="Top 50 This Month"
              description="This month's rankings"
              gradientFrom="from-purple-900/40"
              gradientVia="via-indigo-900/40"
              hoverFrom="from-purple-600/20"
              hoverTo="to-indigo-700/20"
              fetchData={fetchMonthSongs}
              tabType="month"
            />
          </div>
        </section>

        {/* Genres Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Browse by Genre</h2>
          <div className="relative group">
            {/* Left Arrow */}
            {showLeftArrow && (
              <button
                onClick={() => scrollGenres("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/95 hover:bg-gray-700 text-white p-3 rounded-full shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Right Arrow */}
            {showRightArrow && (
              <button
                onClick={() => scrollGenres("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/95 hover:bg-gray-700 text-white p-3 rounded-full shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Scrollable Container */}
            <div
              ref={genreScrollRef}
              className="flex gap-4 overflow-x-auto pb-2 pr-4"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                scrollSnapType: "x mandatory"
              }}
            >
              <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {genres.length > 0 ? (
                genres.map((genre) => (
                  <div
                    key={genre.id}
                    className="flex-shrink-0 w-48"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <GenreTag genre={genre} onClick={handleGenreSelect} />
                  </div>
                ))
              ) : (
                <p className="text-zinc-500">No genres available</p>
              )}
            </div>
          </div>
        </section>

        {/* Albums Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Popular Albums</h2>
            <button
              onClick={() => navigate("/music/albums")}
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition"
            >
              More
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.length > 0 ? (
              albums.map((album) => <AlbumCard key={album.id} album={album} />)
            ) : (
              <p className="text-zinc-500 col-span-full">No albums available</p>
            )}
          </div>
        </section>

        {/* Artists Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Popular Artists</h2>
            <button
              onClick={() => navigate("/music/artists")}
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition"
            >
              More
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artists.length > 0 ? (
              artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)
            ) : (
              <p className="text-zinc-500 col-span-full">No artists available</p>
            )}
          </div>
        </section>

        {/* Top Songs Section */}
        <section className="space-y-4">
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
