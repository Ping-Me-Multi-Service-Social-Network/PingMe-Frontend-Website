import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Inbox, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
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
import { InvitationUserCard } from "./InvitationUserCard";

import { SocketManager } from "@/features/websocket/socketManager";
import { useAppSelector } from "@/features/hooks.ts";

interface ReceivedInvitationsComponentProps {
  onStatsUpdate: (
    updater: (prev: UserFriendshipStatsResponse) => UserFriendshipStatsResponse,
  ) => void;
}

export const ReceivedInvitationsComponent = (
  props: ReceivedInvitationsComponentProps
) => {
  const { onStatsUpdate } = props;
  const { t } = useTranslation("contacts");
  const { userSession } = useAppSelector((state) => state.auth);

  // State quản lý danh sách lời mời nhận được và infinite scroll
  const [receivedInvitations, setReceivedInvitations] = useState<
    UserSummaryResponse[]
  >([]);
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
    [],
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
    [processingInvitations, onStatsUpdate],
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
    [processingInvitations, onStatsUpdate],
  );

  // Đăng ký trực tiếp với SocketManager
  useEffect(() => {
    const unsub = SocketManager.on("FRIENDSHIP", (event) => {
      if (
        event.type === "INVITED" &&
        Number(userSession?.id) !== event.userSummaryResponse.id
      ) {
        setReceivedInvitations((prev) => {
          const invitationExists = prev.some((invitation) => invitation.id === event.userSummaryResponse.id);
          if (invitationExists) return prev;
          return [event.userSummaryResponse, ...prev];
        });
      } else if (event.type === "CANCELED") {
        setReceivedInvitations((prev) =>
          prev.filter((inv) => inv.id !== event.userSummaryResponse.id)
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t("receivedInvitations.title")}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {receivedInvitations.length} {t("receivedInvitations.count")}
            </p>
          </div>
        </div>
      </div>

      {/* Danh sách lời mời nhận được */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {isLoading && receivedInvitations.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3 text-purple-600">
              <LoadingSpinner className="w-8 h-8" />
              <span className="text-lg font-medium">
                {t("receivedInvitations.loading")}
              </span>
            </div>
          </div>
        ) : receivedInvitations.length === 0 ? (
          <div className="h-64">
            <EmptyState
              icon={Inbox}
              title={t("receivedInvitations.emptyTitle")}
              description={t("receivedInvitations.emptyDesc")}
            />
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {receivedInvitations.map((invitation) => {
              const friendshipId = invitation.friendshipSummary?.id;
              const isProcessing = friendshipId
                ? processingInvitations.has(friendshipId)
                : false;

              return (
                <InvitationUserCard
                  key={invitation.id}
                  invitation={invitation}
                  actions={
                    <>
                      {friendshipId && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptInvitation(friendshipId)}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isProcessing ? (
                              <LoadingSpinner className="w-4 h-4 mr-2" />
                            ) : (
                              <Check className="w-4 h-4 mr-2" />
                            )}
                            {t("receivedInvitations.btnAccept")}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectInvitation(friendshipId)}
                            disabled={isProcessing}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          >
                            <X className="w-4 h-4 mr-2" />
                            {t("receivedInvitations.btnReject")}
                          </Button>
                        </>
                      )}
                    </>
                  }
                />
              );
            })}
            {/* Loading indicator khi load thêm */}
            {isLoadingRef.current && hasMoreInvitations && (
              <div className="flex justify-center py-4">
                <div className="flex items-center space-x-2 text-purple-600">
                  <LoadingSpinner className="w-5 h-5" />
                  <span>{t("common.loadingMore")}</span>
                </div>
              </div>
            )}

            {/* Thông báo hết dữ liệu */}
            {!hasMoreInvitations && receivedInvitations.length > 0 && (
              <div className="text-center py-4 text-gray-500">
                <p>{t("common.displayedAllInvitations")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

ReceivedInvitationsComponent.displayName = "ReceivedInvitationsComponent";
