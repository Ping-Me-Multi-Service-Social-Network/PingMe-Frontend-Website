import type React from "react";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Search, X, Users, UserX, Plus } from "lucide-react";
import { getAcceptedFriendshipHistoryListApi } from "@/services/friendship";
import { createGroupRoomApi, addGroupMembersApi } from "@/services/chat";
import type { UserSummaryResponse } from "@/types/common/userSummary";
import type { RoomResponse, RoomParticipantResponse } from "@/types/chat/room";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import { useTranslation } from "react-i18next";

interface GroupMemberModalProps {
  mode: "create" | "add";
  onGroupCreated?: (room: RoomResponse) => void;
  currentMembers?: RoomParticipantResponse[];
  roomId?: number;
  onMembersAdded?: () => void;
  triggerButton?: React.ReactNode;
}

export function GroupMemberModal({
  mode,
  onGroupCreated,
  currentMembers = [],
  roomId,
  onMembersAdded,
  triggerButton,
}: GroupMemberModalProps) {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<UserSummaryResponse[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<UserSummaryResponse[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("common");

  const currentMemberIds = new Set(currentMembers.map((m) => m.userId));

  const fetchFriends = useCallback(
    async (beforeId?: number) => {
      if (isLoading || !hasMore) return;

      setIsLoading(true);
      try {
        const response = await getAcceptedFriendshipHistoryListApi(
          beforeId,
          20,
        );
        const { userSummaryResponses, hasMore: responseHasMore } =
          response.data.data;

        setFriends((prev) =>
          beforeId ? [...prev, ...userSummaryResponses] : userSummaryResponses,
        );
        setHasMore(responseHasMore);
      } catch (error) {
        toast.error(getErrorMessage(error, t("groupModal.search.fetchError")));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, hasMore],
  );

  useEffect(() => {
    if (open) {
      setFriends([]);
      setHasMore(true);
      setIsLoading(false);

      // Fetch friends immediately without dependency on fetchFriends callback
      const loadInitialFriends = async () => {
        setIsLoading(true);
        try {
          const response = await getAcceptedFriendshipHistoryListApi(
            undefined,
            20,
          );
          const { userSummaryResponses, hasMore: responseHasMore } =
            response.data.data;
          setFriends(userSummaryResponses);
          setHasMore(responseHasMore);
        } catch (error) {
          toast.error(getErrorMessage(error, t("groupModal.search.fetchError")));
        } finally {
          setIsLoading(false);
        }
      };

      loadInitialFriends();
    }
  }, [open]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      const lastFriend = friends[friends.length - 1];
      if (lastFriend) {
        fetchFriends(lastFriend.id);
      }
    }
  }, [friends, isLoading, hasMore, fetchFriends]);

  const handleAddMember = (friend: UserSummaryResponse) => {
    if (!selectedMembers.find((m) => m.id === friend.id)) {
      setSelectedMembers([...selectedMembers, friend]);
    }
  };

  const handleRemoveMember = (memberId: number) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== memberId));
  };

  const handleSubmit = async () => {
    if (mode === "create") {
      if (!groupName.trim()) {
        toast.error(t("groupModal.create.emptyNameError"));
        return;
      }

      if (selectedMembers.length < 2) {
        toast.error(t("groupModal.create.minMembersError"));
        return;
      }

      setIsCreating(true);
      try {
        const response = await createGroupRoomApi({
          name: groupName,
          memberIds: selectedMembers.map((m) => m.id),
        });

        toast.success(t("groupModal.create.success"));
        onGroupCreated?.(response.data.data);
        setOpen(false);
        setGroupName("");
        setSelectedMembers([]);
      } catch (error) {
        toast.error(getErrorMessage(error, t("groupModal.create.error")));
      } finally {
        setIsCreating(false);
      }
    } else {
      // mode === "add"
      if (selectedMembers.length === 0) {
        toast.error(t("groupModal.add.emptySelectionError"));
        return;
      }

      if (!roomId) {
        toast.error(t("groupModal.add.noRoomError"));
        return;
      }

      setIsCreating(true);
      try {
        await addGroupMembersApi({
          roomId: roomId,
          memberIds: selectedMembers.map((m) => m.id),
        });

        toast.success(t("groupModal.add.success"));
        onMembersAdded?.();
        setOpen(false);
        setSelectedMembers([]);
      } catch (error) {
        toast.error(getErrorMessage(error, t("groupModal.add.error")));
      } finally {
        setIsCreating(false);
      }
    }
  };

  const availableFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedMembers.find((m) => m.id === friend.id) &&
      (mode === "create" || !currentMemberIds.has(friend.id)),
  );

  const existingMemberFriends =
    mode === "add"
      ? friends.filter((friend) => currentMemberIds.has(friend.id))
      : [];

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setGroupName("");
      setSearchQuery("");
      setSelectedMembers([]);
      setFriends([]);
      setHasMore(true);
    }
  };

  return (
    <>
      {triggerButton ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="appearance-none bg-transparent border-none p-0 cursor-pointer"
        >
          {triggerButton}
        </button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0 relative"
          onClick={() => setOpen(true)}
        >
          <Users className="w-6 h-6" />
          <Plus className="absolute bottom-0 right-0 w-3 h-3 bg-purple-500 text-white rounded-full" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="h-11/12! w-full! max-w-none! lg:w-2/3! flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? t("groupModal.create.title") : t("groupModal.add.title")}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            {mode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="group-name">
                  {t("groupModal.create.nameLabel")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="group-name"
                  placeholder={t("groupModal.create.namePlaceholder")}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full focus-visible:ring-purple-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
              <div className="border border-purple-200 rounded-lg flex flex-col overflow-hidden">
                <div className="p-3 border-b border-purple-100 bg-purple-50/30 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                    <Input
                      placeholder={t("groupModal.search.placeholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 focus-visible:ring-purple-500"
                    />
                  </div>
                </div>

                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto p-2 space-y-1"
                >
                  {mode === "add" && existingMemberFriends.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs font-medium text-gray-500">
                        {t("groupModal.search.inGroup")}
                      </div>
                      {existingMemberFriends.map((friend) => (
                        <div
                          key={friend.id}
                          className="w-full flex items-center gap-3 p-2 rounded-lg bg-gray-100 opacity-60 cursor-not-allowed"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={friend.avatarUrl || undefined} />
                            <AvatarFallback>
                              {friend.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 text-left text-sm font-medium text-gray-600">
                            {friend.name}
                          </span>
                        </div>
                      ))}
                      <div className="px-2 py-1 mt-3 text-xs font-medium text-gray-500">
                        {t("groupModal.search.available")}
                      </div>
                    </>
                  )}

                  {availableFriends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => handleAddMember(friend)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={friend.avatarUrl || undefined} />
                        <AvatarFallback>
                          {friend.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-left text-sm font-medium">
                        {friend.name}
                      </span>
                    </button>
                  ))}

                  {isLoading && (
                    <div className="flex justify-center py-4">
                      <LoadingSpinner className="w-6 h-6 text-purple-600" />
                    </div>
                  )}

                  {!isLoading && availableFriends.length === 0 && (
                    <EmptyState
                      icon={UserX}
                      title={t("groupModal.search.notFound")}
                      description={
                        searchQuery
                          ? t("groupModal.search.tryOtherQuery")
                          : mode === "add" && currentMemberIds.size > 0
                            ? t("groupModal.search.allInGroup")
                            : t("groupModal.search.noFriends")
                      }
                    />
                  )}
                </div>
              </div>

              <div className="border border-purple-200 rounded-lg flex flex-col overflow-hidden">
                <div className="p-3 border-b border-purple-100 bg-purple-50/30 flex-shrink-0">
                  <h3 className="text-sm font-medium text-purple-900">
                    {mode === "create" ? t("groupModal.create.selectedTitle") : t("groupModal.add.selectedTitle")}{" "}
                    ({selectedMembers.length})
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {selectedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-purple-50 border border-purple-100"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.avatarUrl || undefined} />
                        <AvatarFallback>
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-sm font-medium">
                        {member.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {selectedMembers.length === 0 && (
                    <EmptyState
                      icon={Users}
                      title={
                        mode === "create"
                          ? t("groupModal.create.emptySelected")
                          : t("groupModal.add.emptySelected")
                      }
                      description={
                        mode === "create"
                          ? t("groupModal.create.emptySelectedDesc")
                          : t("groupModal.add.emptySelectedDesc")
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("groupModal.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isCreating ||
                (mode === "create" &&
                  (!groupName.trim() || selectedMembers.length < 2)) ||
                (mode === "add" && selectedMembers.length === 0)
              }
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isCreating
                ? mode === "create"
                  ? t("groupModal.create.creatingText")
                  : t("groupModal.add.addingText")
                : mode === "create"
                  ? t("groupModal.create.btnText")
                  : t("groupModal.add.btnText")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
