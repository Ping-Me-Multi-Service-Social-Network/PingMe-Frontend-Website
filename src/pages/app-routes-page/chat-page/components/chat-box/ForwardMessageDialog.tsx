
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
              <div className="flex flex-col gap-1">
                {rooms.map((room) => {
                  const isChecked = selectedRoomIds.includes(room.roomId);
                  const roomName = room.name ?? "Chat";
                  return (
                    <div
                      key={room.roomId}
                      className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                      onClick={() => handleToggleRoom(room.roomId)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="pointer-events-none h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={room.roomImgUrl || "/placeholder.svg"} />
                        <UserAvatarFallback name={roomName} />
                      </Avatar>
                      <span className="text-sm flex-1 truncate font-medium">
                        {roomName}
                      </span>
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
