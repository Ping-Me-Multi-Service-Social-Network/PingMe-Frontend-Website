import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Send, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import {
  cancelInvitationApi,
  getSentHistoryInvitationsApi,
} from "@/services/friendship";
import type { UserSummaryResponse } from "@/types/common/userSummary.d.ts";
import type { HistoryFriendshipResponse } from "@/types/friendship";
import type { UserFriendshipStatsResponse } from "@/types/friendship";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { InvitationUserCard } from "./InvitationUserCard";
import { AnimatePresence } from "framer-motion";

import { SocketManager } from "@/features/websocket/socketManager";
import { useAppSelector } from "@/features/hooks.ts";
import { hasSentInvite } from "@/utils/inviteTracker";

interface SentInvitationsComponentProps {
  onStatsUpdate: (
    updater: (prev: UserFriendshipStatsResponse) => UserFriendshipStatsResponse,
  ) => void;
}

export const SentInvitationsComponent = (props: SentInvitationsComponentProps) => {
  const { onStatsUpdate } = props;
  const { t } = useTranslation("contacts");
  const { userSession } = useAppSelector((state) => state.auth);

  // State quản lý danh sách lời mời đã gửi và infinite scroll
  const [sentInvitations, setSentInvitations] = useState<UserSummaryResponse[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreInvitations, setHasMoreInvitations] = useState(true);

  // Refs cho infinite scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  // Fetch danh sách lời mời đã gửi với pagination
  const fetchSentInvitations = useCallback(
    async (beforeId?: number, isLoadMore = false) => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      if (!isLoadMore) setIsLoading(true);

      try {
        const response = (await getSentHistoryInvitationsApi(beforeId, 20)).data
          .data as HistoryFriendshipResponse;

        if (isLoadMore) {
          setSentInvitations((prev) => {
            const newInvitations = response.userSummaryResponses.filter(
              (newInvitation) =>
                !prev.some((existing) => existing.id === newInvitation.id),
            );
            return [...prev, ...newInvitations];
          });
        } else {
          setSentInvitations(response.userSummaryResponses);
        }

        setHasMoreInvitations(response.hasMore);
      } catch {
        toast.error(t("sentInvitations.fetchError"));
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
        sentInvitations.length > 0
          ? sentInvitations[sentInvitations.length - 1].id
          : undefined;
      fetchSentInvitations(beforeId, true);
    }
  }, [sentInvitations, hasMoreInvitations, fetchSentInvitations]);

  // Xử lý hủy lời mời kết bạn
  const handleCancelInvitation = useCallback(
    async (friendshipId: number) => {
      try {
        await cancelInvitationApi(friendshipId);

        setSentInvitations((prev) => {
          return prev.filter(
            (invitation) => invitation.friendshipSummary?.id !== friendshipId,
          );
        });

        onStatsUpdate((prev) => ({
          ...prev,
          totalSentInvites: prev.totalSentInvites - 1,
        }));

        toast.success(t("sentInvitations.cancelSuccess"));
      } catch {
        toast.error(t("sentInvitations.cancelError"));
      }
    },
    [onStatsUpdate],
  );

  // Đăng ký trực tiếp với SocketManager
  useEffect(() => {
    const unsub = SocketManager.on("FRIENDSHIP", (event) => {
      // Bỏ qua event dội lại từ frontend
      if (event.userSummaryResponse.id === Number(userSession?.id)) return;

      if (
        event.type === "INVITED" &&
        hasSentInvite(event.userSummaryResponse.id)
      ) {
        setSentInvitations((prev) => {
          const exists = prev.some((invitation) => invitation.id === event.userSummaryResponse.id);
          if (exists) return prev;
          return [event.userSummaryResponse, ...prev];
        });
      } else if (event.type === "ACCEPTED" || event.type === "REJECTED") {
        setSentInvitations((prev) =>
          prev.filter((inv) => inv.id !== event.userSummaryResponse.id)
        );
      }
    });

    return () => unsub();
  }, [userSession?.id]);

  useEffect(() => {
    setSentInvitations([]);
    setHasMoreInvitations(true);
    fetchSentInvitations();
  }, [fetchSentInvitations]);

  // Attach scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t("sentInvitations.title")}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="tabular-nums font-medium">{sentInvitations.length}</span>{" "}
              {t("sentInvitations.count")}
            </p>
          </div>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {isLoading && sentInvitations.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-primary">
              <LoadingSpinner className="w-6 h-6" />
              <span className="text-sm font-medium">
                {t("sentInvitations.loading")}
              </span>
            </div>
          </div>
        ) : sentInvitations.length === 0 ? (
          <div className="h-64">
            <EmptyState
              icon={Send}
              title={t("sentInvitations.emptyTitle")}
              description={t("sentInvitations.emptyDesc")}
            />
          </div>
        ) : (
          <div className="p-3 space-y-2">
            <AnimatePresence mode="popLayout">
              {sentInvitations.map((invitation, index) => (
                <InvitationUserCard
                  key={invitation.id}
                  invitation={invitation}
                  index={index}
                  actions={
                    <>
                      <Badge
                        variant="outline"
                        className="
                          text-amber-600 border-amber-200 bg-amber-50
                          dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950/50
                          text-[11px] font-medium h-6
                        "
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {t("sentInvitations.statusPending")}
                      </Badge>

                      {invitation.friendshipSummary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCancelInvitation(invitation.friendshipSummary!.id)
                          }
                          className="
                            text-destructive hover:text-destructive hover:bg-destructive/10
                            h-8 px-3 text-xs font-medium
                            transition-colors duration-150
                          "
                        >
                          <X className="w-3.5 h-3.5 mr-1.5" />
                          {t("sentInvitations.btnCancel")}
                        </Button>
                      )}
                    </>
                  }
                />
              ))}
            </AnimatePresence>

            {isLoadingRef.current && hasMoreInvitations && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LoadingSpinner className="w-4 h-4" />
                  <span className="text-xs">{t("common.loadingMore")}</span>
                </div>
              </div>
            )}

            {!hasMoreInvitations && sentInvitations.length > 0 && (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">{t("common.displayedAllInvitations")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

SentInvitationsComponent.displayName = "SentInvitationsComponent";
