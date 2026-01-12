import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  albumService,
  artistService,
} from "@/services/music/musicService.ts";
import type {
  SongResponseWithAllAlbum,
  AlbumResponse,
  ArtistResponse,
} from "@/types/music";
import SongListItem from "./SongListItem.tsx";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import Pagination from "@/components/custom/Pagination.tsx";
import { useAudioPlayer } from "@/contexts/useAudioPlayer.tsx";
import type { Song } from "@/types/music/song";
import { ArrowLeft, Disc3, User2, Play, Music } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/features/hooks";
import { fetchSongsByGenre, fetchSongsByAlbum, fetchSongsByArtist } from "@/features/slices/musicSlice";
import { getCachedData } from "@/utils/musicCacheUtils";
import { DEFAULT_ITEMS_PER_PAGE } from "@/constants/musicConstants";

export default function SongListPage() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { playSong, setPlaylist } = useAudioPlayer();
  const { songsByGenre, songsByAlbum, songsByArtist, cacheExpiry } = useAppSelector(state => state.music);

  const type = searchParams.get("type"); // "album", "artist", or "genre"
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const imageUrl = searchParams.get("imageUrl");

  const [songs, setSongs] = useState<SongResponseWithAllAlbum[]>([]);
  const [albumDetails, setAlbumDetails] = useState<AlbumResponse | null>(null);
  const [artistDetails, setArtistDetails] = useState<ArtistResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  const fetchWithCache = async <T,>(
    id: number,
    cache: Record<number, { data: SongResponseWithAllAlbum[]; lastFetched: number | null }> | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchAction: any,
    additionalFetch?: () => Promise<T>,
    setAdditional?: (data: T) => void
  ): Promise<SongResponseWithAllAlbum[]> => {
    // Check cache first
    const cachedData = getCachedData(cache?.[id], cacheExpiry);

    if (cachedData) {
      // Cache hit: fetch additional data if needed
      if (additionalFetch && setAdditional) {
        const additionalData = await additionalFetch();
        setAdditional(additionalData);
      }
      return cachedData;
    }

    // Cache miss: fetch both in parallel if additional fetch exists
    if (additionalFetch && setAdditional) {
      const [result, additionalData] = await Promise.all([
        dispatch(fetchAction(id)).unwrap(),
        additionalFetch()
      ]);
      setAdditional(additionalData);
      return result.songs;
    }

    // Only fetch songs
    const result = await dispatch(fetchAction(id)).unwrap();
    return result.songs;
  };

  const convertToPlaylist = (songsData: SongResponseWithAllAlbum[]): Song[] => {
    return songsData.map((song) => ({
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
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!type || !id) {
        setError("Invalid parameters");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const numId = Number(id);
        let songsData: SongResponseWithAllAlbum[] = [];

        if (type === "album") {
          songsData = await fetchWithCache(
            numId,
            songsByAlbum,
            fetchSongsByAlbum,
            () => albumService.getById(numId),
            setAlbumDetails
          );
        } else if (type === "artist") {
          songsData = await fetchWithCache(
            numId,
            songsByArtist,
            fetchSongsByArtist,
            () => artistService.getById(numId),
            setArtistDetails
          );
        } else if (type === "genre") {
          songsData = await fetchWithCache(numId, songsByGenre, fetchSongsByGenre);
        }

        setSongs(songsData);
        setPlaylist(convertToPlaylist(songsData));
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id]);

  const convertToSong = (song: SongResponseWithAllAlbum): Song => {
    return {
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
  };

  const handleSongPlay = (song: Song | SongResponseWithAllAlbum) => {
    const songToPlay: Song = "otherArtists" in song ? {
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
    } : song;
    playSong(songToPlay);
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      const firstSong = convertToSong(songs[0]);
      playSong(firstSong);
    }
  };

  const totalPages = Math.ceil(songs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSongs = songs.slice(startIndex, endIndex);

  const getDisplayImage = () => {
    if (type === "album") return albumDetails?.coverImgUrl;
    if (type === "artist") return artistDetails?.imgUrl;
    return imageUrl;
  };

  const getDisplayName = () => {
    if (type === "album") return albumDetails?.title;
    if (type === "artist") return artistDetails?.name;
    return name;
  };

  const displayImage = getDisplayImage();
  const displayName = getDisplayName();
  const displayInfo = type === "artist" ? artistDetails?.bio : null;
  const playCount = type === "album" ? albumDetails?.playCount : null;

  const renderCoverImage = () => {
    if (displayImage) {
      return (
        <img
          src={displayImage || "/placeholder.svg"}
          alt={displayName || ""}
          className={`w-48 h-48 ${type === "artist" ? "rounded-full" : "rounded-lg"} object-cover shadow-2xl`}
        />
      );
    }

    const iconClass = "w-20 h-20 text-zinc-600";
    const containerClass = `w-48 h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 ${type === "artist" ? "rounded-full" : "rounded-lg"} flex items-center justify-center shadow-2xl`;

    return (
      <div className={containerClass}>
        {type === "album" ? (
          <Disc3 className={iconClass} />
        ) : type === "artist" ? (
          <User2 className={iconClass} />
        ) : (
          <Music className={iconClass} />
        )}
      </div>
    );
  };

  const renderInfoSection = () => {
    let typeLabel = "Thể Loại";
    if (type === "album") {
      typeLabel = "Album";
    } else if (type === "artist") {
      typeLabel = "Nghệ Sĩ";
    }

    return (
      <div className="flex-1">
        <p className="text-sm text-zinc-400 uppercase tracking-wide font-medium mb-2">
          {typeLabel}
        </p>
        <h1 className="text-5xl font-bold text-white mb-4 text-balance">
          {displayName || "Không rõ"}
        </h1>

        {type === "artist" && displayInfo && (
          <p className="text-zinc-300 text-base leading-relaxed mb-4 max-w-3xl">
            {displayInfo}
          </p>
        )}

        <div className="flex items-center gap-6 text-sm text-zinc-400 mb-6">
          <span>{songs.length} bài hát</span>
          {playCount !== null && playCount !== undefined && (
            <>
              <span>•</span>
              <span>{playCount.toLocaleString()} lượt nghe</span>
            </>
          )}
        </div>

        {songs.length > 0 && (
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-full hover:scale-105 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            Phát Tất Cả
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 min-h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 min-h-full">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/app/music")}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
          >
            Quay Lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 pb-32" style={{ minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate("/app/music")}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay Lại
          </button>

          <div className="flex items-start gap-6">
            {renderCoverImage()}
            {renderInfoSection()}
          </div>
        </div>

        {/* Songs List */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Bài Hát</h2>
          {songs.length > 0 ? (
            <>
              <div className="space-y-2 mb-4">
                {paginatedSongs.map((song, index) => (
                  <SongListItem
                    key={song.id}
                    song={convertToSong(song)}
                    onPlay={handleSongPlay}
                    index={startIndex + index + 1}
                  />
                ))}
              </div>

              {songs.length > itemsPerPage && (
                <div className="bg-zinc-800/50 rounded-lg p-4 [&_.flex]:!bg-zinc-800/50 [&_.flex]:border-zinc-700 [&_button]:!bg-zinc-700 [&_button]:!text-zinc-200 [&_button]:!border-zinc-600 [&_button:hover]:!bg-zinc-600 [&_button.bg-purple-600]:!bg-purple-600 [&_button.bg-purple-600]:!text-white [&_button.bg-purple-600:hover]:!bg-purple-500 [&_span]:!text-zinc-300 [&_select]:!bg-zinc-700 [&_select]:!text-zinc-200 [&_select]:!border-zinc-600">
                  <Pagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                    totalElements={songs.length}
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    showItemsPerPageSelect={true}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-400">Không tìm thấy bài hát nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
