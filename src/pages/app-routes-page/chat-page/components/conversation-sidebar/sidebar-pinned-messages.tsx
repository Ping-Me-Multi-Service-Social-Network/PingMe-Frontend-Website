import { useState, useEffect, useRef, useCallback } from "react";
import { getPinnedMessagesApi, unpinMessageApi } from "@/services/chat";
import type { MessageResponse } from "@/types/chat/message";
import type { RoomParticipantResponse } from "@/types/chat/room";
import { ArrowLeft, Pin, X, Image as ImageIcon, File, Video, CloudRain } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/features/hooks.ts";
import { selectMessages, selectEditedMessages } from "@/features/websocket/state/chatSlice.ts";
import { toast } from "sonner";
import { format } from "date-fns";

interface SidebarPinnedMessagesProps {
  roomId: number;
  participants: RoomParticipantResponse[];
  onBack: () => void;
}

const getMessagePreview = (msg: MessageResponse) => {
  if (msg.type === "IMAGE") return <span className="flex items-center gap-1 text-blue-500"><ImageIcon className="w-3 h-3" /> Image</span>;
  if (msg.type === "VIDEO") return <span className="flex items-center gap-1 text-purple-500"><Video className="w-3 h-3" /> Video</span>;
  if (msg.type === "FILE") return <span className="flex items-center gap-1 text-orange-500"><File className="w-3 h-3" /> File</span>;
  if (msg.type === "WEATHER") return <span className="flex items-center gap-1 text-sky-500"><CloudRain className="w-3 h-3" /> Weather</span>;
  return msg.content || "";
};

const SidebarPinnedMessages = ({ roomId, participants, onBack }: SidebarPinnedMessagesProps) => {
  const { t } = useTranslation("chat");
  const [pinnedMessages, setPinnedMessages] = useState<MessageResponse[]>([]);
  const pinnedMessagesRef = useRef<MessageResponse[]>([]);

  // Keep ref in sync
  useEffect(() => {
    pinnedMessagesRef.current = pinnedMessages;
  }, [pinnedMessages]);

  const reduxMessages = useAppSelector(selectMessages);
  const editedMessages = useAppSelector(selectEditedMessages);

  const fetchPinnedMessages = useCallback(async () => {
    try {
      const res = await getPinnedMessagesApi(roomId);
      setPinnedMessages(res.data.data);
    } catch (err) {
      console.error("Failed to fetch pinned messages:", err);
    }
  }, [roomId]);

  useEffect(() => {
    fetchPinnedMessages();
  }, [fetchPinnedMessages]);

  // Sync pinned messages with Redux updates (MESSAGE_UPDATED)
  useEffect(() => {
    let hasChanges = false;
    let needsRefetch = false;
    const updatedPinned = [...pinnedMessagesRef.current];

    for (const [id, editedMsgObj] of Object.entries(editedMessages)) {
      const existingIdx = updatedPinned.findIndex(m => m.id === id);
      const editedMsg = editedMsgObj as Partial<MessageResponse>;
      
      if (editedMsg.isPinned === false || editedMsg.isActive === false) {
        if (existingIdx !== -1) {
          updatedPinned.splice(existingIdx, 1);
          hasChanges = true;
        }
      } else if (editedMsg.isPinned === true) {
        const fullMsg = reduxMessages.find(m => m.id === id);
        if (fullMsg && existingIdx === -1) {
          updatedPinned.unshift(fullMsg);
          hasChanges = true;
        } else if (existingIdx === -1) {
          needsRefetch = true;
        } else if (existingIdx !== -1) {
          updatedPinned[existingIdx] = { ...updatedPinned[existingIdx], ...editedMsg } as MessageResponse;
          hasChanges = true;
        }
      } else if (existingIdx !== -1) {
          updatedPinned[existingIdx] = { ...updatedPinned[existingIdx], ...editedMsg } as MessageResponse;
          hasChanges = true;
      }
    }
    
    for (const msg of reduxMessages) {
        const existingIdx = updatedPinned.findIndex(m => m.id === msg.id);
        if (msg.isPinned && existingIdx === -1 && msg.isActive) {
            updatedPinned.unshift(msg);
            hasChanges = true;
        }
        if (!msg.isActive && existingIdx !== -1) {
            updatedPinned.splice(existingIdx, 1);
            hasChanges = true;
        }
    }

    if (needsRefetch) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fetchPinnedMessages();
    } else if (hasChanges) {
      updatedPinned.sort((a, b) => {
        const timeA = new Date(a.pinnedAt || a.createdAt).getTime();
        const timeB = new Date(b.pinnedAt || b.createdAt).getTime();
        return timeB - timeA;
      });
      setPinnedMessages(updatedPinned);
    }
  }, [editedMessages, reduxMessages, fetchPinnedMessages]);

  const handleUnpin = async (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    try {
      await unpinMessageApi(messageId);
      toast.success(t("bubbles.messages.unpinSuccess", "Message unpinned"));
      setPinnedMessages(prev => prev.filter(m => m.id !== messageId));
    } catch {
      toast.error(t("bubbles.messages.unpinError", "Could not unpin message"));
    }
  };

  const handleMessageClick = (msg: MessageResponse) => {
    const element = document.getElementById(`message-${msg.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-orange-50', 'dark:bg-orange-950/30', 'transition-colors', 'duration-1000');
      setTimeout(() => {
        element.classList.remove('bg-orange-50', 'dark:bg-orange-950/30');
      }, 2000);
    } else {
      toast.info(t("bubbles.messages.messageNotLoaded", "Message not loaded"));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h3 className="font-semibold text-gray-900">{t("sidebar.pinnedMessages", "Pinned Messages")}</h3>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="p-4 space-y-3">
          {pinnedMessages.length === 0 ? (
            <div className="text-center py-8 px-4 text-gray-500">
              <Pin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm">{t("bubbles.messages.emptyPinned", "No pinned messages")}</p>
            </div>
          ) : (
            pinnedMessages.map(msg => (
              <div 
                key={msg.id}
                onClick={() => handleMessageClick(msg)}
                className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {msg.senderId ? (participants.find(p => p.userId === msg.senderId)?.name || t("bubbles.messages.pinnedMsg", "Pinned message")) : "Pinned message"}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {format(new Date(msg.createdAt), "HH:mm dd/MM")}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50 shrink-0"
                    onClick={(e) => handleUnpin(e, msg.id)}
                    title={t("bubbles.messages.unpinBtn", "Unpin")}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="text-sm text-gray-600 line-clamp-3 break-words">
                  {getMessagePreview(msg)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarPinnedMessages;
