import { useEffect, useState } from "react";
import { searchService } from "@/services/music/musicService";
import type {
  SongResponseWithAllAlbum,
  AlbumResponse,
  ArtistResponse,
} from "@/types/music";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import { Music2, Disc3, User2 } from "lucide-react";

interface SearchDropdownProps {
  query: string;
  isOpen: boolean;
  onSongSelect?: (song: SongResponseWithAllAlbum) => void;
  onAlbumSelect?: (album: AlbumResponse) => void;
  onArtistSelect?: (artist: ArtistResponse) => void;
  onViewMoreSongs?: () => void;
  onViewMoreAlbums?: () => void;
  onViewMoreArtists?: () => void;
}

export default function SearchDropdown({
  query,
  isOpen,
  onSongSelect,
  onAlbumSelect,
  onArtistSelect,
  onViewMoreSongs,
  onViewMoreAlbums,
  onViewMoreArtists,
}: SearchDropdownProps) {
  const [songs, setSongs] = useState<SongResponseWithAllAlbum[]>([]);
  const [albums, setAlbums] = useState<AlbumResponse[]>([]);
  const [artists, setArtists] = useState<ArtistResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim() || !isOpen) {
      setSongs([]);
      setAlbums([]);
      setArtists([]);
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const [songsData, albumsData, artistsData] = await Promise.all([
          searchService.searchSongs(query),
          searchService.searchAlbums(query),
          searchService.searchArtists(query),
        ]);

        setSongs(songsData);
        setAlbums(albumsData);
        setArtists(artistsData);
      } catch (error) {
        console.error("Error searching:", error);
        setSongs([]);
        setAlbums([]);
        setArtists([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, isOpen]);

  if (!isOpen || !query.trim()) {
    return null;
  }

  const hasResults =
    songs.length > 0 || albums.length > 0 || artists.length > 0;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      ) : !hasResults ? (
        <div className="p-6 text-center text-zinc-400">
          <p>No results found for "{query}"</p>
        </div>
      ) : (
        <div className="space-y-6 p-4">
          {/* Songs Section */}
          {songs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-300 px-2">
                Songs
              </h3>
              <div className="space-y-2">
                {songs.slice(0, 3).map((song) => (
                  <div
                    key={song.id}
                    onClick={() => onSongSelect?.(song)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-zinc-800 rounded p-2 transition"
                  >
                    <div className="relative w-10 h-10 flex-shrink-0">
                      {song.coverImageUrl ? (
                        <img
                          src={song.coverImageUrl || "/placeholder.svg"}
                          alt={song.title}
                          className="w-full h-full rounded object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded bg-zinc-800 flex items-center justify-center">
                          <Music2 className="h-4 w-4 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {song.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {song.mainArtist?.name || "Unknown Artist"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {songs.length > 3 && (
                <button
                  onClick={onViewMoreSongs}
                  className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 font-medium"
                >
                  View all {songs.length} songs
                </button>
              )}
            </div>
          )}

          {/* Albums Section */}
          {albums.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-300 px-2">
                Albums
              </h3>
              <div className="space-y-2">
                {albums.slice(0, 3).map((album) => (
                  <div
                    key={album.id}
                    onClick={() => onAlbumSelect?.(album)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-zinc-800 rounded p-2 transition"
                  >
                    <div className="relative w-10 h-10 flex-shrink-0">
                      {album.coverImgUrl ? (
                        <img
                          src={album.coverImgUrl || "/placeholder.svg"}
                          alt={album.title}
                          className="w-full h-full rounded object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded bg-zinc-800 flex items-center justify-center">
                          <Disc3 className="h-4 w-4 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {album.title}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {album.playCount?.toLocaleString()} plays
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {albums.length > 3 && (
                <button
                  onClick={onViewMoreAlbums}
                  className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 font-medium"
                >
                  View all {albums.length} albums
                </button>
              )}
            </div>
          )}

          {/* Artists Section */}
          {artists.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-300 px-2">
                Artists
              </h3>
              <div className="space-y-2">
                {artists.slice(0, 3).map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => onArtistSelect?.(artist)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-zinc-800 rounded p-2 transition"
                  >
                    <div className="relative w-10 h-10 flex-shrink-0">
                      {artist.imgUrl ? (
                        <img
                          src={artist.imgUrl || "/placeholder.svg"}
                          alt={artist.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center">
                          <User2 className="h-4 w-4 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {artist.name}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {artist.bio || "No bio"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {artists.length > 3 && (
                <button
                  onClick={onViewMoreArtists}
                  className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 font-medium"
                >
                  View all {artists.length} artists
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
