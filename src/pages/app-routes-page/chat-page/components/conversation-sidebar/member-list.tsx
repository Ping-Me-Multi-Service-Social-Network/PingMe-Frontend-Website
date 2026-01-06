import type { RoomParticipantResponse } from "@/types/chat/room";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ArrowLeft, UserPlus, Search, MoreVertical } from "lucide-react";
import { useState } from "react";
import { GroupMemberModal } from "@/pages/app-routes-page/components/chat-shared-components/GroupMemberModal.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { removeGroupMemberApi, changeMemberRole } from "@/services/chat";
import { toast } from "sonner";
import { useAppSelector } from "@/features/hooks.ts";

const canAddMembers = (
  currentUserRole: "OWNER" | "ADMIN" | "MEMBER" | null
): boolean => {
  return currentUserRole === "OWNER" || currentUserRole === "ADMIN";
};

const canManageMember = (
  currentUserRole: "OWNER" | "ADMIN" | "MEMBER" | null,
  targetRole: "OWNER" | "ADMIN" | "MEMBER",
  isCurrentUser: boolean
): boolean => {
  if (isCurrentUser) return false;
  if (currentUserRole === "MEMBER") return false;
  if (currentUserRole === "ADMIN") return targetRole === "MEMBER";
  if (currentUserRole === "OWNER") return true;
  return false;
};

const canChangeRole = (
  currentUserRole: "OWNER" | "ADMIN" | "MEMBER" | null,
  targetRole: "OWNER" | "ADMIN" | "MEMBER"
): boolean => {
  return (
    currentUserRole === "OWNER" &&
    (targetRole === "ADMIN" || targetRole === "MEMBER")
  );
};

interface MemberListProps {
  participants: RoomParticipantResponse[];
  roomType: "DIRECT" | "GROUP";
  roomId: number;
  onBack: () => void;
}

const MemberList = ({
  participants,
  roomType,
  roomId,
  onBack,
}: MemberListProps) => {
  const { userSession } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");

  const currentUserRole =
    participants.find((p) => p.userId === userSession?.id)?.role || null;

  // Sort participants: OWNER first, then ADMIN, then MEMBER
  const sortedParticipants = [...participants].sort((a, b) => {
    const roleOrder = { OWNER: 0, ADMIN: 1, MEMBER: 2 };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  // Filter participants based on search query
  const filteredParticipants = sortedParticipants.filter((participant) =>
    participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleDescription = (role: "OWNER" | "ADMIN" | "MEMBER") => {
    if (role === "OWNER") return "Trưởng nhóm";
    if (role === "ADMIN") return "Phó nhóm";
    return null;
  };

  const handleRemoveMember = async (userId: number, name: string) => {
    try {
      await removeGroupMemberApi(roomId, userId);
      toast.success(`${name} đã bị xóa khỏi nhóm`);
    } catch {
      toast.error("Không thể xóa thành viên khỏi nhóm");
    }
  };

  const handleChangeRole = async (
    userId: number,
    name: string,
    currentRole: "ADMIN" | "MEMBER"
  ) => {
    const newRole = currentRole === "ADMIN" ? "MEMBER" : "ADMIN";
    try {
      await changeMemberRole(roomId, userId, newRole);
      toast.success(
        `${name} đã được ${newRole === "ADMIN" ? "thêm" : "gỡ"} quyền phó nhóm`
      );
    } catch {
      toast.error("Không thể thay đổi quyền thành viên");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h3 className="font-semibold text-gray-900">Thành viên</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {roomType === "GROUP" && canAddMembers(currentUserRole) && (
            <GroupMemberModal
              mode="add"
              currentMembers={participants}
              roomId={roomId}
              triggerButton={
                <Button className="w-full justify-start gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                  <UserPlus className="h-4 w-4" />
                  Thêm thành viên
                </Button>
              }
            />
          )}

          {/* Title with member count */}
          <div>
            <h4 className="font-medium text-sm text-gray-900">
              Danh sách thành viên ({participants.length})
            </h4>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm thành viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Members list */}
          <div className="space-y-1">
            {filteredParticipants.map((participant) => {
              const roleDescription = getRoleDescription(participant.role);
              const isCurrentUser = participant.userId === userSession?.id;
              const showActions = canManageMember(
                currentUserRole,
                participant.role,
                isCurrentUser
              );

              return (
                <div
                  key={participant.userId}
                  className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg transition-colors group"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={participant.avatarUrl || "/placeholder.svg"}
                      alt={participant.name}
                    />
                    <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                      {participant.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {participant.name}
                    </p>
                    {roleDescription && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {roleDescription}
                      </p>
                    )}
                  </div>

                  {roomType === "GROUP" && showActions && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canChangeRole(currentUserRole, participant.role) && (
                          <>
                            {participant.role === "ADMIN" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(
                                    participant.userId,
                                    participant.name,
                                    "ADMIN"
                                  )
                                }
                              >
                                Gỡ quyền phó nhóm
                              </DropdownMenuItem>
                            )}
                            {participant.role === "MEMBER" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(
                                    participant.userId,
                                    participant.name,
                                    "MEMBER"
                                  )
                                }
                              >
                                Thêm phó nhóm
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            handleRemoveMember(
                              participant.userId,
                              participant.name
                            )
                          }
                          className="text-red-600 focus:text-red-600"
                        >
                          Xóa khỏi nhóm
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberList;
