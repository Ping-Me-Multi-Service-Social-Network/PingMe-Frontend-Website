import type React from "react";
import { useState, useEffect, useRef, memo, useCallback } from "react";
import { getPinnedMessagesApi, unpinMessageApi } from "@/services/chat";
import type { MessageResponse } from "@/types/chat/message";
import type { RoomResponse } from "@/types/chat/room";
import { Pin, ChevronDown, ChevronUp, X, Image as ImageIcon, File, Video, CloudRain, StickyNote, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/features/hooks.ts";
import { selectMessages, selectEditedMessages } from "@/features/websocket/chat";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  decryptTextMessageForRoom,
  decryptTextMessagesForRoom,
  getRoomTextEncryptionMaterial,
} from "../../utils/textMessageCrypto";

interface ChatPinnedMessagesProps {
  room: RoomResponse;
}

export const ChatPinnedMessages = memo(({ room }: ChatPinnedMessagesProps) => {
  const { t } = useTranslation("chat");
  const roomId = room.roomId;
  const participants = room.participants;
  const roomCryptoMaterial = getRoomTextEncryptionMaterial(room);
  const [pinnedMessages, setPinnedMessages] = useState<MessageResponse[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const pinnedMessagesRef = useRef(pinnedMessages);
  useEffect(() => {
    pinnedMessagesRef.current = pinnedMessages;
  }, [pinnedMessages]);

  const reduxMessages = useAppSelector(selectMessages);
  const editedMessages = useAppSelector(selectEditedMessages);

  const fetchPinnedMessages = useCallback(async () => {
    try {
      const res = await getPinnedMessagesApi(roomId);
      setPinnedMessages(await decryptTextMessagesForRoom(res.data.data, room));
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to fetch pinned messages:", err);
    }
  }, [roomId, room, roomCryptoMaterial]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchPinnedMessages();
  }, [fetchPinnedMessages]);

  // Sync pinned messages with Redux updates (MESSAGE_UPDATED)
  useEffect(() => {
    let active = true;

    const syncPinnedMessages = async () => {
    let hasChanges = false;
    let needsRefetch = false;
    const updatedPinned = [...pinnedMessagesRef.current];

    // Check if any pinned message was unpinned or recalled or edited
    for (const [id, editedMsgObj] of Object.entries(editedMessages)) {
      const existingIdx = updatedPinned.findIndex(m => m.id === id);
      const editedMsg = editedMsgObj as Partial<MessageResponse>;
      
      if (editedMsg.isPinned === false || editedMsg.isActive === false) {
        if (existingIdx !== -1) {
          updatedPinned.splice(existingIdx, 1);
          hasChanges = true;
        }
      } else if (editedMsg.isPinned === true) {
        // Find it in redux messages to get full data
        const fullMsg = reduxMessages.find(m => m.id === id);
        if (fullMsg && existingIdx === -1) {
          updatedPinned.unshift(await decryptTextMessageForRoom(fullMsg, room)); // prepend newly pinned
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
    
    // Also check if any message in reduxMessages is pinned but not in our list
    for (const msg of reduxMessages) {
        const existingIdx = updatedPinned.findIndex(m => m.id === msg.id);
        if (msg.isPinned && existingIdx === -1 && msg.isActive) {
            updatedPinned.unshift(await decryptTextMessageForRoom(msg, room));
            hasChanges = true;
        }
        // remove recalled messages
        if (!msg.isActive && existingIdx !== -1) {
            updatedPinned.splice(existingIdx, 1);
            hasChanges = true;
        }
    }

    if (needsRefetch) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fetchPinnedMessages();
    } else if (hasChanges) {
      // Sort by pinnedAt desc
      updatedPinned.sort((a, b) => {
        const timeA = new Date(a.pinnedAt || a.createdAt).getTime();
        const timeB = new Date(b.pinnedAt || b.createdAt).getTime();
        return timeB - timeA;
      });
      if (active) {
        setPinnedMessages(await decryptTextMessagesForRoom(updatedPinned, room));
      }
    }
    };

    syncPinnedMessages();

    return () => {
      active = false;
    };
  }, [editedMessages, reduxMessages, fetchPinnedMessages, room, roomCryptoMaterial]);


  const handleUnpin = async (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    try {
      await unpinMessageApi(messageId);
      toast.success(t("bubbles.messages.unpinSuccess", "Message unpinned"));
      setPinnedMessages(prev => {
        const newPinned = prev.filter(m => m.id !== messageId);
        if (newPinned.length <= 1) setIsOpen(false);
        return newPinned;
      });
    } catch {
      toast.error(t("bubbles.messages.unpinError", "Could not unpin message"));
    }
  };

  const scrollToMessage = (messageId: string) => {
    const el = document.getElementById(`message-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-primary/20', 'transition-colors', 'duration-500', 'rounded-lg');
      setTimeout(() => el.classList.remove('bg-primary/20'), 1500);
      setIsOpen(false);
    } else {
      toast.info(t("bubbles.messages.messageNotLoaded", "Message is not loaded yet"));
    }
  };

  const getMessagePreview = (message: MessageResponse) => {
    if (!message.isActive) return t("bubbles.messages.recalled", "Message recalled");
    switch (message.type) {
      case "IMAGE": return <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {t("bubbles.messages.image", "Image")}</span>;
      case "VIDEO": return <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {t("bubbles.messages.video", "Video")}</span>;
      case "FILE": return <span className="flex items-center gap-1"><File className="w-3 h-3" /> {t("bubbles.messages.file", "File")}</span>;
      case "WEATHER": return <span className="flex items-center gap-1"><CloudRain className="w-3 h-3" /> {t("bubbles.messages.weather", "Weather")}</span>;
      case "POLL": return <span className="flex items-center gap-1">[{t("input.createPollTitle", "Poll")}] {message.poll?.question}</span>;
      case "NOTE": return <span className="flex items-center gap-1"><StickyNote className="w-3 h-3" /> {message.note?.title ?? message.content}</span>;
      case "REMINDER": return <span className="flex items-center gap-1"><Bell className="w-3 h-3" /> {message.reminder?.title ?? message.content}</span>;
      default: return message.content;
    }
  };

  if (pinnedMessages.length === 0) return null;

  const latestPinned = pinnedMessages[0];

  return (
    <div className="relative z-20 w-full bg-background border-b shadow-sm">
      <div 
        className="flex items-center px-4 py-2 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Pin className="w-4 h-4 text-orange-500 mr-3 shrink-0" />
        <div className="flex-1 min-w-0">
          {pinnedMessages.length > 1 ? (
            <div className="text-sm font-medium text-primary">
              {t("bubbles.messages.pinnedCount", { count: pinnedMessages.length, defaultValue: "{{count}} pinned messages" })}
            </div>
          ) : null}
          <div className="text-xs text-muted-foreground truncate max-w-full">
             {getMessagePreview(latestPinned)}
          </div>
        </div>
        <div className="shrink-0 ml-2 text-muted-foreground">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute top-full left-0 right-0 bg-background border-b shadow-md overflow-hidden z-30"
          >
            <div className="max-h-64 overflow-y-auto p-2 flex flex-col gap-1">
              {pinnedMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className="flex items-center p-2 rounded-md hover:bg-accent cursor-pointer group"
                  onClick={() => scrollToMessage(msg.id)}
                >
                  <div className="flex-1 min-w-0 flex flex-col">
                     <span className="text-xs font-medium text-foreground mb-0.5 truncate">
                        {msg.senderId ? (participants.find(p => p.userId === msg.senderId)?.name || t("bubbles.messages.pinnedMsg", "Pinned message")) : "Pinned message"}
                     </span>
                     <span className="text-xs text-muted-foreground truncate">
                        {getMessagePreview(msg)}
                     </span>
                  </div>
                  <button 
                    onClick={(e) => handleUnpin(e, msg.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-black/5"
                    title={t("bubbles.messages.unpinBtn", "Unpin message")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default ChatPinnedMessages;
