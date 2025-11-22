import AudioPlayerComponent from "./components/AudioPlayerComponent";
import MainMusicPage from "./components/MainMusicPage";

export default function MusicPage() {
  return (
    <div className="h-full bg-gray-100">
      <MainMusicPage></MainMusicPage>
      <div className="">
        <AudioPlayerComponent />
      </div>
    </div>
  );
}
