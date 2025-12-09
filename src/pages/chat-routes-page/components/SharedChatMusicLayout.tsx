import { Outlet, useLocation } from "react-router-dom";
import ChatNavigation from "./ChatNavigation";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerProvider";
import GlobalAudioPlayer from "./GlobalAudioPlayer";
import DraggableMiniPlayer from "./DraggableMiniPlayer";
import { CallProvider } from "@/components/call/CallProvider";

export default function SharedChatMusicLayout() {
  const location = useLocation();
  const isMusicPage = location.pathname.startsWith("/music");

  return (
    <AudioPlayerProvider>
      <CallProvider>
        <div className="h-screen bg-gray-100 flex overflow-hidden">
          <div className="flex-shrink-0">
            <ChatNavigation />
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
