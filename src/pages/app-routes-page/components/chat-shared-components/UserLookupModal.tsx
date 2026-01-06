import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import {
  Search,
  UserPlus,
  UserCheck,
  Clock,
  Users,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { lookupApi } from "@/services/common/userLookupApi.ts";
import type { UserSummaryResponse } from "@/types/common/userSummary";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import type { FriendInvitationRequest } from "@/types/friendship";
import { sendInvitationApi } from "@/services/friendship";
import type {
  CreateOrGetDirectRoomRequest,
  RoomResponse,
} from "@/types/chat/room";
import { createOrGetDirectRoomApi } from "@/services/chat";

interface UserLookupModalProps {
  onFriendAdded?: () => void;
  setSelectedChat?: (room: RoomResponse) => void;
}

export function UserLookupModal({
  onFriendAdded,
  setSelectedChat,
}: UserLookupModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userData, setUserData] = useState<UserSummaryResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleLookup = async () => {
    if (!emailSearch.trim()) {
      toast.error("Vui lòng nhập email để tìm kiếm");
      return;
    }

    try {
      setIsLoading(true);
      setUserData(null);
      setHasSearched(true);

      const response = await lookupApi(emailSearch.trim());
      setUserData(response.data.data);
    } catch {
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async (data: FriendInvitationRequest) => {
    if (!userData?.email) return;
    try {
      setIsSending(true);
      await sendInvitationApi(data);
      toast.success("Đã gửi lời mời kết bạn thành công!");

      onFriendAdded?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể gửi lời mời kết bạn"));
    } finally {
      setIsSending(false);
    }
  };

  const handleMessageUser = async (data: CreateOrGetDirectRoomRequest) => {
    if (!userData?.email) return;
    try {
      setIsSending(true);

      const roomResponse = (await createOrGetDirectRoomApi(data)).data.data;

      if (setSelectedChat) {
        setSelectedChat(roomResponse);
        setIsOpen(false);
        toast.success("Đang chuyển đến cuộc trò chuyện...");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleLookup();
    }
  };

  const getFriendshipStatus = () => {
    if (!userData?.friendshipSummary) {
      return {
        status: "none",
        text: "Chưa kết bạn",
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        icon: UserPlus,
        canSendRequest: true,
      };
    }

    const { friendshipStatus } = userData.friendshipSummary;

    switch (friendshipStatus) {
      case "ACCEPTED":
        return {
          status: "accepted",
          text: "Đã là bạn bè",
          color: "text-green-600",
          bgColor: "bg-green-100",
          icon: UserCheck,
          canSendRequest: false,
        };
      case "PENDING":
        return {
          status: "pending",
          text: "Đang chờ phản hồi",
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          icon: Clock,
          canSendRequest: false,
        };
      default:
        return {
          status: "none",
          text: "Chưa kết bạn",
          color: "text-gray-500",
          bgColor: "bg-gray-100",
          icon: UserPlus,
          canSendRequest: true,
        };
    }
  };

  const friendshipStatus = userData ? getFriendshipStatus() : null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setEmailSearch("");
          setUserData(null);
          setHasSearched(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="lg" className="h-10 w-10 p-0">
          <UserPlus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Tìm kiếm người dùng</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email người dùng
            </label>
            <div className="flex space-x-2 mt-2">
              <Input
                id="email"
                type="email"
                placeholder="Nhập email để tìm kiếm..."
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleLookup}
                disabled={isLoading || !emailSearch.trim()}
                size="sm"
              >
                {isLoading ? (
                  <LoadingSpinner className="w-4 h-4" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <LoadingSpinner className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Đang tìm kiếm...</p>
            </div>
          )}

          {/* User Result */}
          {userData && !isLoading && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={userData.avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-sm font-medium">
                    {userData.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userData.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userData.email}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={() =>
                    handleMessageUser({ targetUserId: userData.id })
                  }
                  size="sm"
                  variant="outline"
                  className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Nhắn tin
                </Button>

                {friendshipStatus?.canSendRequest && (
                  <Button
                    onClick={() =>
                      handleSendFriendRequest({ targetUserId: userData.id })
                    }
                    disabled={isSending}
                    size="sm"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isSending ? (
                      <>
                        <LoadingSpinner className="w-4 h-4 mr-2" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Kết bạn
                      </>
                    )}
                  </Button>
                )}
              </div>

              {friendshipStatus?.status === "pending" && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  Lời mời kết bạn đã được gửi. Vui lòng chờ phản hồi từ người
                  dùng.
                </div>
              )}

              {friendshipStatus?.status === "accepted" && (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                  Bạn và {userData.name} đã là bạn bè. Có thể bắt đầu trò
                  chuyện!
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && hasSearched && !userData && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Không tìm thấy người dùng với email này</p>
              <p className="text-xs mt-1">
                Vui lòng kiểm tra lại email và thử lại
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
