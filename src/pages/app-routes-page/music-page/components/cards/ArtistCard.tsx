import { useNavigate } from "react-router-dom";
import type { SongResponseWithAllAlbum, ArtistResponse } from "@/types/music";
import type { Song } from "@/types/music/song";
import { User2, Play, Pause } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useArtistPlayState } from "@/hooks/usePlayState";
import { useAudio } from "@/hooks/useAudio";
import { useAppDispatch } from "@/features/hooks";
import { fetchSongsByArtist } from "@/features/music/musicSlice";

interface ArtistCardProps {
  artist: ArtistResponse;
}

const convertToSong = (song: SongResponseWithAllAlbum): Song => ({
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
});

export default function ArtistCard({ artist }: Readonly<ArtistCardProps>) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("music");
  const { playSong, setPlaylist, togglePlayPause } = useAudio();
  const { isArtistPlaying, isArtistCurrent } = useArtistPlayState(artist.id);
  const [isLoadingPlay, setIsLoadingPlay] = useState(false);

  const handleNavigate = () => {
    navigate(
      `/app/music/songs?type=artist&id=${artist.id}&name=${encodeURIComponent(
        artist.name
      )}&imageUrl=${encodeURIComponent(artist.imgUrl || "")}`
    );
  };

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isArtistCurrent) {
      togglePlayPause();
      return;
    }

    try {
      setIsLoadingPlay(true);
      const result = await dispatch(fetchSongsByArtist(artist.id)).unwrap();
      const songs: Song[] = (result.songs as SongResponseWithAllAlbum[]).map(convertToSong);
      if (songs.length === 0) return;
      setPlaylist(songs);
      playSong(songs[0], { type: "artist", id: artist.id });
    } catch (err) {
      console.error("[PingMe] Failed to play artist:", err);
    } finally {
      setIsLoadingPlay(false);
    }
  };

  // Play button always visible ONLY when artist is actively playing.
  // When paused, it will only show on hover.
  const btnAlwaysVisible = isArtistPlaying;

  let playIcon;
  if (isLoadingPlay) {
    playIcon = <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />;
  } else if (isArtistPlaying) {
    playIcon = <Pause className="h-4 w-4 fill-white" />;
  } else {
    playIcon = <Play className="h-4 w-4 fill-white translate-x-px" />;
  }

  return (
    <div
      className={`group relative p-3 rounded-xl transition-all duration-300 ${
        isArtistCurrent 
          ? "bg-zinc-800 ring-1 ring-purple-500/50 shadow-lg shadow-purple-900/20" 
          : "hover:bg-zinc-800/50"
      }`}
    >
      {/* Invisible full-card click area */}
      <button
        type="button"
        aria-label={artist.name}
        onClick={handleNavigate}
        className="absolute inset-0 w-full h-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900 cursor-pointer z-0 border-none bg-transparent"
      />

      <div className="relative z-10 pointer-events-none">
        {/* ── Top: circular image area ── */}
        {/* Outer relative wrapper: positions overlay + button, NO overflow-hidden so button is not clipped */}
        <div className="relative aspect-square mb-3">
        {/* Inner circle: overflow-hidden clips image to circle */}
        <div className="w-full h-full overflow-hidden rounded-full bg-zinc-800 shadow-md">
          {artist.imgUrl ? (
            <img
              src={artist.imgUrl || "/placeholder.svg"}
              alt={artist.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User2 className="h-16 w-16 text-zinc-600" />
            </div>
          )}
        </div>

        {/* Overlay — darkens on hover, clipped to circle shape */}
        <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors duration-300 pointer-events-none" />

        {/* ▶/⏸ Play button — bottom-right, positioned in outer div so NOT clipped */}
        <button
          type="button"
          onClick={handlePlayClick}
          disabled={isLoadingPlay}
          aria-label={
            isArtistPlaying
              ? t("cards.pause")
              : t("cards.playArtist", { name: artist.name })
          }
          className={[
            "absolute bottom-1 right-1 z-10 pointer-events-auto",
            "flex items-center justify-center w-11 h-11 rounded-full",
            "bg-purple-500 hover:bg-purple-400 text-white",
            "shadow-xl hover:scale-110 active:scale-95",
            "transition-all duration-200",
            btnAlwaysVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0",
            isLoadingPlay ? "cursor-wait opacity-70" : "",
          ].join(" ")}
        >
          {playIcon}
        </button>
      </div>

      {/* ── Bottom: text section, below the circle ── */}
      <div className="px-1 text-center">
        <h3 className="font-semibold text-sm text-white truncate group-hover:text-purple-300 transition-colors leading-snug">
          {artist.name}
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          {t("cards.artist")}
        </p>
      </div>
      </div>
    </div>
  );
}
