import axiosClient from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/base/apiResponse";
import type {
  CreateMusicGuessSessionRequest,
  JoinMusicGuessSessionRequest,
  MusicGuessAnswerRequest,
  MusicGuessAnswerResult,
  MusicGuessSession,
} from "@/types/music/guess";

const BASE_URL = "/music-service/guess";

export const guessApi = {
  createSession: async (
    request: CreateMusicGuessSessionRequest,
  ): Promise<MusicGuessSession> => {
    const response = await axiosClient.post<ApiResponse<MusicGuessSession>>(
      `${BASE_URL}/sessions`,
      request,
    );
    return response.data.data;
  },

  joinSession: async (
    request: JoinMusicGuessSessionRequest,
  ): Promise<MusicGuessSession> => {
    const response = await axiosClient.post<ApiResponse<MusicGuessSession>>(
      `${BASE_URL}/sessions/join`,
      request,
    );
    return response.data.data;
  },

  getSession: async (sessionId: string): Promise<MusicGuessSession> => {
    const response = await axiosClient.get<ApiResponse<MusicGuessSession>>(
      `${BASE_URL}/sessions/${sessionId}`,
    );
    return response.data.data;
  },

  startSession: async (sessionId: string): Promise<MusicGuessSession> => {
    const response = await axiosClient.post<ApiResponse<MusicGuessSession>>(
      `${BASE_URL}/sessions/${sessionId}/start`,
    );
    return response.data.data;
  },

  answer: async (
    sessionId: string,
    request: MusicGuessAnswerRequest,
  ): Promise<MusicGuessAnswerResult> => {
    const response = await axiosClient.post<ApiResponse<MusicGuessAnswerResult>>(
      `${BASE_URL}/sessions/${sessionId}/answers`,
      request,
    );
    return response.data.data;
  },

  nextRound: async (sessionId: string): Promise<MusicGuessSession> => {
    const response = await axiosClient.post<ApiResponse<MusicGuessSession>>(
      `${BASE_URL}/sessions/${sessionId}/next-round`,
    );
    return response.data.data;
  },
};
