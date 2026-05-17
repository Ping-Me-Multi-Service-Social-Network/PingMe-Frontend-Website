import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/features/store";
import { MusicSocketManager } from "@/features/websocket/core/musicSocketManager";
import { leaveSession, joinSessionStart, clearError, sessionStateReceived } from "@/features/music/musicSessionSlice";
import type {
  MusicSessionCommandRequest,
  PlayPayload,
  QueuePayload,
  StartSessionPayload,
} from "@/types/music/musicSession";
import { getMusicSessionStateApi } from "@/services/music/musicSessionApi";

// =================================================================
// Hook: useMusicSession
// Quản lý toàn bộ vòng đời kết nối Music WS cho một phiên nghe chung.
// =================================================================

interface UseMusicSessionOptions {
  /** hostUserId: ID của người tạo phiên nghe chung.
   *  - Nếu bạn là Host, truyền vào ID của chính bạn.
   *  - Nếu bạn là người nghe, truyền vào ID của bạn bè (Host). */
  hostUserId: string | null;
  /** ID của người dùng hiện đang đăng nhập */
  currentUserId: string | null;
  /** Callback khi phiên bị giải tán (host tắt nhạc và bài hiện tại kết thúc) */
  onSessionEnded?: () => void;
  /** Optional JWT token for non-friend session joining (share link) */
  sessionToken?: string;
}

export function useMusicSession({
  hostUserId,
  currentUserId,
  onSessionEnded,
  sessionToken,
}: UseMusicSessionOptions) {
  const dispatch = useDispatch<AppDispatch>();
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL || '';

  // Ref để tránh stale closure trong callback
  const onSessionEndedRef = useRef(onSessionEnded);
  onSessionEndedRef.current = onSessionEnded;

  // Lấy state từ Redux
  const session = useSelector((state: RootState) => state.musicSession.session);
  const isConnected = useSelector((state: RootState) => state.musicSession.isConnected);
  const isConnecting = useSelector((state: RootState) => state.musicSession.isConnecting);
  const isHost = useSelector((state: RootState) => state.musicSession.isHost);
  const error = useSelector((state: RootState) => state.musicSession.error);

  // =================================================================
  // Lifecycle: Connect khi hostUserId thay đổi, Disconnect khi unmount
  // =================================================================

  useEffect(() => {
    if (!hostUserId || !currentUserId) return;

    dispatch(joinSessionStart({ hostUserId, currentUserId, sessionToken }));

    MusicSocketManager.connect(hostUserId, {
      baseUrl,
      dispatch,
      sessionToken,  // Pass optional token for non-friend session joining
      onSessionEnded: () => {
        onSessionEndedRef.current?.();
      },
    });

    // Fetch trạng thái ban đầu ngay khi kết nối để đồng bộ (đặc biệt khi host đang pause)
    const fetchInitialState = async () => {
      try {
        const res = await getMusicSessionStateApi(hostUserId);
        if (res.data) {
          dispatch(sessionStateReceived(res.data));
        }

        // Gửi lệnh để đăng ký vào phòng
        const isHostNow = String(hostUserId) === String(currentUserId);
        const command = isHostNow ? "START_SESSION" : "JOIN_SESSION";
        MusicSocketManager.sendCommand(hostUserId, { command, payload: null });
      } catch (err: any) {
        // Nếu là 404 (chưa có session) thì im lặng, đợi WebSocket gửi state sau
        if (err?.status !== 404 && err?.response?.status !== 404) {
          console.error("[useMusicSession] Không thể lấy trạng thái ban đầu:", err);
        }
      }
    };

    fetchInitialState();

    return () => {
      // Khi component unmount -> thông báo rời phòng và disconnect
      // Chỉ gửi LEAVE_SESSION nếu mình là Listener, Host sẽ quản lý session qua lệnh STOP_SESSION
      const isHostNow = String(hostUserId) === String(currentUserId);
      if (hostUserId && !isHostNow) {
        MusicSocketManager.sendCommand(hostUserId, { command: "LEAVE_SESSION" });
      }
      MusicSocketManager.disconnect();
      dispatch(leaveSession());
    };
  }, [hostUserId, currentUserId, baseUrl, dispatch, sessionToken]);

  // =================================================================
  // Các hàm gửi lệnh (chỉ Host mới được dùng hầu hết)
  // =================================================================

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

  // =================================================================
  // Drift Correction: Tính vị trí nhạc chính xác dựa trên server time
  // Dùng khi cần seek thẻ <audio> về đúng giây đang phát chung
  // =================================================================

  const getCalculatedPositionMs = useCallback((): number => {
    if (!session?.isPlaying) {
      return session?.positionMs ?? 0;
    }
    // Tính thời gian đã trôi qua kể từ lúc server bắt đầu phát
    const elapsed = Date.now() - session.startedAtEpochMs;
    return session.positionMs + elapsed;
  }, [session]);

  return {
    // Dữ liệu session
    session,
    isConnected,
    isConnecting,
    isHost,
    error,

    // Tiện ích
    getCalculatedPositionMs,

    // Các lệnh gửi lên server
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
