export type MusicGuessMode = "SOLO" | "MULTIPLAYER";
export type MusicGuessSessionStatus = "WAITING" | "PLAYING" | "FINISHED";
export type MusicGuessEventType =
  | "SESSION_STATE"
  | "SCOREBOARD_UPDATED"
  | "ROUND_REVEALED"
  | "ANSWER_RESULT"
  | "PLAYER_JOINED"
  | "SESSION_FINISHED";

export interface CreateMusicGuessSessionRequest {
  mode: MusicGuessMode;
  totalRounds?: number;
  optionCount?: number;
  clipSeconds?: number;
  roundDurationSeconds?: number;
}

export interface JoinMusicGuessSessionRequest {
  roomCode: string;
}

export interface MusicGuessAnswerRequest {
  roundId: string;
  optionId: string;
  answeredAtEpochMs?: number;
}

export interface MusicGuessOption {
  id: string;
  label: string;
}

export interface MusicGuessSongReveal {
  songId: number;
  title: string;
  artistName: string;
  coverImageUrl: string;
  songUrl: string;
}

export interface MusicGuessScoreboardEntry {
  userId: string;
  displayName: string;
  score: number;
  answeredRounds: number;
  connected: boolean;
}

export interface MusicGuessRound {
  roundId: string;
  roundNumber: number;
  totalRounds: number;
  audioUrl: string;
  previewStartMs: number;
  clipSeconds: number;
  endsAtEpochMs: number;
  options: MusicGuessOption[];
  answeredOptionId?: string | null;
  answeredCorrect?: boolean | null;
  reveal?: MusicGuessSongReveal | null;
}

export interface MusicGuessSession {
  sessionId: string;
  roomCode: string;
  mode: MusicGuessMode;
  status: MusicGuessSessionStatus;
  hostUserId: string;
  hostDisplayName: string;
  currentRoundNumber: number;
  totalRounds: number;
  optionCount: number;
  clipSeconds: number;
  roundDurationSeconds: number;
  scoreboard: MusicGuessScoreboardEntry[];
  round?: MusicGuessRound | null;
}

export interface MusicGuessAnswerResult {
  correct: boolean;
  earnedPoints: number;
  totalScore: number;
  selectedOptionId: string;
  correctOptionId: string;
  roundComplete: boolean;
  sessionFinished: boolean;
  reveal: MusicGuessSongReveal;
}

export interface MusicGuessEventMessage<T = unknown> {
  eventType: MusicGuessEventType;
  data: T;
  createdAtEpochMs: number;
}
