import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Check,
  Copy,
  Crown,
  Headphones,
  Loader2,
  LogIn,
  Play,
  Radio,
  RotateCcw,
  SkipForward,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/features/hooks";
import { MusicGuessSocketManager } from "@/features/websocket/core/musicGuessSocketManager";
import { guessApi } from "@/services/music/guessApi";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import type {
  MusicGuessAnswerResult,
  MusicGuessEventMessage,
  MusicGuessMode,
  MusicGuessOption,
  MusicGuessRound,
  MusicGuessSession,
} from "@/types/music/guess";

const WAVE_BARS = [24, 46, 34, 70, 42, 88, 50, 78, 36, 62, 44, 92, 55, 74, 40, 66];

const defaultSettings = {
  totalRounds: 10,
  optionCount: 4,
  clipSeconds: 8,
  roundDurationSeconds: 20,
};

export default function MusicGuessPage() {
  const currentUserId = useAppSelector((state) => state.auth.userSession?.id);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewTimerRef = useRef<number | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const playbackIdRef = useRef<number>(0);
  const sessionRef = useRef<MusicGuessSession | null>(null);
  const lastPlayedRoundIdRef = useRef<string | null>(null);

  const [mode, setMode] = useState<MusicGuessMode>("SOLO");
  const [settings, setSettings] = useState(defaultSettings);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [session, setSession] = useState<MusicGuessSession | null>(null);
  const [answerResult, setAnswerResult] = useState<MusicGuessAnswerResult | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [eventNote, setEventNote] = useState<string | null>(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const isHost = Boolean(
    session?.hostUserId && currentUserId && session.hostUserId === String(currentUserId),
  );

  const currentRound = session?.round ?? null;
  const canAnswer = session?.status === "PLAYING" && currentRound && !currentRound.answeredOptionId;

  const refreshSession = useCallback(async () => {
    const active = sessionRef.current;
    if (!active) return;
    const fresh = await guessApi.getSession(active.sessionId);
    setSession(fresh);
  }, []);

  const scheduleRefreshSession = useCallback(() => {
    if (refreshTimerRef.current) return;
    refreshTimerRef.current = window.setTimeout(() => { // NOSONAR
      refreshTimerRef.current = null;
      refreshSession();
    }, 250);
  }, [refreshSession]);

  const stopPreview = useCallback(() => {
    playbackIdRef.current += 1;
    if (previewTimerRef.current) {
      window.clearTimeout(previewTimerRef.current); // NOSONAR
      previewTimerRef.current = null;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
  }, []);

  const playPreview = useCallback(
    async (round?: MusicGuessRound | null) => {
      const targetRound = round ?? sessionRef.current?.round;
      const audio = audioRef.current;
      if (!targetRound || !audio) return;

      stopPreview();
      const currentPlayId = playbackIdRef.current;
      audio.src = targetRound.audioUrl;
      audio.currentTime = Math.max(0, targetRound.previewStartMs / 1000);

      try {
        await audio.play();
        if (currentPlayId !== playbackIdRef.current) {
          audio.pause();
          return;
        }
        previewTimerRef.current = window.setTimeout(() => { // NOSONAR
          audio.pause();
        }, targetRound.clipSeconds * 1000);
      } catch (error) {
        toast.error(getErrorMessage(error, "Không thể phát đoạn nhạc"));
      }
    },
    [stopPreview],
  );

  useEffect(() => {
    return () => {
      stopPreview();
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current); // NOSONAR
        refreshTimerRef.current = null;
      }
    };
  }, [stopPreview]);

  useEffect(() => {
    if (!session?.sessionId || session.mode !== "MULTIPLAYER") {
      return;
    }

    MusicGuessSocketManager.connect({
      baseUrl: import.meta.env.VITE_BACKEND_BASE_URL,
      sessionId: session.sessionId,
      onEvent: async (event: MusicGuessEventMessage) => {
        if (event.eventType === "ANSWER_RESULT") {
          if (typeof event.data === "string") {
            toast.error(event.data);
          } else {
            setAnswerResult(event.data as MusicGuessAnswerResult);
          }
        }

        if (event.eventType === "PLAYER_JOINED") {
          setEventNote("Có người vừa vào phòng");
        } else if (event.eventType === "ROUND_REVEALED") {
          setEventNote("Tất cả đã trả lời");
        } else if (event.eventType === "SESSION_FINISHED") {
          setEventNote("Ván đấu đã kết thúc");
        }

        scheduleRefreshSession();
      },
      onError: (message) => toast.error(message),
    });

    return () => {
      MusicGuessSocketManager.disconnect();
    };
  }, [scheduleRefreshSession, session?.mode, session?.sessionId]);

  useEffect(() => {
    if (session?.status === "PLAYING" && session?.round) {
      if (lastPlayedRoundIdRef.current !== session.round.roundId) {
        lastPlayedRoundIdRef.current = session.round.roundId;
        if (!session.round.answeredOptionId) {
          window.setTimeout(() => playPreview(session.round), 120); // NOSONAR
        }
      }
    }
  }, [session?.status, session?.round, playPreview]);

  useEffect(() => {
    const round = session?.round;
    if (!round || session.status !== "PLAYING") {
      setRemainingSeconds(0);
      return;
    }

    const updateRemaining = () => {
      setRemainingSeconds(Math.max(0, Math.ceil((round.endsAtEpochMs - Date.now()) / 1000)));
    };

    updateRemaining();
    const intervalId = window.setInterval(updateRemaining, 300); // NOSONAR
    return () => window.clearInterval(intervalId); // NOSONAR
  }, [session?.round?.endsAtEpochMs, session?.round?.roundId, session?.status]);

  const startNewSession = async (targetMode: MusicGuessMode) => {
    try {
      setLoadingAction(targetMode);
      setAnswerResult(null);
      setSelectedOptionId(null);
      const created = await guessApi.createSession({
        mode: targetMode,
        ...settings,
      });
      setSession(created);
      setEventNote(targetMode === "SOLO" ? "Ván solo đã sẵn sàng" : "Phòng đã tạo");
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tạo ván đoán nhạc"));
    } finally {
      setLoadingAction(null);
    }
  };

  const joinRoom = async () => {
    try {
      setLoadingAction("join");
      setAnswerResult(null);
      setSelectedOptionId(null);
      const joined = await guessApi.joinSession({ roomCode: roomCodeInput.trim() });
      setSession(joined);
      setEventNote("Đã vào phòng");
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể vào phòng"));
    } finally {
      setLoadingAction(null);
    }
  };

  const startMultiplayer = async () => {
    if (!session) return;
    try {
      setLoadingAction("start");
      const started = await guessApi.startSession(session.sessionId);
      setSession(started);
      setAnswerResult(null);
      setSelectedOptionId(null);
      setEventNote("Ván đấu bắt đầu");
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể bắt đầu phòng"));
    } finally {
      setLoadingAction(null);
    }
  };

  const submitAnswer = async (option: MusicGuessOption) => {
    if (!session?.round || !canAnswer) return;
    try {
      setSelectedOptionId(option.id);
      setLoadingAction(option.id);
      const result = await guessApi.answer(session.sessionId, {
        roundId: session.round.roundId,
        optionId: option.id,
        answeredAtEpochMs: Date.now(),
      });
      setAnswerResult(result);
      const fresh = await guessApi.getSession(session.sessionId);
      setSession(fresh);
      stopPreview();
    } catch (error) {
      setSelectedOptionId(null);
      toast.error(getErrorMessage(error, "Không thể gửi đáp án"));
    } finally {
      setLoadingAction(null);
    }
  };

  const nextRound = async () => {
    if (!session) return;
    try {
      setLoadingAction("next");
      setAnswerResult(null);
      setSelectedOptionId(null);
      const next = await guessApi.nextRound(session.sessionId);
      setSession(next);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể chuyển vòng"));
    } finally {
      setLoadingAction(null);
    }
  };

  const copyRoomCode = async () => {
    if (!session?.roomCode) return;
    await navigator.clipboard.writeText(session.roomCode);
    toast.success("Đã copy mã phòng");
  };

  const topPlayers = useMemo(() => session?.scoreboard ?? [], [session?.scoreboard]);

  return (
    <div className="min-h-screen bg-[#111114] text-zinc-100 pb-32">
      <audio ref={audioRef}>
        <track kind="captions" />
      </audio>

      <div className="border-b border-zinc-800 bg-[#141419]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-8 py-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
              <Radio className="h-4 w-4" />
              Music Guess
            </div>
            <h1 className="mt-2 text-3xl font-bold text-zinc-50">Đoán âm nhạc</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              stopPreview();
              setSession(null);
              setAnswerResult(null);
              setSelectedOptionId(null);
              setEventNote(null);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-amber-400/60 hover:text-amber-200"
          >
            <RotateCcw className="h-4 w-4" />
            Ván mới
          </button>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-6 px-8 py-8 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section className="min-w-0 space-y-6">
          {!session ? (
            <LobbyPanel
              mode={mode}
              setMode={setMode}
              settings={settings}
              setSettings={setSettings}
              roomCodeInput={roomCodeInput}
              setRoomCodeInput={setRoomCodeInput}
              loadingAction={loadingAction}
              onCreate={() => void startNewSession(mode)}
              onJoin={() => void joinRoom()}
            />
          ) : null}

          {session?.status === "WAITING" ? (
            <WaitingRoomPanel
              session={session}
              isHost={isHost}
              loadingAction={loadingAction}
              onCopy={() => void copyRoomCode()}
              onStart={() => void startMultiplayer()}
            />
          ) : null}

          {session?.status === "PLAYING" && currentRound ? (
            <RoundPanel
              round={currentRound}
              selectedOptionId={selectedOptionId}
              answerResult={answerResult}
              loadingAction={loadingAction}
              remainingSeconds={remainingSeconds}
              canAnswer={Boolean(canAnswer)}
              canAdvance={session.mode === "SOLO" || isHost}
              onPlay={() => void playPreview(currentRound)}
              onAnswer={(option) => void submitAnswer(option)}
              onNext={() => void nextRound()}
            />
          ) : null}

          {session?.status === "FINISHED" ? (
            <FinishedPanel
              session={session}
              onRestart={() => void startNewSession(session.mode)}
            />
          ) : null}
        </section>

        <aside className="space-y-6">
          <ScoreboardPanel session={session} players={topPlayers} eventNote={eventNote} />
        </aside>
      </main>
    </div>
  );
}

