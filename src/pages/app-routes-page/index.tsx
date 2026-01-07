import { Outlet, useLocation } from "react-router-dom";
import AppNavigation from "./components/navigation/AppNavigation.tsx";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerProvider.tsx";
import GlobalAudioPlayer from "./components/audio/GlobalAudioPlayer.tsx";
import DraggableMiniPlayer from "./components/audio/DraggableMiniPlayer.tsx";
import { CallProvider } from "@/pages/app-routes-page/chat-page/components/call/CallProvider.tsx";

export default function AppPageLayout() {
  const location = useLocation();
  const isMusicPage = location.pathname.startsWith("/app/music");

  return (
    <AudioPlayerProvider>
      <CallProvider>
        <div className="h-screen bg-gray-100 flex overflow-hidden">
          <div className="flex-shrink-0">
            <AppNavigation />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <Outlet />
          </div>

          {isMusicPage && <GlobalAudioPlayer />}

          {!isMusicPage && <DraggableMiniPlayer />}
        </div>
      </CallProvider>
    </AudioPlayerProvider>
  );
}
