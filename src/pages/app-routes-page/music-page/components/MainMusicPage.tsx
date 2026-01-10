import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { songApi } from "@/services/music/songApi.ts";
import { albumApi } from "@/services/music/albumApi.ts";
import { artistApi } from "@/services/music/artistApi.ts";
import { genreApi } from "@/services/music/genreApi.ts";
import SongListItem from "./SongListItem.tsx";
import AlbumCard from "./AlbumCard.tsx";
import ArtistCard from "./ArtistCard.tsx";
import GenreTag from "./GenreTag.tsx";
import RankingCard from "./RankingCard.tsx";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import type { Song } from "@/types/music/song";
import type { AlbumResponse } from "@/services/music/albumApi.ts";
import type { Genre } from "@/types/music/genre";
import type { SongResponseWithAllAlbum, ArtistResponse } from "@/types/music";
import { useAudioPlayer } from "@/contexts/useAudioPlayer.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MainMusicPage() {
  const { playSong, setPlaylist } = useAudioPlayer();
  const navigate = useNavigate();
  const genreScrollRef = useRef<HTMLDivElement>(null);

  const [topSongs, setTopSongs] = useState<SongResponseWithAllAlbum[]>([]);
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

        // Convert SongResponseWithAllAlbum[] to Song[] for playlist
        const playlistSongs: Song[] = songsData.map((song: SongResponseWithAllAlbum) => ({
          id: song.id,
          title: song.title,
          duration: song.duration,
          playCount: song.playCount,
          songUrl: song.songUrl,
          coverImageUrl: song.coverImageUrl,
          mainArtist: song.mainArtist,
          featuredArtists: song.otherArtists || [],
          genre: song.genres || [],
          album: song.albums || [],
        }));
        setPlaylist(playlistSongs);
        setAlbums(albumsData);
        setArtists(artistsData);
        setGenres(genresData);
        setError(null);
      } catch (err) {
        console.error("Error fetching music data:", err);
        setError("Không thể tải dữ liệu âm nhạc");
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
      `/app/music/songs?type=genre&id=${genre.id}&name=${encodeURIComponent(
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
        {/* Quick Links Section */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/app/music/favorites")}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-900/40 via-pink-900/40 to-gray-800 p-6 text-left hover:scale-105 transition-transform"
          >
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-2">Bài Hát Yêu Thích</h3>
              <p className="text-sm text-gray-300">Những bài hát bạn thích</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-pink-700/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => navigate("/app/music/playlists")}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/40 via-purple-900/40 to-gray-800 p-6 text-left hover:scale-105 transition-transform"
          >
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-2">Danh Sách Phát</h3>
              <p className="text-sm text-white">Bộ sưu tập của bạn</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-700/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => navigate("/app/music/playlists/discover")}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-900/40 via-teal-900/40 to-gray-800 p-6 text-left hover:scale-105 transition-transform"
          >
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-2">Khám Phá Playlist</h3>
              <p className="text-sm text-white">Cộng đồng chia sẻ</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-teal-700/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </section>

        {/* Rankings Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Bảng Xếp Hạng</h2>
            <button
              onClick={() => navigate("/app/music/rankings")}
              className="text-sm font-medium text-purple-400 hover:text-purple-300 transition"
            >
              Xem Tất Cả
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top 50 Today */}
            <RankingCard
              title="Top 50 Hôm Nay"
              description="Bài hát được nghe nhiều nhất hôm nay"
              gradientFrom="from-pink-900/40"
              gradientVia="via-red-900/40"
              hoverFrom="from-pink-600/20"
              hoverTo="to-red-700/20"
              fetchData={fetchTodaySongs}
              tabType="today"
            />

            {/* Top 50 Week */}
            <RankingCard
              title="Top 50 Tuần Này"
              description="Bảng xếp hạng tuần này"
              gradientFrom="from-purple-900/40"
              gradientVia="via-violet-900/40"
              hoverFrom="from-purple-600/20"
              hoverTo="to-violet-700/20"
              fetchData={fetchWeekSongs}
              tabType="week"
            />

            {/* Top 50 Month */}
            <RankingCard
              title="Top 50 Tháng Này"
              description="Bảng xếp hạng tháng này"
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
          <h2 className="text-2xl font-bold text-white">Thể Loại</h2>
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
                <p className="text-zinc-500">Không có thể loại nào</p>
              )}
            </div>
          </div>
        </section>

        {/* Albums Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Album Phổ Biến</h2>
            <button
              onClick={() => navigate("/app/music/albums")}
              className="text-sm font-medium text-purple-400 hover:text-purple-300 transition"
            >
              Thêm
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.length > 0 ? (
              albums.map((album) => <AlbumCard key={album.id} album={album} />)
            ) : (
              <p className="text-zinc-500 col-span-full">Không có album nào</p>
            )}
          </div>
        </section>

        {/* Artists Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Nghệ Sĩ Nổi Tiếng</h2>
            <button
              onClick={() => navigate("/app/music/artists")}
              className="text-sm font-medium text-purple-400 hover:text-purple-300 transition"
            >
              Thêm
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artists.length > 0 ? (
              artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)
            ) : (
              <p className="text-zinc-500 col-span-full">Không có nghệ sĩ nào</p>
            )}
          </div>
        </section>

        {/* Top Songs Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Top 5 Bài Hát</h2>
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
              <p className="text-zinc-500">Không có bài hát nào</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
