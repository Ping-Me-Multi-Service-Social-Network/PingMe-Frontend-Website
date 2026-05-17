// =================================================================
// Music Session Types - Khớp 100% với Backend DTO
// =================================================================

/**
 * Trạng thái Session nghe chung, khớp với MusicSessionState.java
 */
export interface MusicSessionState {
  hostUserId: string;
  isPlaying: boolean;
  currentTrackId: string | null;
  positionMs: number;
  startedAtEpochMs: number;
  queue: string[];
  activeListenerIds: string[];
  isEndingAfterCurrentTrack: boolean;
  version: number;
  updatedAt: string; // ISO string (Instant serialized)
}

export interface TrackSummary {
  trackId: string | null;
  title: string | null;
  artistName: string | null;
  coverImageUrl: string | null;
}

export interface FriendSessionSummary {
  hostUserId: string;
  track: TrackSummary;
  listenerCount: number;
  listenerIds: string[];
  isPlaying: boolean;
  isEndingAfterCurrentTrack: boolean;
  version: number;
  updatedAt: string;
}

/**
 * Các loại lệnh FE gửi lên BE, khớp với MusicSessionCommandType.java
 */
export type MusicSessionCommandType =
  | "START_SESSION"
  | "JOIN_SESSION"
  | "LEAVE_SESSION"
  | "PLAY"
  | "PAUSE"
  | "SEEK"
  | "NEXT"
  | "PREV"
  | "ADD_TO_QUEUE"
  | "REMOVE_FROM_QUEUE"
  | "STOP_SESSION";

/**
 * Các loại sự kiện BE broadcast xuống, khớp với MusicSessionEventType.java
 */
export type MusicSessionEventType =
  | "MUSIC_SESSION_STATE"
  | "MUSIC_PLAYBACK_CHANGED"
  | "MUSIC_QUEUE_CHANGED"
  | "MUSIC_PRESENCE_CHANGED"
  | "MUSIC_SESSION_ENDED"
  | "FRIEND_SESSION_STARTED"
  | "FRIEND_SESSION_UPDATED"
  | "FRIEND_SESSION_ENDED";

/**
 * Envelope của sự kiện từ BE, khớp với MusicSessionEventMessage.java
 */
export interface MusicSessionEventMessage {
  eventType: MusicSessionEventType;
  data: unknown;
  serverTimeMs: number;
}

/**
 * Envelope lệnh gửi lên BE, khớp với MusicSessionCommandRequest.java
 */
export interface MusicSessionCommandRequest {
  command: MusicSessionCommandType;
  payload?: PlayPayload | QueuePayload | StartSessionPayload | null;
}

// Payloads khớp với các record trong dto/music/session/payload/

/** Cho lệnh PLAY, PAUSE, SEEK */
export interface PlayPayload {
  currentTrackId?: string | null;
  positionMs?: number | null;
}

/** Cho lệnh ADD_TO_QUEUE, REMOVE_FROM_QUEUE, PREV */
export interface QueuePayload {
  queue?: string[] | null;
  trackId?: string | null;
  trackIds?: string[] | null;
}

/** Cho lệnh START_SESSION */
export interface StartSessionPayload {
  queue?: string[] | null;
  currentTrackId?: string | null;
  positionMs?: number | null;
  isPlaying?: boolean | null;
}

/** Lỗi từ BE gửi về /user/queue/music/errors */
export interface MusicCommandError {
  errorCode: string;
  message: string;
  details: unknown;
}
