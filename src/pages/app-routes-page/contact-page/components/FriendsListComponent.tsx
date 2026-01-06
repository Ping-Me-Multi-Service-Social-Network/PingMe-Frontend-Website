import {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
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

interface FriendListComponentRef {
  handleNewFriend: (user: UserSummaryResponse) => void;
  removeFriend: (user: UserSummaryResponse) => void;
}

interface FriendsListComponentProps {
  onStatsUpdate: (
    updater: (prev: UserFriendshipStatsResponse) => UserFriendshipStatsResponse
  ) => void;

  statusPayload?: UserStatusPayload | null;
}

export const FriendsListComponent = forwardRef<
  FriendListComponentRef,
  FriendsListComponentProps
>((props, ref) => {
  const { onStatsUpdate, statusPayload } = props;

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
                  (existingFriend) => existingFriend.id === newFriend.id
                )
            );
            return [...prev, ...newFriends];
          });
        } else {
          setFriends(friendsList);
        }

        setHasMoreFriends(response.hasMore);
      } catch (error) {
        toast.error(getErrorMessage(error, "Không thể tải danh sách bạn bè"));
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    },
    []
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
          prev.filter((friend) => friend.friendshipSummary?.id !== friendshipId)
        );

        onStatsUpdate((prev) => ({
          ...prev,
          totalFriends: prev.totalFriends - 1,
        }));

        toast.success("Đã xóa bạn bè thành công");
      } catch (error) {
        toast.error(getErrorMessage(error, "Không thể xóa bạn bè"));
      }
    },
    [onStatsUpdate]
  );

  // Expose methods cho parent component qua ref
  useImperativeHandle(
    ref,
    () => ({
      handleNewFriend: (user: UserSummaryResponse) => {
        setFriends((prev) => {
          const friendExists = prev.some((friend) => friend.id === user.id);
          if (friendExists) {
            return prev;
          }
          return [user, ...prev];
        });
      },
      removeFriend: (user: UserSummaryResponse) => {
        setFriends((prev) => prev.filter((friend) => friend.id !== user.id));
      },
    }),
    []
  );

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

    container.addEventListener("scroll", handleScroll);
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
          : friend
      )
    );
  }, [statusPayload]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Danh sách bạn bè
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {friends.length} bạn bè
            </p>
          </div>
        </div>
      </div>

      {/* Danh sách bạn bè */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {isLoading && friends.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3 text-purple-600">
              <LoadingSpinner className="w-8 h-8" />
              <span className="text-lg font-medium">
                Đang tải danh sách bạn bè...
              </span>
            </div>
          </div>
        ) : friends.length === 0 ? (
          <div className="h-64">
            <EmptyState
              icon={Users}
              title="Chưa có bạn bè"
              description="Hãy gửi lời mời kết bạn để bắt đầu kết nối!"
            />
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  {/* <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={friend.avatarUrl || "/placeholder.svg"}
                      alt={friend.name}
                    />
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      {getUserInitials(friend.name)}
                    </AvatarFallback>
                  </Avatar> */}

                  {/* Đoạn code sau đã được sửa từ đoạn code đã được comment ở trên. 
                  Hiển thị chấm xanh nếu người dùng online, ngược lại nếu người dùng offline thì chấm xanh biến mất */}
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={friend.avatarUrl || "/placeholder.svg"}
                        alt={friend.name}
                      />
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {getUserInitials(friend.name)}
                      </AvatarFallback>
                    </Avatar>

                    {friend.status === "ONLINE" && (
                      <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">{friend.name}</h3>
                    <p className="text-sm text-gray-500">{friend.email}</p>
                  </div>
                </div>

                {friend.friendshipSummary && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleRemoveFriend(friend.friendshipSummary!.id)
                    }
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Xóa bạn
                  </Button>
                )}
              </div>
            ))}
            {isLoadingRef.current && hasMoreFriends && (
              <div className="flex justify-center py-4">
                <div className="flex items-center space-x-2 text-purple-600">
                  <LoadingSpinner className="w-5 h-5" />
                  <span>Đang tải thêm...</span>
                </div>
              </div>
            )}
            {!hasMoreFriends && friends.length > 0 && (
              <div className="text-center py-4 text-gray-500">
                <p>Đã hiển thị tất cả bạn bè</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

FriendsListComponent.displayName = "FriendsListComponent";
