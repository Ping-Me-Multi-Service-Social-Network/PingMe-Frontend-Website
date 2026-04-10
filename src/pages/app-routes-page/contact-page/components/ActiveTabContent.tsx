import { FriendsListComponent } from "./FriendsListComponent.tsx";
import { SentInvitationsComponent } from "./SentInvitationsComponent.tsx";
import { ReceivedInvitationsComponent } from "./ReceivedInvitationsComponent.tsx";
import type { UserStatusPayload } from "@/features/websocket/system";
import type { UserFriendshipStatsResponse } from "@/types/friendship";

interface ActiveTabContentProps {
  activeTab: string;
  setUserFriendshipStats: React.Dispatch<
    React.SetStateAction<UserFriendshipStatsResponse>
  >;
  statusPayload: UserStatusPayload | null;
}

export const ActiveTabContent = ({
  activeTab,
  setUserFriendshipStats,
  statusPayload,
}: ActiveTabContentProps) => {
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
