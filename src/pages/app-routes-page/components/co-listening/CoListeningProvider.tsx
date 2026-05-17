import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/features/store";
import { useMusicSession } from "@/hooks/useMusicSession";
import { leaveSession } from "@/features/music/musicSessionSlice";
import { useAudio } from "@/hooks/useAudio";

export function CoListeningProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const dispatch = useDispatch();

  const currentUserId = useSelector(
    (state: RootState) => state.auth.userSession?.id?.toString()
  );
  const activeHostUserId = useSelector(
    (state: RootState) => state.musicSession.activeHostUserId
  );
  const sessionToken = useSelector(
    (state: RootState) => state.musicSession.sessionToken
  );
  const isConnected = useSelector((state: RootState) => state.musicSession.isConnected);

  const { audioRef, currentSong, isPlaying } = useAudio();

  const { session, isHost, startSession } = useMusicSession({
    hostUserId: activeHostUserId,
    currentUserId,
    sessionToken,
    onSessionEnded: () => {
      dispatch(leaveSession());
    },
  });

  useEffect(() => {
    if (isHost && isConnected && currentSong?.id) {
      const serverTrackId = session?.currentTrackId;

      if (!serverTrackId) {
        console.log("[CoListening] Host initializing session on server...");
        startSession({
          queue: [],
          currentTrackId: currentSong.id.toString(),
          positionMs: audioRef.current?.currentTime
            ? Math.floor(audioRef.current.currentTime * 1000)
            : 0,
          isPlaying,
        });
      }
    }
  }, [isHost, isConnected, currentSong?.id, isPlaying, session?.currentTrackId, startSession, audioRef]);

  return <>{children}</>;
}
