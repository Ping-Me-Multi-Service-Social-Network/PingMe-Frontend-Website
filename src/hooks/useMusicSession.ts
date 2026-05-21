import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/features/store";
import { MusicSocketManager } from "@/features/websocket/core/musicSocketManager";
import { joinSessionStart, clearError, sessionStateReceived } from "@/features/music/musicSessionSlice";
import type {
  MusicSessionCommandRequest,
  PlayPayload,
  QueuePayload,
  StartSessionPayload,
} from "@/types/music/musicSession";
import { getMusicSessionStateApi } from "@/services/music/musicSessionApi";

interface UseMusicSessionOptions {
  hostUserId: string | null;
  currentUserId: string | null;
  onSessionEnded?: () => void;
  sessionToken?: string;
}

export function useMusicSession({
  hostUserId,
  currentUserId,
  onSessionEnded,
  sessionToken,
}: UseMusicSessionOptions) {
  const dispatch = useDispatch<AppDispatch>();
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL || "";

  const onSessionEndedRef = useRef(onSessionEnded);
  onSessionEndedRef.current = onSessionEnded;

  const session = useSelector((state: RootState) => state.musicSession.session);
  const isConnected = useSelector((state: RootState) => state.musicSession.isConnected);
  const isConnecting = useSelector((state: RootState) => state.musicSession.isConnecting);
  const isHost = useSelector((state: RootState) => state.musicSession.isHost);
  const error = useSelector((state: RootState) => state.musicSession.error);

  useEffect(() => {
    if (!hostUserId || !currentUserId) return;

    dispatch(joinSessionStart({ hostUserId, currentUserId, sessionToken }));

    MusicSocketManager.connect(hostUserId, {
      baseUrl,
      dispatch,
      sessionToken,
      onSessionEnded: () => {
        onSessionEndedRef.current?.();
      },
    });

    const fetchInitialState = async () => {
      const isHostNow = String(hostUserId) === String(currentUserId);

      try {
        // Listener should sync immediately from server state.
        // Host may not have persisted session yet, so skip GET to avoid noisy 404.
        // Token-based joins are validated via WebSocket subscribe headers (X-Session-Token).
        // The REST endpoint does not accept the session token, so it will return 403 for non-friends.
        if (!isHostNow && !sessionToken) {
          const res = await getMusicSessionStateApi(hostUserId);
          if (res.data) {
            dispatch(sessionStateReceived(res.data));
          }
        }

        const command = isHostNow ? "START_SESSION" : "JOIN_SESSION";
        MusicSocketManager.sendCommand(hostUserId, { command, payload: null });
      } catch (err: any) {
        // 404 = session not started yet (expected for host/start race)
        // 403 = non-friend join path (expected when joining via share token)
        const status = err?.status ?? err?.response?.status;
        if (status !== 404 && status !== 403) {
          console.error("[useMusicSession] Failed to fetch initial session state:", err);
        }
      }
    };

    fetchInitialState();

    return () => {
      const isHostNow = String(hostUserId) === String(currentUserId);
      if (hostUserId && !isHostNow && MusicSocketManager.isConnected()) {
        MusicSocketManager.sendCommand(hostUserId, { command: "LEAVE_SESSION" });
      }
      MusicSocketManager.disconnect();
    };
  }, [hostUserId, currentUserId, baseUrl, dispatch, sessionToken]);

  const sendCommand = useCallback(
    (request: MusicSessionCommandRequest) => {
      if (!hostUserId) return;
      MusicSocketManager.sendCommand(hostUserId, request);
    },
    [hostUserId]
  );

  const startSession = useCallback(
    (payload?: StartSessionPayload) => {
      sendCommand({ command: "START_SESSION", payload: payload ?? null });
    },
    [sendCommand]
  );

  const joinSession = useCallback(() => {
    sendCommand({ command: "JOIN_SESSION" });
  }, [sendCommand]);

  const leaveSessionCommand = useCallback(() => {
    sendCommand({ command: "LEAVE_SESSION" });
  }, [sendCommand]);

  const play = useCallback(
    (payload?: PlayPayload) => {
      sendCommand({ command: "PLAY", payload: payload ?? null });
    },
    [sendCommand]
  );

  const pause = useCallback(
    (payload?: PlayPayload) => {
      sendCommand({ command: "PAUSE", payload: payload ?? null });
    },
    [sendCommand]
  );

  const seek = useCallback(
    (positionMs: number, currentTrackId?: string) => {
      sendCommand({
        command: "SEEK",
        payload: { positionMs, currentTrackId: currentTrackId ?? null },
      });
    },
    [sendCommand]
  );

  const next = useCallback(() => {
    sendCommand({ command: "NEXT" });
  }, [sendCommand]);

  const prev = useCallback(
    (trackId?: string) => {
      sendCommand({ command: "PREV", payload: { trackId: trackId ?? null } });
    },
    [sendCommand]
  );

  const addToQueue = useCallback(
    (payload: QueuePayload) => {
      sendCommand({ command: "ADD_TO_QUEUE", payload });
    },
    [sendCommand]
  );

  const removeFromQueue = useCallback(
    (payload: QueuePayload) => {
      sendCommand({ command: "REMOVE_FROM_QUEUE", payload });
    },
    [sendCommand]
  );

  const stopSession = useCallback(() => {
    sendCommand({ command: "STOP_SESSION" });
  }, [sendCommand]);

  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const getCalculatedPositionMs = useCallback((): number => {
    if (!session?.isPlaying) {
      return session?.positionMs ?? 0;
    }
    const elapsed = Date.now() - session.startedAtEpochMs;
    return session.positionMs + elapsed;
  }, [session]);

  return {
    session,
    isConnected,
    isConnecting,
    isHost,
    error,
    getCalculatedPositionMs,
    startSession,
    joinSession,
    leaveSession: leaveSessionCommand,
    play,
    pause,
    seek,
    next,
    prev,
    addToQueue,
    removeFromQueue,
    stopSession,
    dismissError,
  };
}
