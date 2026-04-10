import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Users, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import {
  getAcceptedFriendshipHistoryListApi,
  deleteFriendshipApi,
} from "@/services/friendship";
import type { UserSummaryResponse } from "@/types/common/userSummary.d.ts";
import type { HistoryFriendshipResponse } from "@/types/friendship";
import type { UserFriendshipStatsResponse } from "@/types/friendship";
import { getUserInitials } from "@/utils/authFieldHandler.ts";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import { type UserStatusPayload } from "@/types/common/userStatus.ts";
import { useTranslation } from "react-i18next";
import { m as motion, AnimatePresence } from "framer-motion";

import { SocketManager } from "@/features/websocket";

interface FriendsListComponentProps {
  onStatsUpdate: (
    updater: (prev: UserFriendshipStatsResponse) => UserFriendshipStatsResponse,
  ) => void;

  statusPayload?: UserStatusPayload | null;
}

export const FriendsListComponent = (props: FriendsListComponentProps) => {
  const { onStatsUpdate, statusPayload } = props;
  const { t } = useTranslation("contacts");

  // State quản lý danh sách bạn bè và infinite scroll
  const [friends, setFriends] = useState<UserSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreFriends, setHasMoreFriends] = useState(true);

  // Refs cho infinite scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  // Fetch danh sách bạn bè với pagination
  const fetchFriends = useCallback(
    async (beforeId?: number, isLoadMore = false) => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      if (!isLoadMore) setIsLoading(true);

      try {
        const response: HistoryFriendshipResponse = (
          await getAcceptedFriendshipHistoryListApi(beforeId, 20)
        ).data.data;
        const friendsList = response.userSummaryResponses;

        if (isLoadMore) {
          setFriends((prev) => {
            const newFriends = friendsList.filter(
              (newFriend) =>
                !prev.some(
                  (existingFriend) => existingFriend.id === newFriend.id,
                ),
            );
            return [...prev, ...newFriends];
          });
        } else {
          setFriends(friendsList);
        }

        setHasMoreFriends(response.hasMore);
      } catch (error) {
        toast.error(getErrorMessage(error, t("friendsList.fetchError")));
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
    if (!container || isLoadingRef.current || !hasMoreFriends) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // Load more when scrolled to bottom (with 10px threshold)
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      const beforeId =
        friends.length > 0 ? friends[friends.length - 1].id : undefined;
      fetchFriends(beforeId, true);
    }
  }, [friends, hasMoreFriends, fetchFriends]);

  // Xử lý xóa bạn bè
  const handleRemoveFriend = useCallback(
    async (friendshipId: number) => {
      try {
        await deleteFriendshipApi(friendshipId);

        setFriends((prev) =>
          prev.filter(
            (friend) => friend.friendshipSummary?.id !== friendshipId,
          ),
        );

        onStatsUpdate((prev) => ({
          ...prev,
          totalFriends: prev.totalFriends - 1,
        }));

        toast.success(t("friendsList.removeSuccess"));
      } catch (error) {
        toast.error(getErrorMessage(error, t("friendsList.removeError")));
      }
    },
    [onStatsUpdate],
  );

  // Đăng ký trực tiếp với SocketManager
  useEffect(() => {
    const unsub = SocketManager.on("FRIENDSHIP", (event) => {
      if (event.type === "ACCEPTED") {
        setFriends((prev) => {
          const friendExists = prev.some((friend) => friend.id === event.userSummaryResponse.id);
          if (friendExists) return prev;
          return [event.userSummaryResponse, ...prev];
        });
      } else if (event.type === "DELETED") {
        setFriends((prev) => prev.filter((friend) => friend.id !== event.userSummaryResponse.id));
      }
    });
    return () => unsub();
  }, []);

  // Load danh sách bạn bè khi component mount
  useEffect(() => {
    setFriends([]);
    setHasMoreFriends(true);
    fetchFriends();
  }, [fetchFriends]);

  // Attach scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Thêm useEffect này để bắt sự kiện payload trả về, từ đó cập nhật trạng thái
  // online/offline của người dùng
  useEffect(() => {
    if (!statusPayload) return;
    setFriends((prev) =>
      prev.map((friend) =>
        friend.id === Number(statusPayload.userId)
          ? {
            ...friend,
            status: statusPayload.isOnline ? "ONLINE" : "OFFLINE",
          }
          : friend,
      ),
    );
  }, [statusPayload]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t("friendsList.title")}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="tabular-nums font-medium">{friends.length}</span>{" "}
              {t("friendsList.count")}
            </p>
          </div>
        </div>
      </div>

      {/* Danh sách bạn bè */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {isLoading && friends.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-primary">
              <LoadingSpinner className="w-6 h-6" />
              <span className="text-sm font-medium">
                {t("friendsList.loading")}
              </span>
            </div>
          </div>
        ) : friends.length === 0 ? (
          <div className="h-64">
            <EmptyState
              icon={Users}
              title={t("friendsList.emptyTitle")}
              description={t("friendsList.emptyDesc")}
            />
          </div>
        ) : (
          <div className="p-3 space-y-1.5">
            <AnimatePresence mode="popLayout">
              {friends.map((friend, index) => (
                <motion.div
                  key={friend.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(index * 0.03, 0.3),
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="
                    group flex items-center justify-between p-3 rounded-xl
                    hover:bg-accent/50 transition-colors duration-150 ease-out
                  "
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar with online indicator */}
                    <div className="relative shrink-0">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={friend.avatarUrl || "/placeholder.svg"}
                          alt={friend.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {getUserInitials(friend.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Online status dot */}
                      <AnimatePresence>
                        {friend.status === "ONLINE" && (
                          <motion.span
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            className="absolute -bottom-0.5 -right-0.5 block w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-background"
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {friend.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {friend.email}
                      </p>
                    </div>
                  </div>

                  {/* Remove button - visible on hover */}
                  {friend.friendshipSummary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveFriend(friend.friendshipSummary!.id)
                      }
                      className="
                        opacity-0 group-hover:opacity-100
                        text-destructive hover:text-destructive hover:bg-destructive/10
                        transition-all duration-150
                        h-8 px-2.5 text-xs shrink-0 ml-2
                      "
                    >
                      <UserMinus className="w-3.5 h-3.5 mr-1.5" />
                      {t("friendsList.btnRemove")}
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading more indicator */}
            {isLoadingRef.current && hasMoreFriends && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LoadingSpinner className="w-4 h-4" />
                  <span className="text-xs">{t("common.loadingMore")}</span>
                </div>
              </div>
            )}

            {/* End of list */}
            {!hasMoreFriends && friends.length > 0 && (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">{t("common.displayedAllFriends")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

FriendsListComponent.displayName = "FriendsListComponent";
