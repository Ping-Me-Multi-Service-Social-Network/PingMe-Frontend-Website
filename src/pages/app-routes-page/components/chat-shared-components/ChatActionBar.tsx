import { Button } from "@/components/ui/button.tsx";
import { Search, UserPlus, Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { UserLookupModal } from "./UserLookupModal.tsx";
import { GroupMemberModal } from "./GroupMemberModal.tsx";
import type { RoomResponse } from "@/types/chat/room";
import { useTranslation } from "react-i18next";

interface SharedTopBarProps {
  onFriendAdded?: () => void;
  setSelectedChat?: (room: RoomResponse) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function ChatActionBar({
  onFriendAdded,
  setSelectedChat,
  searchQuery,
  onSearchChange,
}: SharedTopBarProps) {
  const { t } = useTranslation("chat");

  return (
    <TooltipProvider>
      <div className="px-4 py-3 flex items-center gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={t("actionBar.search", "Tìm kiếm")}
            className="w-full h-9 pl-9 pr-4 bg-muted/50 border-none rounded-md text-sm focus:ring-1 focus:ring-primary/30 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex">
                <UserLookupModal
                  onFriendAdded={onFriendAdded}
                  setSelectedChat={setSelectedChat}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-9 w-9 p-0 hover:bg-muted">
                      <UserPlus className="w-5 h-5 text-[#001233]" strokeWidth={1.5} />
                    </Button>
                  }
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("actionBar.addFriend")}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex">
                <GroupMemberModal
                  mode="create"
                  onGroupCreated={setSelectedChat}
                  triggerButton={
                    <Button variant="ghost" size="icon" className="h-9 w-9 p-0 hover:bg-muted">
                      <Users className="w-5 h-5 text-[#001233]" strokeWidth={1.5} />
                    </Button>
                  }
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("actionBar.createGroup")}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
