import type { AlbumResponse } from "@/services/music/albumApi.ts";
import { useNavigate } from "react-router-dom";
import { Disc3, Play, Pause } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAlbumPlayState } from "@/hooks/usePlayState";
import { useAudio } from "@/hooks/useAudio";
import { useAppDispatch } from "@/features/hooks";
import { fetchSongsByAlbum } from "@/features/music/musicSlice";
import type { Song } from "@/types/music/song";
import type { SongResponseWithAllAlbum } from "@/types/music";
import { useState } from "react";

interface AlbumCardProps {
  album: AlbumResponse;
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

export default function AlbumCard({ album }: Readonly<AlbumCardProps>) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("music");
  const { playSong, setPlaylist, togglePlayPause } = useAudio();
  const { isAlbumPlaying, isAlbumCurrent } = useAlbumPlayState(album.id);
  const [isLoadingPlay, setIsLoadingPlay] = useState(false);

  const handleNavigate = () => {
    navigate(
      `/app/music/songs?type=album&id=${album.id}&name=${encodeURIComponent(
        album.title
      )}&imageUrl=${encodeURIComponent(album.coverImgUrl || "")}`
    );
  };

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isAlbumCurrent) {
      togglePlayPause();
      return;
    }

    try {
      setIsLoadingPlay(true);
      const result = await dispatch(fetchSongsByAlbum(album.id)).unwrap();
      const songs: Song[] = (result.songs as SongResponseWithAllAlbum[]).map(convertToSong);
      if (songs.length === 0) return;
      setPlaylist(songs);
      playSong(songs[0], { type: "album", id: album.id });
    } catch (err) {
      console.error("[PingMe] Failed to play album:", err);
    } finally {
      setIsLoadingPlay(false);
    }
  };

  // Play button always visible ONLY when album is actively playing.
  // When paused, it will only show on hover.
  const btnAlwaysVisible = isAlbumPlaying;

  let playIcon;
  if (isLoadingPlay) {
    playIcon = <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />;
  } else if (isAlbumPlaying) {
    playIcon = <Pause className="h-4 w-4 fill-white" />;
  } else {
    playIcon = <Play className="h-4 w-4 fill-white translate-x-px" />;
  }

  return (
    <div className="group relative p-3 rounded-xl transition-all duration-300 hover:bg-zinc-800/50">
      {/* Invisible full-card click area */}
      <button
        type="button"
        aria-label={t("cards.viewAlbum", { title: album.title })}
        onClick={handleNavigate}
        className="absolute inset-0 w-full h-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900 cursor-pointer z-0 border-none bg-transparent"
      />

      <div className="relative z-10 pointer-events-none">
        {/* ── Top: square image area ── */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-800 mb-3 shadow-md">
        {album.coverImgUrl ? (
          <img
            src={album.coverImgUrl || "/placeholder.svg"}
            alt={album.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Disc3 className="h-16 w-16 text-zinc-600" />
          </div>
        )}

        {/* Overlay — appears on hover to darken image */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 rounded-lg" />

        {/* ▶/⏸ Play button — bottom-right of the image */}
        <button
          type="button"
          onClick={handlePlayClick}
          disabled={isLoadingPlay}
          aria-label={
            isAlbumPlaying
              ? t("cards.pause")
              : t("cards.playAlbum", { title: album.title })
          }
          className={[
            "absolute bottom-3 right-3 z-10 pointer-events-auto",
            "flex items-center justify-center w-11 h-11 rounded-full",
            "bg-purple-500 hover:bg-purple-400 text-white",
            "shadow-xl hover:scale-110 active:scale-95",
            "transition-all duration-200",
            // Visibility rule: always show when current, hover-only otherwise
            btnAlwaysVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0",
            isLoadingPlay ? "cursor-wait opacity-70" : "",
          ].join(" ")}
        >
          {playIcon}
        </button>
      </div>

      {/* ── Bottom: text section, outside/below image ── */}
      <div className="px-1 mt-3">
        <h3 className="font-semibold text-sm text-white truncate group-hover:text-purple-300 transition-colors leading-snug">
          {album.title}
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          {t("cards.plays", { playCount: album.playCount?.toLocaleString() })}
        </p>
      </div>
      </div>
    </div>
  );
}
