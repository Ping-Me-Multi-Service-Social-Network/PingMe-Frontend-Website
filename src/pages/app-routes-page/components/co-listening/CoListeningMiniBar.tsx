import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/features/store";
import { UsersRound, Play, Pause, X, Music2 } from "lucide-react";
import { DndContext, useDraggable, type DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useAudio } from "@/hooks/useAudio";
import { useLocation } from "react-router-dom";
import { MusicSocketManager } from "@/features/websocket/core/musicSocketManager";

// =================================================================
// CoListeningMiniBarContent - Thanh floating điều khiển nghe chung
// =================================================================

interface CoListeningMiniBarContentProps {
  onClose: () => void;
}

const CoListeningMiniBarContent: React.FC<CoListeningMiniBarContentProps> = ({ onClose }) => {
  const activeHostUserId = useSelector(
    (state: RootState) => state.musicSession.activeHostUserId
  );
  const currentUserId = useSelector(
    (state: RootState) => state.auth.userSession?.id?.toString()
  );
  const session = useSelector((state: RootState) => state.musicSession.session);
  const isHost = useSelector((state: RootState) => state.musicSession.isHost);

  const { currentSong, togglePlayPause } = useAudio();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: "colistening-mini-player",
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: isDragging ? "grabbing" : "grab",
  };

  const handlePlayPause = () => {
    if (!session || !activeHostUserId || !currentUserId || !isHost) return;
    const positionMs = session.isPlaying
      ? session.positionMs + Math.max(0, Date.now() - session.startedAtEpochMs)
      : session.positionMs;
    MusicSocketManager.sendCommand(activeHostUserId, {
      command: session.isPlaying ? "PAUSE" : "PLAY",
      payload: {
        currentTrackId: session.currentTrackId,
        positionMs,
      },
    });
    togglePlayPause();
  };

  if (!session) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-linear-to-br from-indigo-900 via-purple-900 to-indigo-950 rounded-xl shadow-[0_10px_40px_-10px_rgba(139,92,246,0.6)] backdrop-blur-md border border-purple-500/40 p-3 flex flex-col gap-2 relative overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-white/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-1.5 text-purple-200">
          <UsersRound className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {isHost ? "Đang làm Host" : "Đang nghe chung"}
          </span>
          <span className="text-[10px] bg-purple-500/30 px-1.5 py-0.5 rounded-full ml-1">
            {session.activeListenerIds?.length || 1}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
          onPointerDown={(e) => e.stopPropagation()}
          title="Ẩn thanh nghe chung"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Track Info */}
      <div className="flex items-center gap-3 z-10 bg-black/20 p-2 rounded-lg">
        {currentSong?.coverImageUrl ? (
          <img
            src={currentSong.coverImageUrl}
            alt="cover"
            className="w-10 h-10 rounded shadow-md object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded shadow-md bg-purple-900/50 flex items-center justify-center">
            <Music2 className="w-5 h-5 text-purple-400" />
          </div>
        )}
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-semibold text-white truncate">
            {currentSong?.title || "Đang tải bài hát..."}
          </p>
          <p className="text-[10px] text-purple-300 truncate">
            {currentSong?.mainArtist?.name || "---"}
          </p>
        </div>

        {/* Play/Pause Button (Chỉ Host mới điều khiển được, listener chỉ xem) */}
        {isHost && (
          <button
            onClick={handlePlayPause}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-8 h-8 shrink-0 bg-white text-purple-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          >
            {session.isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export const CoListeningMiniBar: React.FC = () => {
  const activeHostUserId = useSelector(
    (state: RootState) => state.musicSession.activeHostUserId
  );
  const location = useLocation();
  const isMusicPage = location.pathname.startsWith("/app/music");
  const wasMusicPageRef = React.useRef(isMusicPage);
  const [isDismissed, setIsDismissed] = useState(false);

  const [position, setPosition] = useState({
    x: globalThis.innerWidth - 300,
    y: 80, // Hiện ở góc trên bên phải, dưới thanh nav chat
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    setPosition((prev) => ({
      x: Math.max(0, Math.min(prev.x + delta.x, globalThis.innerWidth - 250)),
      y: Math.max(0, Math.min(prev.y + delta.y, globalThis.innerHeight - 100)),
    }));
  };

  React.useEffect(() => {
    setIsDismissed(false);
  }, [activeHostUserId]);

  React.useEffect(() => {
    if (wasMusicPageRef.current && !isMusicPage) {
      setIsDismissed(false);
    }
    wasMusicPageRef.current = isMusicPage;
  }, [isMusicPage]);

  // Chỉ hiện khi có session VÀ KHÔNG Ở TRANG MUSIC
  // (Trong trang music đã có section ở Right Panel)
  if (!activeHostUserId || isMusicPage || isDismissed) return null;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "250px",
          zIndex: 9999,
        }}
      >
        <CoListeningMiniBarContent onClose={() => setIsDismissed(true)} />
      </div>
    </DndContext>
  );
};
