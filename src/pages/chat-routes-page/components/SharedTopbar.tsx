import { Button } from "@/components/ui/button.tsx";
import { Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { UserLookupModal } from "./UserLookupModal.tsx";
import { GroupMemberModal } from "./GroupMemberModal.tsx";
import type { RoomResponse } from "@/types/chat/room";

interface SharedTopBarProps {
  onFriendAdded?: () => void;
  setSelectedChat?: (room: RoomResponse) => void;
}

export function SharedTopBar({
  onFriendAdded,
  setSelectedChat,
}: SharedTopBarProps) {
  return (
    <TooltipProvider>
      <div className="p-4">
        <div className="flex items-center justify-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="lg" className="h-10 w-10 p-0">
                <Search className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tìm kiếm</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <UserLookupModal
                  onFriendAdded={onFriendAdded}
                  setSelectedChat={setSelectedChat}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Thêm bạn</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <GroupMemberModal
                  mode="create"
                  onGroupCreated={setSelectedChat}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tạo nhóm chat</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
