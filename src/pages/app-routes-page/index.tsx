import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, lazy, Suspense } from "react";
import AppNavigation from "./components/navigation/AppNavigation.tsx";
import { AudioPlayerProvider } from "@/hooks/useAudio.tsx";
import GlobalAudioPlayer from "./components/audio/GlobalAudioPlayer.tsx";
import DraggableMiniPlayer from "./components/audio/DraggableMiniPlayer.tsx";
const CallProvider = lazy(() =>
  import("@/features/websocket/hooks/useCall").then((module) => ({
    default: module.CallProvider,
  }))
);
import { useSocket } from "@/features/websocket/useSocket";
import AppLoader from "@/components/custom/AppLoader.tsx";



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

  // Handle socket connection and global notifications
  useSocket();

  return (
    <AudioPlayerProvider>
      <Suspense fallback={<AppLoader />}>
        <CallProvider>
          <div
            className={`h-screen bg-gray-100 flex overflow-hidden ${!isMusicPage && isTransitioning ? "light-module-enter" : ""
              }`}
            style={{
              transition: "background-color 0.6s ease-in-out",
            }}
          >
            <div className="shrink-0">
              <AppNavigation />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
              <Outlet />
            </div>

            {isMusicPage && <GlobalAudioPlayer />}

            {!isMusicPage && <DraggableMiniPlayer />}
          </div>
        </CallProvider>
      </Suspense>
    </AudioPlayerProvider>
  );
}
