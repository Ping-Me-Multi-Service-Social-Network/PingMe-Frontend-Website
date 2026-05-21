import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/features/store";
import { clearError, joinSessionStart, leaveSession } from "@/features/music/musicSessionSlice";
import { ListenerAvatarRow } from "./ListenerAvatarRow";
import { CoListeningBanner } from "./CoListeningBanner";
import { FriendListeningList } from "./FriendListeningList";
import { Button } from "@/components/ui/button";
import { SessionShareModal } from "../dialogs/SessionShareModal";
import { UsersRound, PlayCircle, LogOut, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MusicSocketManager } from "@/features/websocket/core/musicSocketManager";
import { lookupByIdApi } from "@/services/user/userLookupApi";
import type { UserSummarySimpleResponse } from "@/types/common/userSummarySimpleResponse";
import { toast } from "sonner";

// Helper function to fetch missing user profiles, keeping function nesting clean
async function fetchUserProfiles(ids: string[]): Promise<(UserSummarySimpleResponse | null)[]> {
  return Promise.all(
    ids.map(async (id) => {
      try {
        const res = await lookupByIdApi(Number(id));
        return res.data?.data ?? null;
      } catch {
        return null;
      }
    })
  );
}

// =================================================================
// CoListeningSection - Ná»™i dung tab "Nghe chung" trong Right Panel
// =================================================================

