import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  searchService,
  albumService,
  artistService,
} from "@/services/music/musicService";
import type {
  SongResponseWithAllAlbum,
  AlbumResponse,
  ArtistResponse,
} from "@/types/music";
import SongListItem from "./SongListItem";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import Pagination from "@/components/custom/Pagination";
import { useAudioPlayer } from "@/contexts/useAudioPlayer";
import type { Song } from "@/types/music/song";
import { ArrowLeft, Disc3, User2, Play, Music } from "lucide-react";

export default function SongListPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { playSong, setPlaylist } = useAudioPlayer();

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
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      if (!type || !id) {
        setError("Invalid parameters");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let songsData: SongResponseWithAllAlbum[] = [];

        if (type === "album") {
          const [albumData, albumInfo] = await Promise.all([
            searchService.getSongsByAlbum(Number(id)),
            albumService.getById(Number(id)),
          ]);
          songsData = albumData;
          setAlbumDetails(albumInfo);
        } else if (type === "artist") {
          const [artistData, artistInfo] = await Promise.all([
            searchService.getSongsByArtist(Number(id)),
            artistService.getById(Number(id)),
          ]);
          songsData = artistData;
          setArtistDetails(artistInfo);
        } else if (type === "genre") {
          songsData = await searchService.getSongsByGenre(Number(id));
        }

        setSongs(songsData);

        // Convert to Song format for playlist
        const playlist: Song[] = songsData.map((song) => ({
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
        setPlaylist(playlist);

        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id, setPlaylist]);

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

  const handleSongPlay = (song: Song) => {
    playSong(song);
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/music")}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
          >
            Back to Music
          </button>
        </div>
      </div>
    );
  }

  const displayImage =
    type === "album"
      ? albumDetails?.coverImgUrl
      : type === "artist"
      ? artistDetails?.imgUrl
      : imageUrl;
  const displayName =
    type === "album"
      ? albumDetails?.title
      : type === "artist"
      ? artistDetails?.name
      : name;
  const displayInfo = type === "artist" ? artistDetails?.bio : null;
  const playCount = type === "album" ? albumDetails?.playCount : null;

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 pb-32">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate("/music")}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Music
          </button>

          <div className="flex items-start gap-6">
            {/* Cover Image */}
            {displayImage ? (
              <img
                src={displayImage || "/placeholder.svg"}
                alt={displayName || ""}
                className={`w-48 h-48 ${
                  type === "artist" ? "rounded-full" : "rounded-lg"
                } object-cover shadow-2xl`}
              />
            ) : (
              <div
                className={`w-48 h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 ${
                  type === "artist" ? "rounded-full" : "rounded-lg"
                } flex items-center justify-center shadow-2xl`}
              >
                {type === "album" ? (
                  <Disc3 className="w-20 h-20 text-zinc-600" />
                ) : type === "artist" ? (
                  <User2 className="w-20 h-20 text-zinc-600" />
                ) : (
                  <Music className="w-20 h-20 text-zinc-600" />
                )}
              </div>
            )}

            {/* Info Section */}
            <div className="flex-1">
              <p className="text-sm text-zinc-400 uppercase tracking-wide font-medium mb-2">
                {type === "album"
                  ? "Album"
                  : type === "artist"
                  ? "Artist"
                  : "Genre"}
              </p>
              <h1 className="text-5xl font-bold text-white mb-4 text-balance">
                {displayName || "Unknown"}
              </h1>

              {/* Artist Bio */}
              {type === "artist" && displayInfo && (
                <p className="text-zinc-300 text-base leading-relaxed mb-4 max-w-3xl">
                  {displayInfo}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-zinc-400 mb-6">
                <span>
                  {songs.length} {songs.length === 1 ? "song" : "songs"}
                </span>
                {playCount !== null && playCount !== undefined && (
                  <>
                    <span>•</span>
                    <span>{playCount.toLocaleString()} plays</span>
                  </>
                )}
              </div>

              {/* Play All Button */}
              {songs.length > 0 && (
                <button
                  onClick={handlePlayAll}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:scale-105 transition-transform"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Play All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Songs List */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Songs</h2>
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
                <div className="bg-zinc-800/50 rounded-lg p-4 [&_.flex]:!bg-zinc-800/50 [&_.flex]:border-zinc-700 [&_button]:!bg-zinc-700 [&_button]:!text-zinc-200 [&_button]:!border-zinc-600 [&_button:hover]:!bg-zinc-600 [&_button.bg-purple-600]:!bg-zinc-300 [&_button.bg-purple-600]:!text-zinc-900 [&_button.bg-purple-600:hover]:!bg-white [&_span]:!text-zinc-300 [&_select]:!bg-zinc-700 [&_select]:!text-zinc-200 [&_select]:!border-zinc-600">
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
              <p className="text-zinc-400">No songs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
