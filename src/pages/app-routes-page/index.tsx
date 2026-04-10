import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, lazy, Suspense } from "react";
import AppNavigation from "./components/navigation/AppNavigation.tsx";
import { AudioPlayerProvider } from "@/hooks/useAudio.tsx";
import DraggableMiniPlayer from "./components/audio/DraggableMiniPlayer.tsx";
import { useSocket } from "@/features/websocket";
import AppLoader from "@/components/custom/AppLoader.tsx";
import { useGlobalTour } from "@/hooks/tours";

const MessagesPage = lazy(() => import("@/pages/app-routes-page/chat-page"));
const CallProvider = lazy(() =>
  import("@/features/websocket").then((module) => ({
    default: module.CallProvider,
  }))
);
export default function AppPageLayout() {
  const location = useLocation();

  const isMusicPage = location.pathname.startsWith("/app/music");
  const isChatPage = location.pathname === "/app/chat";
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevIsMusicPage, setPrevIsMusicPage] = useState(isMusicPage);

  if (prevIsMusicPage && !isMusicPage) {
    setPrevIsMusicPage(isMusicPage);
    setIsTransitioning(true);
  } else if (!prevIsMusicPage && isMusicPage) {
    setPrevIsMusicPage(isMusicPage);
  }

  // Handle transition from music to other pages
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  // Handle socket connection and global notifications
  useSocket();

  // Global tour - chạy 1 lần khi đăng nhập lần đầu
  const { startTour: startGlobalTour } = useGlobalTour();
  const globalTourStarted = useRef(false);

  useEffect(() => {
    if (globalTourStarted.current) return;
    globalTourStarted.current = true;

    const timer = setTimeout(() => {
      startGlobalTour();
    }, 800);

    return () => clearTimeout(timer);
  }, [startGlobalTour]);

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
              {/* MessagesPage is always mounted to preserve chat state & socket subscriptions */}
              <div
                className="flex-1 flex flex-col overflow-hidden"
                style={{ display: isChatPage ? "flex" : "none" }}
              >
                <Suspense fallback={<AppLoader />}>
                  <MessagesPage />
                </Suspense>
              </div>

              {/* Other pages via router Outlet (hidden when on chat page) */}
              {!isChatPage && <Outlet />}
            </div>

            {!isMusicPage && <DraggableMiniPlayer />}
          </div>
        </CallProvider>
      </Suspense>
    </AudioPlayerProvider>
  );
}