export default function CoListeningSection() {
  const currentUser = useSelector((state: RootState) => state.auth.userSession);
  const currentUserId = useSelector(
    (state: RootState) => state.auth.userSession?.id?.toString()
  );

  // Trạng thái Redux
  const sessionState = useSelector((state: RootState) => state.musicSession.session);
  const activeHostUserId = useSelector((state: RootState) => state.musicSession.activeHostUserId);
  const isConnecting = useSelector((state: RootState) => state.musicSession.isConnecting);
  const isConnected = useSelector((state: RootState) => state.musicSession.isConnected);
  const isHost = useSelector((state: RootState) => state.musicSession.isHost);
  const error = useSelector((state: RootState) => state.musicSession.error);
  const sessionToken = useSelector((state: RootState) => state.musicSession.sessionToken);
  const currentSong = useSelector((state: RootState) => state.audioPlayer.currentSong);

  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const [usersById, setUsersById] = useState<Record<string, UserSummarySimpleResponse>>({});
  const lastToastErrorRef = useRef<string | null>(null);

  // Handle URL-based session joining (share link)
  useEffect(() => {
    const token = searchParams.get("token");
    const hostId = searchParams.get("join-session");

    if (token && hostId) {
      // Auto-join session with token
      handleJoinWithToken(hostId, token);
      // Remove query params so clicking the same invite again doesn't re-trigger join logic.
      navigate("/app/music", { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    // When joining via invite token and it fails (expired/revoked), notify user immediately.
    if (!sessionToken) return;
    if (isConnected) return;
    if (!error) return;

    if (lastToastErrorRef.current === error) return;
    lastToastErrorRef.current = error;
    toast.error(error);
  }, [sessionToken, isConnected, error]);

  useEffect(() => {
    const participantIds = [activeHostUserId, ...(sessionState?.activeListenerIds ?? [])]
      .filter((id): id is string => Boolean(id));
    const missingIds = [...new Set(participantIds)]
      .filter((id) => id !== currentUserId && !usersById[id] && Number.isFinite(Number(id)));

    if (missingIds.length === 0) return;

    let cancelled = false;

    fetchUserProfiles(missingIds).then((profiles) => {
      if (cancelled) return;

      const validProfiles = profiles.filter((p): p is UserSummarySimpleResponse => p !== null);
      if (validProfiles.length === 0) return;

      setUsersById((prev) => {
        const next = { ...prev };
        for (const profile of validProfiles) {
          next[String(profile.id)] = profile;
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [activeHostUserId, currentUserId, sessionState?.activeListenerIds, usersById]);

  const getUserInfo = (id: string) => {
    if (id === currentUserId && currentUser) {
      return {
        name: `${currentUser.name || "Bạn"} (bạn)`,
        avatarUrl: currentUser.avatarUrl,
      };
    }

    const profile = usersById[id];
    if (profile) {
      return {
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      };
    }

    return { name: "Đang tải...", avatarUrl: null };
  };

  const handleStartSession = () => {
    if (!currentUserId) return;
    if (!currentSong) {
      toast.error("Bạn cần phát một bài hát trước khi bắt đầu làm Host.");
      return;
    }
    dispatch(joinSessionStart({ hostUserId: currentUserId, currentUserId }));
  };

  const handleJoinWithToken = (hostId: string, token: string) => {
    if (!currentUserId) return;
    dispatch(joinSessionStart({ hostUserId: hostId, currentUserId, sessionToken: token }));
  };

  const handleLeaveSession = () => {
    if (globalThis.confirm("Bạn có chắc chắn muốn rời khỏi phòng nghe chung?")) {
      if (isHost && activeHostUserId) {
        MusicSocketManager.sendCommand(activeHostUserId, { command: "STOP_SESSION" });
      } else if (activeHostUserId) {
        MusicSocketManager.sendCommand(activeHostUserId, { command: "LEAVE_SESSION" });
      }
      MusicSocketManager.disconnect();
      dispatch(leaveSession());
    }
  };

  const dismissError = () => {
    dispatch(clearError());
  };

  // State chưa kết nối
  if (!activeHostUserId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{
            background: "rgba(139,92,246,0.1)",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <UsersRound className="w-8 h-8 text-purple-400" />
        </div>
        <p className="text-sm font-semibold text-zinc-200 mb-2">Nghe nhạc cùng bạn bè</p>
        <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
          Bắt đầu phiên nghe chung để bạn bè có thể vào nghe cùng bạn.
        </p>
        <Button
          onClick={handleStartSession}
          disabled={!currentSong}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20"
          title={currentSong ? undefined : "Hãy phát một bài hát ở tab Đang phát trước."}
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          Bắt đầu làm Host
        </Button>
        {!currentSong && (
          <p className="mt-2 text-[11px] text-zinc-500">
            Hãy phát một bài ở tab Đang phát trước khi bấm làm Host.
          </p>
        )}

        {/* Danh sách bạn bè đang nghe */}
        <div className="w-full mt-6 text-left">
          <FriendListeningList />
        </div>
      </div>
    );
  }

  // Đang kết nối
  if (isConnecting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-zinc-400">Đang kết nối tới phiên nghe chung...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="px-5 pb-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2 rounded mb-3 flex justify-between items-center">
              <span>{error}</span>
              <button onClick={dismissError} className="text-red-400 hover:text-red-300 px-1">×</button>
            </div>
          )}

          {sessionState?.isEndingAfterCurrentTrack && (
            <CoListeningBanner visible={true} />
          )}

          <div className="mb-4 flex items-start justify-between gap-2">
            <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-200">
              {isHost ? "Phiên của bạn" : "Đang nghe cùng"}
            </h3>
            <div className="flex shrink-0 items-center gap-2">
              {isHost && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                  className="h-7 w-7 px-0 text-zinc-400 hover:bg-green-900/20 hover:text-green-400"
                  title="Chia sẻ phiên nghe chung"
                >
                  <Share2 className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLeaveSession}
                className="h-7 shrink-0 text-xs text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="w-3 h-3 mr-1.5" />
                Rời đi
              </Button>
            </div>
          </div>

          {/* Danh sách người nghe */}
          <div className="space-y-1">
            {/* Host luôn hiện đầu tiên */}
            {activeHostUserId && (
              <ListenerAvatarRow
                userId={activeHostUserId}
                name={getUserInfo(activeHostUserId).name}
                avatarUrl={getUserInfo(activeHostUserId).avatarUrl}
                isHost={true}
                isSelf={activeHostUserId === currentUserId}
              />
            )}

            {/* Những người nghe khác */}
            {sessionState?.activeListenerIds
              ?.filter(id => id !== activeHostUserId)
              .map(id => (
                <ListenerAvatarRow
                  key={id}
                  userId={id}
                  name={getUserInfo(id).name}
                  avatarUrl={getUserInfo(id).avatarUrl}
                  isSelf={id === currentUserId}
                />
              ))}
          </div>
        </div>
      </div>
      {activeHostUserId && (
        <SessionShareModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          sessionId={activeHostUserId}
        />
      )}
    </>
  );
}
