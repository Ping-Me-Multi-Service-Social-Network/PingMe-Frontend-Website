import { useEffect, type MutableRefObject } from "react";
import type { UserSummaryResponse } from "@/types/common/userSummary";
import type { FriendshipEventPayload } from "@/services/ws/module/globalSocket";
import type { UserFriendshipStatsResponse } from "@/types/friendship";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler";

interface UseFriendshipSocketHandlerProps {
  friendshipEvent: { id: number; payload: FriendshipEventPayload | null };
  userSessionId: string | number | undefined;
  activeTabRef: MutableRefObject<string>;
  sentRef: MutableRefObject<{
    handleInvitationUpdate: (user: UserSummaryResponse) => void;
    newInvitation: (user: UserSummaryResponse) => void;
  } | null>;
  receivedRef: MutableRefObject<{
    handleNewInvitation: (user: UserSummaryResponse) => void;
    removeInvitation: (user: UserSummaryResponse) => void;
  } | null>;
  friendsRef: MutableRefObject<{
    handleNewFriend: (user: UserSummaryResponse) => void;
    removeFriend: (user: UserSummaryResponse) => void;
  } | null>;
  setUserFriendshipStats: React.Dispatch<
    React.SetStateAction<UserFriendshipStatsResponse>
  >;
}

export const useFriendshipSocketHandler = ({
  friendshipEvent,
  userSessionId,
  activeTabRef,
  sentRef,
  receivedRef,
  friendsRef,
  setUserFriendshipStats,
}: UseFriendshipSocketHandlerProps) => {
  useEffect(() => {
    const event = friendshipEvent.payload;
    if (!event) return;

    try {
      switch (event.type) {
        case "INVITED":
          if (Number(userSessionId) === event.userSummaryResponse.id) {
            setUserFriendshipStats((prev) => ({
              ...prev,
              totalSentInvites: prev.totalSentInvites + 1,
            }));

            if (activeTabRef.current === "sent-invitations") {
              sentRef.current?.newInvitation(event.userSummaryResponse);
            }
          } else {
            setUserFriendshipStats((prev) => ({
              ...prev,
              totalReceivedInvites: prev.totalReceivedInvites + 1,
            }));
            if (activeTabRef.current === "received-invitations") {
              receivedRef.current?.handleNewInvitation(
                event.userSummaryResponse,
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
          if (activeTabRef.current === "friends") {
            friendsRef.current?.handleNewFriend(event.userSummaryResponse);
          }
          if (activeTabRef.current === "sent-invitations") {
            sentRef.current?.handleInvitationUpdate(event.userSummaryResponse);
          }
          break;
        case "REJECTED":
          setUserFriendshipStats((prev) => ({
            ...prev,
            totalSentInvites: Math.max(0, prev.totalSentInvites - 1),
          }));
          if (activeTabRef.current === "sent-invitations") {
            sentRef.current?.handleInvitationUpdate(event.userSummaryResponse);
          }
          break;
        case "CANCELED":
          setUserFriendshipStats((prev) => ({
            ...prev,
            totalReceivedInvites: Math.max(0, prev.totalReceivedInvites - 1),
          }));
          if (activeTabRef.current === "received-invitations") {
            receivedRef.current?.removeInvitation(event.userSummaryResponse);
          }
          break;
        case "DELETED":
          setUserFriendshipStats((prev) => ({
            ...prev,
            totalFriends: Math.max(0, prev.totalFriends - 1),
          }));
          if (activeTabRef.current === "friends") {
            friendsRef.current?.removeFriend(event.userSummaryResponse);
          }
          break;
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể kết nối"));
    }
  }, [
    friendshipEvent.id,
    friendshipEvent.payload,
    userSessionId,
    activeTabRef,
    friendsRef,
    receivedRef,
    sentRef,
    setUserFriendshipStats,
  ]);
};
