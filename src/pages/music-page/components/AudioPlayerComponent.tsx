import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { useState, useEffect, useRef } from "react";
import type { Song } from "@/types/music/song";

interface AudioPlayerComponentProps {
  currentSong?: Song | null;
  playlist?: Song[];
  onSongChange?: (song: Song) => void;
}

export default function AudioPlayerComponent({
  currentSong,
  playlist = [],
  onSongChange,
}: AudioPlayerComponentProps) {
  const defaultTracks: (Song | null)[] = [
    {
      id: 1,
      title: "Risk",
      duration: 180,
      songUrl:
        "https://my-music-app-media-bucket-2025.s3.ap-southeast-2.amazonaws.com/media/Risk.mp3",
      coverImageUrl: "/abstract-album-cover.png",
      mainArtist: { id: 1, name: "Unknown", imgUrl: "" },
      featuredArtists: [],
      genre: [],
      album: { id: 1, title: "Unknown Album", playCount: 0 },
      playCount: 100,
    },
    {
      id: 2,
      title: "Close To You",
      duration: 200,
      songUrl:
        "https://my-music-app-media-bucket-2025.s3.ap-southeast-2.amazonaws.com/media/Close+To+You.mp3",
      coverImageUrl: "/abstract-album-cover.png",
      mainArtist: { id: 1, name: "Unknown", imgUrl: "" },
      featuredArtists: [],
      genre: [],
      album: { id: 1, title: "Unknown Album", playCount: 0 },
      playCount: 100,
    },
  ];

  const tracks = playlist.length > 0 ? playlist : defaultTracks;
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    if (currentSong) {
      const index = tracks.findIndex((t) => t && t.id === currentSong.id);
      if (index >= 0) {
        setCurrentTrackIndex(index);
        setTimeout(() => {
          audioPlayerRef.current?.audio.current?.play();
        }, 100);
      } else {
        setCurrentTrackIndex(0);
      }
    }
  }, [currentSong]);

  const handleClickNext = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    if (onSongChange && tracks[nextIndex]) {
      onSongChange(tracks[nextIndex]);
    }
  };

  const handleClickPrev = () => {
    const prevIndex =
      currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
    setCurrentTrackIndex(prevIndex);
    if (onSongChange && tracks[prevIndex]) {
      onSongChange(tracks[prevIndex]);
    }
  };

  const track = tracks[currentTrackIndex];
  if (!track) {
    return (
      <div className="w-full p-4 bg-white text-center text-gray-500">
        No song selected
      </div>
    );
  }

  return (
    <div className="w-full bg-white border-t border-gray-200 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-3">
          <img
            src={track.coverImageUrl || "/placeholder.svg"}
            alt={track.title}
            className="w-16 h-16 rounded object-cover"
          />
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{track.title}</h3>
            <p className="text-sm text-gray-600">
              {track.mainArtist?.name || "Unknown Artist"}
            </p>
          </div>
        </div>
        <AudioPlayer
          ref={audioPlayerRef}
          src={track.songUrl}
          showSkipControls={true}
          showJumpControls={false}
          onClickNext={handleClickNext}
          onClickPrevious={handleClickPrev}
          onEnded={handleClickNext}
        />
      </div>
    </div>
  );
}