interface LobbyPanelProps {
  mode: MusicGuessMode;
  setMode: (mode: MusicGuessMode) => void;
  settings: typeof defaultSettings;
  setSettings: (settings: typeof defaultSettings) => void;
  roomCodeInput: string;
  setRoomCodeInput: (value: string) => void;
  loadingAction: string | null;
  onCreate: () => void;
  onJoin: () => void;
}

function LobbyPanel({
  mode,
  setMode,
  settings,
  setSettings,
  roomCodeInput,
  setRoomCodeInput,
  loadingAction,
  onCreate,
  onJoin,
}: LobbyPanelProps) {
  const setNumberSetting = (key: keyof typeof defaultSettings, value: number) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-[#18181d] p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <ModeButton
          active={mode === "SOLO"}
          icon={<Headphones className="h-5 w-5" />}
          title="Solo"
          meta="Tự luyện"
          onClick={() => setMode("SOLO")}
        />
        <ModeButton
          active={mode === "MULTIPLAYER"}
          icon={<Users className="h-5 w-5" />}
          title="Đấu phòng"
          meta="Realtime"
          onClick={() => setMode("MULTIPLAYER")}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <NumberField label="Vòng" value={settings.totalRounds} min={3} max={20} onChange={(value) => setNumberSetting("totalRounds", value)} />
        <NumberField label="Đáp án" value={settings.optionCount} min={2} max={6} onChange={(value) => setNumberSetting("optionCount", value)} />
        <NumberField label="Clip" value={settings.clipSeconds} min={5} max={15} onChange={(value) => setNumberSetting("clipSeconds", value)} />
        <NumberField label="Timer" value={settings.roundDurationSeconds} min={10} max={45} onChange={(value) => setNumberSetting("roundDurationSeconds", value)} />
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <button
          type="button"
          onClick={onCreate}
          disabled={Boolean(loadingAction)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-amber-300 px-5 text-sm font-bold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingAction === mode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {mode === "SOLO" ? "Chơi solo" : "Tạo phòng"}
        </button>

        {mode === "MULTIPLAYER" ? (
          <div className="flex min-w-0 flex-1 gap-2">
            <input
              value={roomCodeInput}
              onChange={(event) => setRoomCodeInput(event.target.value.toUpperCase())}
              placeholder="MÃ PHÒNG"
              className="h-12 min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-4 text-sm font-bold uppercase tracking-[0.2em] text-zinc-100 outline-none transition focus:border-emerald-400"
            />
            <button
              type="button"
              onClick={onJoin}
              disabled={Boolean(loadingAction) || roomCodeInput.trim().length < 4}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-emerald-500/50 px-5 text-sm font-bold text-emerald-200 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingAction === "join" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Vào
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ModeButton({
  active,
  icon,
  title,
  meta,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between rounded-lg border p-4 text-left transition ${
        active
          ? "border-amber-300 bg-amber-300 text-zinc-950"
          : "border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-zinc-600"
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        <span>
          <span className="block text-base font-bold">{title}</span>
          <span className={`text-xs font-semibold ${active ? "text-zinc-800" : "text-zinc-500"}`}>{meta}</span>
        </span>
      </span>
    </button>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm font-bold text-zinc-100 outline-none transition focus:border-amber-300"
      />
    </label>
  );
}

function WaitingRoomPanel({
  session,
  isHost,
  loadingAction,
  onCopy,
  onStart,
}: {
  session: MusicGuessSession;
  isHost: boolean;
  loadingAction: string | null;
  onCopy: () => void;
  onStart: () => void;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-[#18181d] p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Room code</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="font-mono text-4xl font-black tracking-[0.22em] text-zinc-50">{session.roomCode}</span>
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 transition hover:border-emerald-400 hover:text-emerald-200"
              title="Copy"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onStart}
          disabled={!isHost || Boolean(loadingAction)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-5 text-sm font-bold text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingAction === "start" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Bắt đầu
        </button>
      </div>
    </div>
  );
}

function RoundPanel({
  round,
  selectedOptionId,
  answerResult,
  loadingAction,
  remainingSeconds,
  canAnswer,
  canAdvance,
  onPlay,
  onAnswer,
  onNext,
}: {
  round: MusicGuessRound;
  selectedOptionId: string | null;
  answerResult: MusicGuessAnswerResult | null;
  loadingAction: string | null;
  remainingSeconds: number;
  canAnswer: boolean;
  canAdvance: boolean;
  onPlay: () => void;
  onAnswer: (option: MusicGuessOption) => void;
  onNext: () => void;
}) {
  const reveal = round.reveal ?? answerResult?.reveal ?? null;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-800 bg-[#18181d] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
              Vòng {round.roundNumber}/{round.totalRounds}
            </p>
            <h2 className="mt-2 text-2xl font-black text-zinc-50">
              {reveal ? reveal.title : "Nghe đoạn nhạc"}
            </h2>
            <p className="mt-1 text-sm font-medium text-zinc-400">
              {reveal ? reveal.artistName : `${round.clipSeconds}s audio | ${remainingSeconds}s`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPlay}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-amber-300/60 px-4 text-sm font-bold text-amber-200 transition hover:bg-amber-300/10"
            >
              <Play className="h-4 w-4" />
              Phát lại
            </button>
            {round.answeredOptionId && canAdvance ? (
              <button
                type="button"
                onClick={onNext}
                disabled={Boolean(loadingAction)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 text-sm font-bold text-zinc-950 transition hover:bg-white disabled:opacity-60"
              >
                {loadingAction === "next" ? <Loader2 className="h-4 w-4 animate-spin" /> : <SkipForward className="h-4 w-4" />}
                Tiếp
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex h-24 items-end gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-5 py-4">
          {WAVE_BARS.map((height, index) => (
            <div
              key={`${height}-${index}`}
              className="w-full rounded-t bg-gradient-to-t from-amber-500 via-rose-400 to-emerald-300"
              style={{ height: `${height}%`, opacity: round.answeredOptionId ? 0.45 : 0.9 }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {round.options.map((option) => {
          const state = getOptionVisualState(option.id, round, answerResult, selectedOptionId);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onAnswer(option)}
              disabled={!canAnswer || Boolean(loadingAction)}
              className={`flex min-h-20 items-center justify-between rounded-lg border px-5 py-4 text-left text-sm font-bold transition ${state.className}`}
            >
              <span className="min-w-0 break-words pr-4">{option.label}</span>
              {loadingAction === option.id ? <Loader2 className="h-5 w-5 shrink-0 animate-spin" /> : state.icon}
            </button>
          );
        })}
      </div>

      {answerResult || round.reveal ? (
        <div className="rounded-lg border border-zinc-800 bg-[#18181d] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={`text-sm font-black ${answerResult?.correct || round.answeredCorrect ? "text-emerald-300" : "text-rose-300"}`}>
                {answerResult?.correct || round.answeredCorrect ? "Chính xác" : "Sai mất rồi"}
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                {reveal?.title} - {reveal?.artistName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-amber-200">+{answerResult?.earnedPoints ?? 0}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">points</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getOptionVisualState(
  optionId: string,
  round: MusicGuessRound,
  answerResult: MusicGuessAnswerResult | null,
  selectedOptionId: string | null,
) {
  const correctId = answerResult?.correctOptionId;
  const selectedId = answerResult?.selectedOptionId ?? round.answeredOptionId ?? selectedOptionId;

  if (correctId && optionId === correctId) {
    return {
      className: "border-emerald-400 bg-emerald-400/15 text-emerald-100",
      icon: <Check className="h-5 w-5 shrink-0 text-emerald-300" />,
    };
  }

  if (selectedId === optionId && answerResult && !answerResult.correct) {
    return {
      className: "border-rose-400 bg-rose-400/15 text-rose-100",
      icon: <X className="h-5 w-5 shrink-0 text-rose-300" />,
    };
  }

  if (selectedId === optionId) {
    return {
      className: "border-amber-300 bg-amber-300/15 text-amber-100",
      icon: null,
    };
  }

  return {
    className: "border-zinc-800 bg-[#18181d] text-zinc-100 hover:border-zinc-600 hover:bg-zinc-800/70 disabled:hover:border-zinc-800",
    icon: null,
  };
}

function FinishedPanel({
  session,
  onRestart,
}: {
  session: MusicGuessSession;
  onRestart: () => void;
}) {
  const winner = session.scoreboard[0];
  return (
    <div className="rounded-lg border border-zinc-800 bg-[#18181d] p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-amber-300 text-zinc-950">
          <Trophy className="h-7 w-7" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Kết quả</p>
          <h2 className="mt-1 text-2xl font-black text-zinc-50">{winner?.displayName ?? "No winner"}</h2>
        </div>
      </div>
      <button
        type="button"
        onClick={onRestart}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 text-sm font-bold text-zinc-950 transition hover:bg-white"
      >
        <RotateCcw className="h-4 w-4" />
        Chơi lại
      </button>
    </div>
  );
}

function ScoreboardPanel({
  session,
  players,
  eventNote,
}: {
  session: MusicGuessSession | null;
  players: MusicGuessSession["scoreboard"];
  eventNote: string | null;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-[#18181d] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-300" />
          <h2 className="text-base font-black text-zinc-50">Bảng điểm</h2>
        </div>
        {session ? (
          <span className="rounded-md bg-zinc-950 px-2 py-1 text-xs font-bold text-zinc-400">
            {session.currentRoundNumber}/{session.totalRounds}
          </span>
        ) : null}
      </div>

      {eventNote ? <p className="mt-3 text-sm font-medium text-emerald-300">{eventNote}</p> : null}

      <div className="mt-4 space-y-2">
        {players.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 p-5 text-sm text-zinc-500">
            Chưa có người chơi
          </div>
        ) : (
          players.map((player, index) => (
            <div
              key={player.userId}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-black ${
                  index === 0 ? "bg-amber-300 text-zinc-950" : "bg-zinc-800 text-zinc-300"
                }`}>
                  {index === 0 ? <Crown className="h-4 w-4" /> : index + 1}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-zinc-100">{player.displayName}</p>
                  <p className="text-xs text-zinc-500">{player.answeredRounds} lượt trả lời</p>
                </div>
              </div>
              <span className="text-lg font-black text-zinc-50">{player.score}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
