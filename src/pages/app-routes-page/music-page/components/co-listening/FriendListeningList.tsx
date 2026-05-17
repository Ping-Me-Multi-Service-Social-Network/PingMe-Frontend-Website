import { UsersRound, Music2 } from "lucide-react";
import { UserAvatarFallback } from "@/components/custom/UserAvatarFallback";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useMemo, useState } from "react";
import { getAcceptedFriendshipHistoryListApi } from "@/services/friendship";
import { getFriendsActiveSessionSummariesApi } from "@/services/music/musicSessionApi";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/features/store";
import {
  friendSessionsSnapshotReceived,
  joinSessionStart,
} from "@/features/music/musicSessionSlice";
import { FriendSessionSocketManager } from "@/features/websocket/core/friendSessionSocketManager";

interface FriendInfo {
  name: string;
  avatarUrl?: string | null;
}

export function FriendListeningList() {
  const dispatch = useDispatch();
  const currentUserId = useSelector(
    (state: RootState) => state.auth.userSession?.id?.toString()
  );
  const friendSessionsByHostId = useSelector(
    (state: RootState) => state.musicSession.friendSessionsByHostId ?? {}
  );
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL || '';

  const [friendsById, setFriendsById] = useState<Record<string, FriendInfo>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;

    let mounted = true;

    const bootstrap = async () => {
      try {
        setIsLoading(true);
        const [friendsRes, sessionsRes] = await Promise.all([
          getAcceptedFriendshipHistoryListApi(undefined, 50),
          getFriendsActiveSessionSummariesApi(),
        ]);

        if (!mounted) return;

        const friends = friendsRes.data?.data?.userSummaryResponses || [];
        setFriendsById(
          friends.reduce<Record<string, FriendInfo>>((acc, friend) => {
            acc[String(friend.id)] = {
              name: friend.name,
              avatarUrl: friend.avatarUrl,
            };
            return acc;
          }, {})
        );
        dispatch(friendSessionsSnapshotReceived(sessionsRes.data || []));
      } catch (err) {
        console.error("Lỗi khi tải danh sách bạn bè đang nghe nhạc", err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();
    FriendSessionSocketManager.connect(currentUserId, { baseUrl, dispatch });

    return () => {
      mounted = false;
      FriendSessionSocketManager.disconnect();
    };
  }, [baseUrl, currentUserId, dispatch]);

  const sessions = useMemo(
    () =>
      Object.values(friendSessionsByHostId)
        .filter((session) => !session.isEndingAfterCurrentTrack && session.track?.trackId)
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [friendSessionsByHostId]
  );

  const handleJoin = (hostId: string) => {
    if (!currentUserId) return;
    dispatch(joinSessionStart({ hostUserId: hostId, currentUserId }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-purple-400">
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
        <UsersRound className="w-8 h-8 text-zinc-600 mb-3" />
        <p className="text-xs text-zinc-500">Chưa có bạn bè nào đang nghe nhạc.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      <h3 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
        <UsersRound className="w-4 h-4 text-purple-400" />
        Bạn bè đang nghe
      </h3>

      {sessions.map((session) => {
        const friend = friendsById[session.hostUserId];
        const displayName = friend?.name ?? `Người dùng ${session.hostUserId.slice(-4)}`;

        return (
          <button
            key={session.hostUserId}
            className="w-full text-left group flex flex-col gap-3 p-3 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/80 transition-colors border border-zinc-700/50 hover:border-purple-500/30 cursor-pointer"
            onClick={() => handleJoin(session.hostUserId)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <Avatar className="w-8 h-8 ring-2 ring-purple-500/20">
                  <AvatarImage src={friend?.avatarUrl || undefined} />
                  <UserAvatarFallback name={displayName} size="sm" />
                </Avatar>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">{displayName}</p>
                  <p className="text-[10px] text-purple-400">
                    {session.isPlaying ? "Đang phát nhạc" : "Đang tạm dừng"}
                  </p>
                </div>
              </div>
 
              <div className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 bg-zinc-900/50 px-2 py-1 rounded-full">
                <UsersRound className="w-3 h-3" />
                {session.listenerCount}
              </div>
            </div>
 
            <div className="flex items-center gap-3 bg-zinc-900/50 p-2.5 rounded-lg w-full">
              {session.track.coverImageUrl ? (
                <img
                  src={session.track.coverImageUrl}
                  alt={session.track.title ?? "Track cover"}
                  className="w-8 h-8 rounded object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-purple-900/30 flex items-center justify-center shrink-0">
                  <Music2 className="w-4 h-4 text-purple-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">
                  {session.track.title ?? `Track ${session.track.trackId}`}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  {session.track.artistName ?? "Unknown Artist"}
                </p>
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-md shadow-md">
                Tham gia
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
