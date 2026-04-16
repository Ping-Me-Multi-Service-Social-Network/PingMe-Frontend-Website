import { useEffect, useRef, useCallback } from "react";
import { SocketManager } from "@/features/websocket";

/**
 * Synthesizes a pleasant "ting" notification chime using Web Audio API.
 * No external audio file required.
 */
function playTingSound() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // --- First tone (higher pitch) ---
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1200, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.4);

    // --- Second tone (pleasant harmonic, slightly delayed) ---
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1600, ctx.currentTime + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.25);
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.5);

    // Clean up AudioContext after sound finishes
    setTimeout(() => ctx.close(), 600);
  } catch (err) {
    console.warn("[PingMe] Could not play notification sound:", err);
  }
}

interface UseNotificationSoundOptions {
  /** Current user ID – messages from this user won't trigger the sound */
  currentUserId?: number;
  /** Set to false to disable entirely */
  enabled?: boolean;
}

/**
 * Plays a "ting" notification sound when a new message arrives
 * while the browser tab is **not focused** (out of focus / hidden).
 *
 * Also updates the document title to show unread count.
 */
export function useNotificationSound({
  currentUserId,
  enabled = true,
}: UseNotificationSoundOptions) {
  const isTabVisibleRef = useRef(!document.hidden);
  const unreadCountRef = useRef(0);
  const originalTitleRef = useRef(document.title);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  // Track tab visibility via Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = !document.hidden;

      // When user comes back to the tab, reset unread count & title
      if (!document.hidden) {
        unreadCountRef.current = 0;
        document.title = originalTitleRef.current;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Restore title on unmount
      document.title = originalTitleRef.current;
    };
  }, []);

  // Update the stored original title when it changes externally
  useEffect(() => {
    if (!document.hidden) {
      originalTitleRef.current = document.title;
    }
  });

  const handleIncomingMessage = useCallback(
    (event: import("@/features/websocket/chat").RoomUpdatedEventPayload) => {
      if (!enabled) return;

      const lastMessage = event.roomResponse?.lastMessage;
      if (!lastMessage) return;

      // Don't duplicate ting for the same message
      if (seenMessageIdsRef.current.has(lastMessage.messageId)) return;
      seenMessageIdsRef.current.add(lastMessage.messageId);

      // Don't ting for our own messages
      if (currentUserId && lastMessage.senderId === currentUserId) return;

      // Don't ting for system messages
      if (lastMessage.messageType === "SYSTEM") return;

      // Only ting when tab is NOT visible
      if (!isTabVisibleRef.current) {
        playTingSound();

        // Update title to show unread count
        unreadCountRef.current += 1;
        document.title = `(${unreadCountRef.current}) ${originalTitleRef.current}`;
      }
    },
    [currentUserId, enabled],
  );

  // Subscribe to MESSAGE_CREATED events from WebSocket
  useEffect(() => {
    if (!enabled) return;

    const unsub = SocketManager.on("ROOM_UPDATED", handleIncomingMessage);
    return unsub;
  }, [enabled, handleIncomingMessage]);
}
