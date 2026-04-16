
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";
import { UserAvatarFallback } from "@/components/custom/UserAvatarFallback.tsx";
import type { RoomResponse } from "@/types/chat/room";
import { useAppSelector } from "@/features/hooks";
import { getRoomDisplayName, getRoomAvatar } from "@/pages/app-routes-page/chat-page/utils/getRoomInfo.ts";
import { Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUserRoomsApi, forwardMessageApi, bulkForwardMessageApi } from "@/services/chat";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";

interface ForwardMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceMessageId: string | null;
}

export function ForwardMessageDialog({ isOpen, onClose, sourceMessageId }: ForwardMessageDialogProps) {
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userSession = useAppSelector((state) => state.auth.userSession);

  useEffect(() => {
    if (isOpen) {
      fetchRooms();
      setSelectedRoomIds([]);
    }
  }, [isOpen]);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      // Fetching a large size to allow user to view most recent chats
      const res = await getCurrentUserRoomsApi({ page: 1, size: 100 });
      setRooms(res.data.data.content);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load chats for forwarding."));
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleToggleRoom = (roomId: number) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleForward = async () => {
    if (!sourceMessageId) return;
    if (selectedRoomIds.length === 0) {
      toast.error("Please select at least one chat to forward to.");
      return;
    }

    setIsSubmitting(true);
    try {
      const clientMsgId = crypto.randomUUID();
      
      if (selectedRoomIds.length === 1) {
        await forwardMessageApi({
          sourceMessageId,
          clientMsgId,
          targetRoomId: selectedRoomIds[0],
        });
      } else {
        await bulkForwardMessageApi({
          sourceMessageId,
          clientMsgId,
          targetRoomIds: selectedRoomIds,
        });
      }
      
      toast.success("Message forwarded successfully.");
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to forward message."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forward Message</DialogTitle>
        </DialogHeader>

        {loadingRooms ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh] h-[300px] border rounded-md p-2">
            {rooms.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                No recent chats available.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {rooms.map((room) => {
                  const isChecked = selectedRoomIds.includes(room.roomId);
                  const roomName = getRoomDisplayName(room, userSession);
                  const avatarImg = getRoomAvatar(room, userSession) || "/placeholder.svg";
                  const isGroup = room.roomType === "GROUP";

                  return (
                    <div
                      key={room.roomId}
                      className={cn(
                        "flex items-center space-x-3 p-2.5 rounded-lg border cursor-pointer transition-all",
                        isChecked 
                          ? "bg-primary/5 border-primary/30 shadow-sm" 
                          : "border-transparent hover:bg-muted/80"
                      )}
                      onClick={() => handleToggleRoom(room.roomId)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="pointer-events-none h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="relative shrink-0">
                        <Avatar className="h-10 w-10 border shadow-sm">
                          <AvatarImage src={avatarImg} className="object-cover" />
                          <UserAvatarFallback name={roomName} />
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-[2px] border shadow-sm">
                          {isGroup ? (
                            <Users className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {roomName}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                          {isGroup ? "Group" : "Direct"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        )}

        <DialogFooter className="sm:justify-between items-center mt-2 border-t pt-4">
          <span className="text-xs text-muted-foreground font-medium">
            {selectedRoomIds.length} selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleForward}
              disabled={selectedRoomIds.length === 0 || isSubmitting}
            >
              {isSubmitting ? <LoadingSpinner className="w-4 h-4 mr-2" /> : null}
              Send
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
