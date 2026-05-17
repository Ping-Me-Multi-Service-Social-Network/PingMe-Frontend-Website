import axiosClient from "@/lib/axiosClient";
import type { FriendSessionSummary, MusicSessionState } from "@/types/music/musicSession";

export const getMusicSessionStateApi = async (hostUserId: string) => {
  return axiosClient.get<MusicSessionState>(
    `/music-service/music/sessions/${hostUserId}`
  );
};

export const getFriendsActiveSessionsApi = async () => {
  return axiosClient.get<MusicSessionState[]>(
    `/music-service/music/sessions/friends`
  );
};

export const getFriendsActiveSessionSummariesApi = async () => {
  return axiosClient.get<FriendSessionSummary[]>(
    `/music-service/music/sessions/friends/summary`
  );
};
