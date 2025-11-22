import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { useState } from "react";

export default function AudioPlayerComponent() {
  const tracks = [
    {
      src: "https://my-music-app-media-bucket-2025.s3.ap-southeast-2.amazonaws.com/media/Risk.mp3",
      title: "Risk",
    },
    {
      src: "https://my-music-app-media-bucket-2025.s3.ap-southeast-2.amazonaws.com/media/Close+To+You.mp3",
      title: "Close To You",
    },
  ];

  const [currentTrack, setCurrentTrack] = useState(0);

  const handleClickNext = () => {
    setCurrentTrack((currentTrack) =>
      currentTrack < tracks.length - 1 ? currentTrack + 1 : 0
    );
  };

  const handleClickPrev = () => {
    setCurrentTrack((currentTrack) =>
      currentTrack > 0 ? currentTrack - 1 : tracks.length - 1
    );
  };

  return (
    <div className="w-full">
      <h3 className="text-center mb-2 font-bold">
        {tracks[currentTrack].title}
      </h3>
      <AudioPlayer
        src={tracks[currentTrack].src}
        showSkipControls={true}
        showJumpControls={false}
        onClickNext={handleClickNext}
        onClickPrevious={handleClickPrev}
        onEnded={handleClickNext}
      />
    </div>
  );
}
