import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import AppNavigation from "./components/navigation/AppNavigation.tsx";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerProvider.tsx";
import GlobalAudioPlayer from "./components/audio/GlobalAudioPlayer.tsx";
import DraggableMiniPlayer from "./components/audio/DraggableMiniPlayer.tsx";
import { CallProvider } from "@/pages/app-routes-page/chat-page/components/call/CallProvider.tsx";
import { SocketManager } from "@/services/ws/socketManager";
import { useAppSelector } from "@/features/hooks";
import type {
  FriendshipEventPayload,
  UserStatusPayload,
  SignalingPayload,
} from "@/services/ws/module/globalSocket";
import type {
  MessageCreatedEventPayload,
  MessageRecalledEventPayload,
  ReadStateChangedEvent,
  RoomCreatedEventPayload,
  RoomUpdatedEventPayload,
  RoomMemberAddedEventPayload,
  RoomMemberRemovedEventPayload,
  RoomMemberRoleChangedEventPayload,
} from "@/services/ws/module/chatSocket";

export default function AppPageLayout() {
  const location = useLocation();
  const { userSession } = useAppSelector((state) => state.auth);
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

  useEffect(() => {
    if (!userSession) return;

    console.log("[PingMe AppPageLayout] Connecting SocketManager...");

    SocketManager.connect({
      baseUrl: import.meta.env.VITE_BACKEND_BASE_URL,

      // Chat handlers - will be used by ChatPage
      chat: {
        onMessageCreated: (ev: MessageCreatedEventPayload) => {
          // Dispatch custom event for ChatPage to listen
          window.dispatchEvent(
            new CustomEvent("socket:message-created", { detail: ev })
          );
        },
        onMessageRecalled: (ev: MessageRecalledEventPayload) => {
          window.dispatchEvent(
            new CustomEvent("socket:message-recalled", { detail: ev })
          );
        },
        onRoomCreated: (ev: RoomCreatedEventPayload) => {
          window.dispatchEvent(
            new CustomEvent("socket:room-created", { detail: ev })
          );
        },
        onRoomUpdated: (ev: RoomUpdatedEventPayload) => {
          window.dispatchEvent(
            new CustomEvent("socket:room-updated", { detail: ev })
          );
        },
        onMemberAdded: (ev: RoomMemberAddedEventPayload) => {
          window.dispatchEvent(
            new CustomEvent("socket:member-added", { detail: ev })
          );
        },
        onMemberRemoved: (ev: RoomMemberRemovedEventPayload) => {
          window.dispatchEvent(
            new CustomEvent("socket:member-removed", { detail: ev })
          );
        },
        onMemberRoleChanged: (ev: RoomMemberRoleChangedEventPayload) => {
          window.dispatchEvent(
            new CustomEvent("socket:member-role-changed", { detail: ev })
          );
        },
        onReadStateChanged: (ev: ReadStateChangedEvent) => {
          window.dispatchEvent(
            new CustomEvent("socket:read-state-changed", { detail: ev })
          );
        },
      },

      // Global handlers - will be used by ContactPage and CallProvider
      onFriendEvent: (ev: FriendshipEventPayload) => {
        window.dispatchEvent(
          new CustomEvent("socket:friend-event", { detail: ev })
        );
      },
      onUserStatus: (ev: UserStatusPayload) => {
        window.dispatchEvent(
          new CustomEvent("socket:user-status", { detail: ev })
        );
      },
      onSignaling: (ev: SignalingPayload) => {
        window.dispatchEvent(
          new CustomEvent("socket:signaling", { detail: ev })
        );
      },

      onDisconnect: (reason?: string) => {
        console.warn(
          "[PingMe AppPageLayout] SocketManager disconnected:",
          reason
        );
      },
    });

    return () => {
      console.log("[PingMe AppPageLayout] Disconnecting SocketManager...");
      SocketManager.disconnect();
    };
  }, [userSession]);

  return (
    <AudioPlayerProvider>
      <CallProvider>
        <div
          className={`h-screen bg-gray-100 flex overflow-hidden ${
            !isMusicPage && isTransitioning ? "light-module-enter" : ""
          }`}
          style={{
            transition: "background-color 0.6s ease-in-out",
          }}
        >
          <div className="flex-shrink-0 lg:block">
            <AppNavigation />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
            <Outlet />
          </div>

          {isMusicPage && <GlobalAudioPlayer />}

          {!isMusicPage && <DraggableMiniPlayer />}
        </div>
      </CallProvider>
    </AudioPlayerProvider>
  );
}
