import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import AppNavigation from "./components/navigation/AppNavigation.tsx";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerProvider.tsx";
import GlobalAudioPlayer from "./components/audio/GlobalAudioPlayer.tsx";
import DraggableMiniPlayer from "./components/audio/DraggableMiniPlayer.tsx";
import { CallProvider } from "@/pages/app-routes-page/chat-page/components/call/CallProvider.tsx";

export default function AppPageLayout() {
  const location = useLocation();
  const isMusicPage = location.pathname.startsWith("/app/music");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousIsMusicPage = useRef(isMusicPage);

  // Handle transition from music to other pages
  useEffect(() => {
    // Check if we're leaving music page
    if (previousIsMusicPage.current && !isMusicPage) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 600);
      return () => clearTimeout(timer);
    }
    previousIsMusicPage.current = isMusicPage;
  }, [isMusicPage]);

  return (
    <AudioPlayerProvider>
      <CallProvider>
        <div
          className={`h-screen bg-gray-100 flex overflow-hidden ${!isMusicPage && isTransitioning ? 'light-module-enter' : ''}`}
          style={{
            transition: 'background-color 0.6s ease-in-out'
          }}
        >
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
