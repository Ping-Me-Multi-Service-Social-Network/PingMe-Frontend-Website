import axiosClient from "@/lib/axiosClient.ts";
import type { ApiResponse } from "@/types/base/apiResponse";
import type {
  FriendInvitationRequest,
  HistoryFriendshipResponse,
  UserFriendshipStatsResponse,
} from "@/types/friendship";

export const sendInvitationApi = (data: FriendInvitationRequest) => {
  return axiosClient.post("/friendships", data);
};

export const acceptInvitationApi = (id: number) => {
  return axiosClient.post(`/friendships/${id}/accept`);
};

export const rejectInvitationApi = (id: number) => {
  return axiosClient.delete(`/friendships/${id}/reject`);
};

export const cancelInvitationApi = (id: number) => {
  return axiosClient.delete(`/friendships/${id}/cancel`);
};

export const deleteFriendshipApi = (id: number) => {
  return axiosClient.delete(`/friendships/${id}`);
};

export const getAcceptedFriendshipHistoryListApi = (
  beforeId?: number,
  size: number = 20
) => {
  const params = new URLSearchParams();
  params.append("size", size.toString());
  if (beforeId !== undefined) params.append("beforeId", beforeId.toString());

  return axiosClient.get<ApiResponse<HistoryFriendshipResponse>>(
    `/friendships/history?${params.toString()}`
  );
};

export const getReceivedHistoryInvitationsApi = (
  beforeId?: number,
  size: number = 20
) => {
  const params = new URLSearchParams();
  params.append("size", size.toString());
  if (beforeId !== undefined) params.append("beforeId", beforeId.toString());

  return axiosClient.get<ApiResponse<HistoryFriendshipResponse>>(
    `/friendships/history/received?${params.toString()}`
  );
};

export const getSentHistoryInvitationsApi = (
  beforeId?: number,
  size: number = 20
) => {
  const params = new URLSearchParams();
  params.append("size", size.toString());
  if (beforeId !== undefined) params.append("beforeId", beforeId.toString());

  return axiosClient.get<ApiResponse<HistoryFriendshipResponse>>(
    `/friendships/history/sent?${params.toString()}`
  );
};

export const getUserFriendshipStatsApi = () => {
  return axiosClient.get<ApiResponse<UserFriendshipStatsResponse>>(
    `/friendships/me/stats`
  );
};
