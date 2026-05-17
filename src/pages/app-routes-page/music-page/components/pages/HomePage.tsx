import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "@/pages/app-routes-page/music-page/components/shared/SectionHeader.tsx";
import ScrollRow from "@/pages/app-routes-page/music-page/components/shared/ScrollRow.tsx";
import RankingCard from "@/pages/app-routes-page/music-page/components/cards/RankingCard.tsx";
import GenreTag from "@/pages/app-routes-page/music-page/components/shared/GenreTag";
import AlbumCard from "@/pages/app-routes-page/music-page/components/cards/AlbumCard.tsx";
import ArtistCard from "@/pages/app-routes-page/music-page/components/cards/ArtistCard.tsx";
import SongListItem from "@/pages/app-routes-page/music-page/components/cards/SongListItem.tsx";
import { useAppDispatch, useAppSelector } from "@/features/hooks";
import { fetchDashboard } from "@/features/music/musicSlice";
import { useAudio } from "@/hooks/useAudio";
import type { Song } from "@/types/music/song";
import type { Genre } from "@/types/music/genre";
import { useTranslation } from "react-i18next";


export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { playSong, setPlaylist } = useAudio();
  const {
    allGenres: genres,
    popularAlbums: albums,
    popularArtists: artists,
    topSongs,
    rankingsToday,
    rankingsWeek,
    rankingsMonth,
    lastFetched,
    cacheExpiry,
    loading,
  } = useAppSelector((state) => state.music);

  const { t } = useTranslation("music");

  useEffect(() => {
    const now = Date.now();
    const isExpired = !cacheExpiry || now > cacheExpiry;
    if (!lastFetched || isExpired) {
      dispatch(fetchDashboard({
        topSongsLimit: 10,
        albumLimit: 5,
        artistLimit: 10,
        genreLimit: 10,
        rankingLimit: 10,
      }));
    }
  }, [dispatch, lastFetched, cacheExpiry]);

  const handleSongPlay = (song: Song) => {
    setPlaylist(topSongs);
    playSong(song, { type: "all", id: "home" });
  };

  const handleGenreSelect = (genre: Genre) => {
    navigate(`/app/music/songs?type=genre&id=${genre.id}&name=${encodeURIComponent(genre.name)}`);
  };

  return (
    <div className="bg-gray-900 pb-32" style={{ minHeight: "100vh" }}>
      <div className="relative h-48 bg-gradient-to-b from-zinc-800/60 to-transparent overflow-hidden">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-purple-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-4 right-1/3 w-48 h-48 bg-pink-700/15 rounded-full blur-3xl pointer-events-none" />
      </div>
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-10">

        {/* Rankings */}
        <section>
          <SectionHeader
            title={t("home.rankings.title")}
            onViewAll={() => navigate("/app/music/rankings")}
            viewAllLabel={t("home.rankings.viewAll")}
          />
          <ScrollRow>
            <div className="shrink-0 w-72">
              <RankingCard
                title={t("home.rankings.today")}
                description={t("home.rankings.todayDesc")}
                gradientFrom="from-pink-900/40"
                gradientVia="via-red-900/40"
                hoverFrom="from-pink-600/20"
                hoverTo="to-red-700/20"
                songs={rankingsToday}
                tabType="today"
                loading={loading}
              />
            </div>
            <div className="shrink-0 w-72">
              <RankingCard
                title={t("home.rankings.week")}
                description={t("home.rankings.weekDesc")}
                gradientFrom="from-purple-900/40"
                gradientVia="via-violet-900/40"
                hoverFrom="from-purple-600/20"
                hoverTo="to-violet-700/20"
                songs={rankingsWeek}
                tabType="week"
                loading={loading}
              />
            </div>
            <div className="shrink-0 w-72">
              <RankingCard
                title={t("home.rankings.month")}
                description={t("home.rankings.monthDesc")}
                gradientFrom="from-indigo-900/40"
                gradientVia="via-blue-900/40"
                hoverFrom="from-indigo-600/20"
                hoverTo="to-blue-700/20"
                songs={rankingsMonth}
                tabType="month"
                loading={loading}
              />
            </div>
          </ScrollRow>
        </section>

        {/* Genres */}
        {genres.length > 0 && (
          <section>
            <SectionHeader title={t("home.genres.title")} />
            <ScrollRow>
              {genres.map((genre) => (
                <button
                  type="button"
                  key={genre.id}
                  className="shrink-0 w-40 cursor-pointer text-left border-none bg-transparent p-0"
                  onClick={() => handleGenreSelect(genre)}
                >
                  <GenreTag genre={genre} />
                </button>
              ))}
            </ScrollRow>
          </section>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <section>
            <SectionHeader
              title={t("home.albums.title")}
              onViewAll={() => navigate("/app/music/albums")}
              viewAllLabel={t("home.rankings.viewAll")}
            />
            <ScrollRow>
              {albums.map((album) => (
                <div key={album.id} className="shrink-0 w-44">
                  <AlbumCard album={album} />
                </div>
              ))}
            </ScrollRow>
          </section>
        )}

        {/* Artists */}
        {artists.length > 0 && (
          <section>
            <SectionHeader
              title={t("home.artists.title")}
              onViewAll={() => navigate("/app/music/artists")}
              viewAllLabel={t("home.rankings.viewAll")}
            />
            <ScrollRow>
              {artists.map((artist) => (
                <div key={artist.id} className="shrink-0 w-44">
                  <ArtistCard artist={artist} />
                </div>
              ))}
            </ScrollRow>
          </section>
        )}

        {/* Top Songs */}
        {topSongs.length > 0 && (
          <section>
            <SectionHeader title={t("home.topSongs.title")} />
            <ul className="flex flex-col gap-1">
              {topSongs.map((song, index) => (
                <SongListItem
                  key={song.id}
                  song={song}
                  index={index + 1}
                  onPlay={() => handleSongPlay(song)}
                />
              ))}
            </ul>
          </section>
        )}

      </div>
    </div>
  );
}
