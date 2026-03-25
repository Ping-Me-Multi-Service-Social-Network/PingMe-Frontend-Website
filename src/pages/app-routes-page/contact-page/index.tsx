import { useState, useEffect } from "react";
import { ChatActionBar } from "../components/chat-shared-components/ChatActionBar.tsx";
import { FriendsListComponent } from "./components/FriendsListComponent.tsx";
import { SentInvitationsComponent } from "./components/SentInvitationsComponent.tsx";
import { ReceivedInvitationsComponent } from "./components/ReceivedInvitationsComponent.tsx";
import { ContactSidebar } from "./components/ContactSidebar";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import type { UserFriendshipStatsResponse } from "@/types/friendship";
import { getUserFriendshipStatsApi } from "@/services/friendship";
import { useAppSelector } from "@/features/hooks.ts";
import { SocketManager } from "@/features/websocket/socketManager";
import type {
  UserStatusPayload,
  FriendshipEventPayload,
} from "@/features/websocket/models/systemEvents";
import { hasSentInvite } from "@/utils/inviteTracker";
import { AnimatePresence, motion } from "framer-motion";

// trigger deploy
export default function ContactsPage() {
  const { userSession } = useAppSelector((state) => state.auth);

  const [userFriendshipStats, setUserFriendshipStats] =
    useState<UserFriendshipStatsResponse>({
      totalFriends: 0,
      totalSentInvites: 0,
      totalReceivedInvites: 0,
    } as UserFriendshipStatsResponse);

  const [activeTab, setActiveTab] = useState("friends");
  const [statusPayload, setStatusPayload] = useState<UserStatusPayload | null>(
    null,
  );

  useEffect(() => {
    return SocketManager.on("USER_STATUS", setStatusPayload);
  }, []);

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

  // Thay vì dùng useFriendshipSocketHandler rườm rà, Mẹ chỉ việc tự bắt Data và lo cập nhật con số thống kê
  useEffect(() => {
    const unsub = SocketManager.on(
      "FRIENDSHIP",
      (event: FriendshipEventPayload) => {
        // BỎ QUA các event dội ngược echo từ backend rớt vào chính mình để tránh nhảy số ảo
        if (event.userSummaryResponse.id === Number(userSession?.id)) {
          return;
        }

        switch (event.type) {
          case "INVITED":
            if (hasSentInvite(event.userSummaryResponse.id)) {
              setUserFriendshipStats((prev) => ({
                ...prev,
                totalSentInvites: prev.totalSentInvites + 1,
              }));
            } else {
              setUserFriendshipStats((prev) => ({
                ...prev,
                totalReceivedInvites: prev.totalReceivedInvites + 1,
              }));
            }
            break;
          case "ACCEPTED":
            setUserFriendshipStats((prev) => ({
              ...prev,
              totalFriends: prev.totalFriends + 1,
              totalSentInvites: Math.max(0, prev.totalSentInvites - 1),
            }));
            break;
          case "REJECTED":
            setUserFriendshipStats((prev) => ({
              ...prev,
              totalSentInvites: Math.max(0, prev.totalSentInvites - 1),
            }));
            break;
          case "CANCELED":
            setUserFriendshipStats((prev) => ({
              ...prev,
              totalReceivedInvites: Math.max(0, prev.totalReceivedInvites - 1),
            }));
            break;
          case "DELETED":
            setUserFriendshipStats((prev) => ({
              ...prev,
              totalFriends: Math.max(0, prev.totalFriends - 1),
            }));
            break;
        }
      },
    );

    return () => unsub();
  }, [userSession?.id]);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "friends":
        return (
          <FriendsListComponent
            onStatsUpdate={setUserFriendshipStats}
            statusPayload={statusPayload}
          />
        );
      case "received-invitations":
        return (
          <ReceivedInvitationsComponent
            onStatsUpdate={setUserFriendshipStats}
          />
        );
      case "sent-invitations":
        return (
          <SentInvitationsComponent onStatsUpdate={setUserFriendshipStats} />
        );
      default:
        return (
          <FriendsListComponent
            onStatsUpdate={setUserFriendshipStats}
            statusPayload={statusPayload}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col shrink-0">
        <ChatActionBar />
        <ContactSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={userFriendshipStats}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-card min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-full"
          >
            {renderActiveComponent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
