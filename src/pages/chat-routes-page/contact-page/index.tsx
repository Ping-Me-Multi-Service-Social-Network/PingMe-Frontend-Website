import { useState, useEffect, useRef } from "react";
import { Users, Send, Inbox } from "lucide-react";
import { SharedTopBar } from "../components/SharedTopbar.tsx";
import { FriendsListComponent } from "./components/FriendsListComponent.tsx";
import { SentInvitationsComponent } from "./components/SentInvitationsComponent.tsx";
import { ReceivedInvitationsComponent } from "./components/ReceivedInvitationsComponent.tsx";
import {
  connectGlobalWS,
  disconnectGlobalWS,
  type FriendshipEventPayload,
} from "@/services/ws/friendshipSocket.ts";
import type { UserSummaryResponse } from "@/types/common/userSummary";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import type { UserFriendshipStatsResponse } from "@/types/friendship";
import { getUserFriendshipStatsApi } from "@/services/friendship";
import { useAppSelector } from "@/features/hooks.ts";
import type { UserStatusPayload } from "@/types/common/userStatus";
import type { SignalingPayload } from "@/types/call/call";

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

  //Thêm statusPayload để lấy thông tin online/offline của người dùng
  const [statusPayload, setStatusPayload] = useState<UserStatusPayload | null>(
    null
  );

  const [activeTab, setActiveTab] = useState("friends");

  // Ref quản lý hành động ở trang "Danh sách bạn bè"
  const friendsRef = useRef<{
    handleNewFriend: (user: UserSummaryResponse) => void; // thêm bạn mới
    removeFriend: (user: UserSummaryResponse) => void; // xóa bạn
  }>(null);

  // Ref quản lý hành động ở trang "Lời mời kết bạn đã nhận"
  const receivedRef = useRef<{
    handleNewInvitation: (user: UserSummaryResponse) => void; // thêm lời mời mới
    removeInvitation: (user: UserSummaryResponse) => void; // xóa lời mời
  }>(null);

  // Ref quản lý hành động ở trang "Lời mời đã gửi"
  const sentRef = useRef<{
    handleInvitationUpdate: (user: UserSummaryResponse) => void;
    newInvitation: (user: UserSummaryResponse) => void;
  }>(null);

  // const { handleSignalingEvent } = useCallContext();

  useEffect(() => {
    const connectWebSocket = () => {
      connectGlobalWS({
        baseUrl: `${import.meta.env.VITE_BACKEND_BASE_URL}`,
        onFriendEvent: (event: FriendshipEventPayload) => {
          try {
            switch (event.type) {
              // Có lời mời kết bạn mới
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

              // Lời mời kết bạn được chấp nhận
              case "ACCEPTED":
                setUserFriendshipStats((prev) => ({
                  ...prev,
                  totalFriends: prev.totalFriends + 1,
                  totalSentInvites: Math.max(0, prev.totalSentInvites - 1),
                }));
                if (activeTab === "friends") {
                  friendsRef.current?.handleNewFriend(
                    event.userSummaryResponse
                  );
                }
                if (activeTab === "sent-invitations") {
                  sentRef.current?.handleInvitationUpdate(
                    event.userSummaryResponse
                  );
                }
                break;

              // Lời mời bị từ chối
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

              // Lời mời bị hủy
              case "CANCELED":
                setUserFriendshipStats((prev) => ({
                  ...prev,
                  totalReceivedInvites: Math.max(
                    0,
                    prev.totalReceivedInvites - 1
                  ),
                }));
                if (activeTab === "received-invitations") {
                  receivedRef.current?.removeInvitation(
                    event.userSummaryResponse
                  );
                }
                break;

              // Xóa bạn bè
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
        },

        //Thêm onStatus (lấy từ bên services/ws/friendshipSocket.ts)
        onStatus: ({ userId, name, isOnline }) => {
          setStatusPayload({ userId, name, isOnline }); //  update state khi có event
        },

        onSignalEvent: (event: SignalingPayload) => {
          console.log("[ContactPage] Received signaling event:", event.type);
          // CallProvider will handle this globally, no need to process here
        },
      });
    };

    const fetchStats = async () => {
      try {
        const res = await getUserFriendshipStatsApi();
        setUserFriendshipStats(res.data.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    };

    connectWebSocket();
    fetchStats();

    return () => {
      disconnectGlobalWS();
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

  // Hàm render component theo tab đang chọn
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "friends":
        return (
          <FriendsListComponent
            ref={friendsRef}
            onStatsUpdate={setUserFriendshipStats}
            //Đẩy statusPayload vào FriendsListComponent
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
            //Đẩy statusPayload vào FriendsListComponent
            statusPayload={statusPayload}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <SharedTopBar />

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
