import { useState, useEffect, useRef, useCallback } from "react";
import {
  acceptInvitationApi,
  getReceivedHistoryInvitationsApi,
  rejectInvitationApi,
} from "@/services/friendship";
import type { UserSummaryResponse } from "@/types/common/userSummary";
import type { HistoryFriendshipResponse } from "@/types/friendship";
import type { UserFriendshipStatsResponse } from "@/types/friendship";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import { useTranslation } from "react-i18next";
import { SocketManager } from "@/features/websocket";
import { useAppSelector } from "@/features/hooks.ts";
import { hasSentInvite } from "@/utils/inviteTracker";

import {
  ReceivedInvitationsHeader,
  ReceivedInvitationsList,
} from "./received-invitations-components";

interface ReceivedInvitationsComponentProps {
  onStatsUpdate: (
    updater: (prev: UserFriendshipStatsResponse) => UserFriendshipStatsResponse,
  ) => void;
  searchQuery?: string;
}

export const ReceivedInvitationsComponent = (
  props: ReceivedInvitationsComponentProps,
) => {
  const { onStatsUpdate, searchQuery = "" } = props;
  const { t } = useTranslation("contacts");
  const { userSession } = useAppSelector((state) => state.auth);

  // State quản lý danh sách lời mời nhận được và infinite scroll
  const [receivedInvitations, setReceivedInvitations] = useState<
    UserSummaryResponse[]
  >([]);

  // Filter based on searchQuery
  const filteredInvitations = receivedInvitations.filter((inv) =>
    inv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreInvitations, setHasMoreInvitations] = useState(true);
  const [processingInvitations, setProcessingInvitations] = useState<
    Set<number>
  >(new Set());

  // Refs cho infinite scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  // Fetch danh sách lời mời nhận được với pagination
  const fetchReceivedInvitations = useCallback(
    async (beforeId?: number, isLoadMore = false) => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      if (!isLoadMore) setIsLoading(true);

      try {
        const response = (await getReceivedHistoryInvitationsApi(beforeId, 20))
          .data.data as HistoryFriendshipResponse;

        if (isLoadMore) {
          // Append thêm lời mời vào cuối danh sách
          setReceivedInvitations((prev) => {
            const newInvitations = response.userSummaryResponses.filter(
              (newInvitation) =>
                !prev.some((existing) => existing.id === newInvitation.id),
            );
            return [...prev, ...newInvitations];
          });
        } else {
          // Load lại từ đầu
          setReceivedInvitations(response.userSummaryResponses);
        }

        setHasMoreInvitations(response.hasMore);
      } catch (error) {
        toast.error(
          getErrorMessage(error, t("receivedInvitations.fetchError")),
        );
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    },
    [t],
  );

  // Xử lý infinite scroll
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isLoadingRef.current || !hasMoreInvitations) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // Load more when scrolled to bottom (with 10px threshold)
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      const beforeId =
        receivedInvitations.length > 0
          ? receivedInvitations[receivedInvitations.length - 1].id
          : undefined;
      fetchReceivedInvitations(beforeId, true);
    }
  }, [receivedInvitations, hasMoreInvitations, fetchReceivedInvitations]);

  const handleAcceptInvitation = useCallback(
    async (friendshipId: number) => {
      if (processingInvitations.has(friendshipId)) return;

      try {
        setProcessingInvitations((prev) => new Set(prev).add(friendshipId));

        await acceptInvitationApi(friendshipId);

        setReceivedInvitations((prev) =>
          prev.filter(
            (invitation) => invitation.friendshipSummary?.id !== friendshipId,
          ),
        );

        onStatsUpdate((prev) => ({
          ...prev,
          totalFriends: prev.totalFriends + 1,
          totalReceivedInvites: prev.totalReceivedInvites - 1,
        }));

        toast.success(t("receivedInvitations.acceptSuccess"));
      } catch (error) {
        toast.error(
          getErrorMessage(error, t("receivedInvitations.acceptError")),
        );
      } finally {
        setProcessingInvitations((prev) => {
          const newSet = new Set(prev);
          newSet.delete(friendshipId);
          return newSet;
        });
      }
    },
    [processingInvitations, onStatsUpdate, t],
  );

  const handleRejectInvitation = useCallback(
    async (friendshipId: number) => {
      if (processingInvitations.has(friendshipId)) return;

      try {
        setProcessingInvitations((prev) => new Set(prev).add(friendshipId));

        await rejectInvitationApi(friendshipId);

        setReceivedInvitations((prev) =>
          prev.filter(
            (invitation) => invitation.friendshipSummary?.id !== friendshipId,
          ),
        );

        onStatsUpdate((prev) => ({
          ...prev,
          totalReceivedInvites: prev.totalReceivedInvites - 1,
        }));

        toast.success(t("receivedInvitations.rejectSuccess"));
      } catch (error) {
        toast.error(
          getErrorMessage(error, t("receivedInvitations.rejectError")),
        );
      } finally {
        setProcessingInvitations((prev) => {
          const newSet = new Set(prev);
          newSet.delete(friendshipId);
          return newSet;
        });
      }
    },
    [processingInvitations, onStatsUpdate, t],
  );

  // Đăng ký trực tiếp với SocketManager
  useEffect(() => {
    const unsub = SocketManager.on("FRIENDSHIP", (event) => {
      // Bỏ qua event dội lại từ frontend
      if (event.userSummaryResponse.id === Number(userSession?.id)) return;

      if (
        event.type === "INVITED" &&
        !hasSentInvite(event.userSummaryResponse.id)
      ) {
        setReceivedInvitations((prev) => {
          const invitationExists = prev.some(
            (invitation) => invitation.id === event.userSummaryResponse.id,
          );
          if (invitationExists) return prev;
          return [event.userSummaryResponse, ...prev];
        });
      } else if (event.type === "CANCELED") {
        setReceivedInvitations((prev) =>
          prev.filter((inv) => inv.id !== event.userSummaryResponse.id),
        );
      }
    });
    return () => unsub();
  }, [userSession?.id]);

  useEffect(() => {
    setReceivedInvitations([]);
    setHasMoreInvitations(true);
    fetchReceivedInvitations();
  }, [fetchReceivedInvitations]);

  // Attach scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const listLabels = {
    loading: t("receivedInvitations.loading"),
    emptyTitle: t("receivedInvitations.emptyTitle"),
    emptyDesc: t("receivedInvitations.emptyDesc"),
    btnAccept: t("receivedInvitations.btnAccept"),
    btnReject: t("receivedInvitations.btnReject"),
    loadingMore: t("common.loadingMore"),
    displayedAllInvitations: t("common.displayedAllInvitations"),
  };

  return (
    <div className="flex flex-col h-full">
      <ReceivedInvitationsHeader
        title={t("receivedInvitations.title")}
        countTitle={t("receivedInvitations.count")}
        count={filteredInvitations.length}
      />

      <ReceivedInvitationsList
        isLoading={isLoading}
        receivedInvitations={filteredInvitations}
        processingInvitations={processingInvitations}
        hasMoreInvitations={hasMoreInvitations}
        scrollContainerRef={scrollContainerRef}
        onAcceptInvitation={handleAcceptInvitation}
        onRejectInvitation={handleRejectInvitation}
        labels={listLabels}
        searchQuery={searchQuery}
      />
    </div>
  );
};

ReceivedInvitationsComponent.displayName = "ReceivedInvitationsComponent";
