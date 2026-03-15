import { useState, useEffect, useRef } from "react";
import { ChatActionBar } from "../components/chat-shared-components/ChatActionBar.tsx";
import { FriendsListComponent } from "./components/FriendsListComponent.tsx";
import { SentInvitationsComponent } from "./components/SentInvitationsComponent.tsx";
import { ReceivedInvitationsComponent } from "./components/ReceivedInvitationsComponent.tsx";
import { ContactSidebar } from "./components/ContactSidebar";
import { useFriendshipSocketHandler } from "@/features/websocket/hooks/useFriendshipSocketHandler";
import type { UserSummaryResponse } from "@/types/common/userSummary";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import type { UserFriendshipStatsResponse } from "@/types/friendship";
import { getUserFriendshipStatsApi } from "@/services/friendship";
import { useAppSelector } from "@/features/hooks.ts";
import { SocketManager } from "@/features/websocket/socketManager";
import type { UserStatusPayload } from "@/features/websocket/module/globalSocket";



export default function ContactsPage() {
  const { userSession } = useAppSelector((state) => state.auth);

  const [userFriendshipStats, setUserFriendshipStats] =
    useState<UserFriendshipStatsResponse>({
      totalFriends: 0,
      totalSentInvites: 0,
      totalReceivedInvites: 0,
    } as UserFriendshipStatsResponse);


  const [activeTab, setActiveTab] = useState("friends");

  const friendsRef = useRef<{
    handleNewFriend: (user: UserSummaryResponse) => void;
    removeFriend: (user: UserSummaryResponse) => void;
  }>(null);

  const receivedRef = useRef<{
    handleNewInvitation: (user: UserSummaryResponse) => void;
    removeInvitation: (user: UserSummaryResponse) => void;
  }>(null);

  const sentRef = useRef<{
    handleInvitationUpdate: (user: UserSummaryResponse) => void;
    newInvitation: (user: UserSummaryResponse) => void;
  }>(null);

  const [statusPayload, setStatusPayload] = useState<UserStatusPayload | null>(null);

  useEffect(() => {
    return SocketManager.on("USER_STATUS", setStatusPayload);
  }, []);

  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getUserFriendshipStatsApi();
        setUserFriendshipStats(res.data.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    };

    fetchStats();
  }, []);

  useFriendshipSocketHandler({
    userSessionId: userSession?.id,
    activeTabRef,
    sentRef,
    receivedRef,
    friendsRef,
    setUserFriendshipStats,
  });



  const renderActiveComponent = () => {
    switch (activeTab) {
      case "friends":
        return (
          <FriendsListComponent
            ref={friendsRef}
            onStatsUpdate={setUserFriendshipStats}
            statusPayload={statusPayload}
          />
        );
      case "received-invitations":
        return (
          <ReceivedInvitationsComponent
            ref={receivedRef}
            onStatsUpdate={setUserFriendshipStats}
          />
        );
      case "sent-invitations":
        return (
          <SentInvitationsComponent
            ref={sentRef}
            onStatsUpdate={setUserFriendshipStats}
          />
        );
      default:
        return (
          <FriendsListComponent
            ref={friendsRef}
            onStatsUpdate={setUserFriendshipStats}
            statusPayload={statusPayload}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <ChatActionBar />

        <ContactSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={userFriendshipStats}
        />
      </div>

      <div className="flex-1 bg-white">{renderActiveComponent()}</div>
    </div>
  );
}
