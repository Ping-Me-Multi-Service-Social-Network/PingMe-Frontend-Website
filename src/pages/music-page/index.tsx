"use client";

import { useState } from "react";
import AudioPlayerComponent from "./components/AudioPlayerComponent";
import MainMusicPage from "./components/MainMusicPage";
import type { Song } from "@/types/music/song";

export default function MusicPage() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);

  const handleSongSelect = (song: Song) => {
    console.log("[v0] Song selected:", song);
    setSelectedSong(song);
    setPlaylist([song]);
  };

  const handlePlaylistReceived = (songs: Song[]) => {
    console.log("[v0] Playlist received:", songs.length, "songs");
    setPlaylist(songs);
  };

  return (
    <div className="h-full bg-gray-100 flex flex-col">
      <MainMusicPage
        onSongSelect={handleSongSelect}
        onPlaylistReady={handlePlaylistReceived}
      />
      <AudioPlayerComponent currentSong={selectedSong} playlist={playlist} />
    </div>
  );
}
