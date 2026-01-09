import { useState, useEffect, useRef } from "react";
import { Users, Send, Inbox } from "lucide-react";
import { ChatActionBar } from "../components/chat-shared-components/ChatActionBar.tsx";
import { FriendsListComponent } from "./components/FriendsListComponent.tsx";
import { SentInvitationsComponent } from "./components/SentInvitationsComponent.tsx";
import { ReceivedInvitationsComponent } from "./components/ReceivedInvitationsComponent.tsx";
import type { FriendshipEventPayload } from "@/services/ws/module/globalSocket";
import type { UserSummaryResponse } from "@/types/common/userSummary";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import type { UserFriendshipStatsResponse } from "@/types/friendship";
import { getUserFriendshipStatsApi } from "@/services/friendship";
import { useAppSelector } from "@/features/hooks.ts";
import type { UserStatusPayload } from "@/types/common/userStatus.ts";

const tabs = [
  {
    id: "friends",
    title: "Bạn bè",
    icon: Users,
    description: "Danh sách bạn bè đã kết nối",
  },
  {
    id: "received-invitations",
    title: "Lời mời nhận",
    icon: Inbox,
    description: "Lời mời kết bạn từ người khác",
  },
  {
    id: "sent-invitations",
    title: "Lời mời gửi",
    icon: Send,
    description: "Lời mời bạn đã gửi đi",
  },
];

export default function ContactsPage() {
  const { userSession } = useAppSelector((state) => state.auth);

  const [userFriendshipStats, setUserFriendshipStats] =
    useState<UserFriendshipStatsResponse>({
      totalFriends: 0,
      totalSentInvites: 0,
      totalReceivedInvites: 0,
    } as UserFriendshipStatsResponse);

  const [statusPayload, setStatusPayload] = useState<UserStatusPayload | null>(
    null
  );

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

  useEffect(() => {
    const handleFriendEvent = (e: Event) => {
      const event = (e as CustomEvent).detail as FriendshipEventPayload;
      try {
        switch (event.type) {
          case "INVITED":
            if (userSession?.id === event.userSummaryResponse.id) {
              setUserFriendshipStats((prev) => ({
                ...prev,
                totalSentInvites: prev.totalSentInvites + 1,
              }));

              if (activeTab === "sent-invitations") {
                sentRef.current?.newInvitation(event.userSummaryResponse);
              }
            } else {
              setUserFriendshipStats((prev) => ({
                ...prev,
                totalReceivedInvites: prev.totalReceivedInvites + 1,
              }));
              if (activeTab === "received-invitations") {
                receivedRef.current?.handleNewInvitation(
                  event.userSummaryResponse
                );
              }
            }
            break;

          case "ACCEPTED":
            setUserFriendshipStats((prev) => ({
              ...prev,
              totalFriends: prev.totalFriends + 1,
              totalSentInvites: Math.max(0, prev.totalSentInvites - 1),
            }));
            if (activeTab === "friends") {
              friendsRef.current?.handleNewFriend(event.userSummaryResponse);
            }
            if (activeTab === "sent-invitations") {
              sentRef.current?.handleInvitationUpdate(
                event.userSummaryResponse
              );
            }
            break;

          case "REJECTED":
            setUserFriendshipStats((prev) => ({
              ...prev,
              totalSentInvites: Math.max(0, prev.totalSentInvites - 1),
            }));
            if (activeTab === "sent-invitations") {
              sentRef.current?.handleInvitationUpdate(
                event.userSummaryResponse
              );
            }
            break;

          case "CANCELED":
            setUserFriendshipStats((prev) => ({
              ...prev,
              totalReceivedInvites: Math.max(0, prev.totalReceivedInvites - 1),
            }));
            if (activeTab === "received-invitations") {
              receivedRef.current?.removeInvitation(event.userSummaryResponse);
            }
            break;

          case "DELETED":
            setUserFriendshipStats((prev) => ({
              ...prev,
              totalFriends: Math.max(0, prev.totalFriends - 1),
            }));
            if (activeTab === "friends") {
              friendsRef.current?.removeFriend(event.userSummaryResponse);
            }
            break;
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Không thể kết nối"));
      }
    };

    const handleUserStatusEvent = (e: Event) => {
      const event = (e as CustomEvent).detail as UserStatusPayload;
      setStatusPayload(event);
    };

    window.addEventListener("socket:friend-event", handleFriendEvent);
    window.addEventListener("socket:user-status", handleUserStatusEvent);

    const fetchStats = async () => {
      try {
        const res = await getUserFriendshipStatsApi();
        setUserFriendshipStats(res.data.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    };

    fetchStats();

    return () => {
      window.removeEventListener("socket:friend-event", handleFriendEvent);
      window.removeEventListener("socket:user-status", handleUserStatusEvent);
    };
  }, [activeTab, userSession?.id]);

  const getTabCount = (tabId: string) => {
    switch (tabId) {
      case "friends":
        return userFriendshipStats.totalFriends;
      case "received-invitations":
        return userFriendshipStats.totalReceivedInvites;
      case "sent-invitations":
        return userFriendshipStats.totalSentInvites;
      default:
        return 0;
    }
  };

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

        <div className="flex-1 p-4">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = getTabCount(tab.id);

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-medium flex items-center justify-between">
                      {tab.title}
                      {count > 0 && (
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            isActive
                              ? "bg-purple-200 text-purple-800"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {tab.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white">{renderActiveComponent()}</div>
    </div>
  );
}
