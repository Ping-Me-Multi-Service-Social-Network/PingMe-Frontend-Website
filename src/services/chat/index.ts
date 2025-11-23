import axiosClient from "@/lib/axiosClient.ts";
import type {
  ApiResponse,
  PageResponse,
  PaginationParams,
} from "@/types/common/apiResponse";
import type {
  HistoryMessageResponse,
  MarkReadRequest,
  MessageRecalledResponse,
  MessageResponse,
  SendMessageRequest,
  SendWeatherMessageRequest,
} from "@/types/chat/message";
import type {
  AddGroupMembersRequest,
  CreateGroupRoomRequest,
  CreateOrGetDirectRoomRequest,
  RoomResponse,
} from "@/types/chat/room";

// ==================================================================================
// Rooms Service
// ==================================================================================

export const createOrGetDirectRoomApi = (
  data: CreateOrGetDirectRoomRequest
) => {
  return axiosClient.post<ApiResponse<RoomResponse>>("/rooms/direct", data);
};

export const createGroupRoomApi = (data: CreateGroupRoomRequest) => {
  return axiosClient.post<ApiResponse<RoomResponse>>("/rooms/group", data);
};

export const addGroupMembersApi = (data: AddGroupMembersRequest) => {
  return axiosClient.post<ApiResponse<RoomResponse>>(
    "/rooms/group/add-members",
    data
  );
};

export const removeGroupMemberApi = (roomId: number, targetUserId: number) => {
  return axiosClient.delete<ApiResponse<RoomResponse>>(
    `/rooms/group/${roomId}/members/${targetUserId}`
  );
};

export const changeMemberRole = (
  roomId: number,
  targetUserId: number,
  role: "ADMIN" | "MEMBER"
) => {
  return axiosClient.put<ApiResponse<RoomResponse>>(
    `/rooms/group/${roomId}/members/${targetUserId}/role?newRole=${role}`
  );
};

export const renameGroup = (roomId: number, name: string) => {
  return axiosClient.put<ApiResponse<RoomResponse>>(
    `/rooms/group/${roomId}/name?name=${name}`
  );
};

export const changeTheme = (roomId: number, theme: string) => {
  return axiosClient.put<ApiResponse<RoomResponse>>(
    `/rooms/${roomId}/theme?theme=${theme}`
  );
};

export const updateGroupImage = (roomId: number, roomImage: File | null) => {
  const formDataToSend = new FormData();
  if (roomImage) formDataToSend.append("file", roomImage);

  return axiosClient.put<ApiResponse<RoomResponse>>(
    `/rooms/group/${roomId}/image`,
    formDataToSend
  );
};

export const getCurrentUserRoomsApi = ({
  page = 0,
  size = 10,
}: PaginationParams) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  return axiosClient.get<ApiResponse<PageResponse<RoomResponse>>>(
    `/rooms?${params.toString()}`
  );
};

// ==================================================================================
// Messages Service
// ==================================================================================

export const sendMessageApi = (data: SendMessageRequest) => {
  return axiosClient.post<ApiResponse<MessageResponse>>("/messages", data);
};

export const sendFileMessageApi = (data: FormData) => {
  return axiosClient.post<ApiResponse<MessageResponse>>(
    "/messages/files",
    data
  );
};

export const sendWeatherMessage = (data: SendWeatherMessageRequest) => {
  return axiosClient.post<ApiResponse<MessageResponse>>(
    "/messages/weather",
    data
  );
};

export const recallMessageApi = (messageId: number) => {
  return axiosClient.delete<ApiResponse<MessageRecalledResponse>>(
    `/messages/${messageId}/recall`
  );
};

export const markAsReadApi = (data: MarkReadRequest) => {
  return axiosClient.post<ApiResponse<MessageResponse>>("/messages/read", data);
};

export const getHistoryMessagesApi = (
  roomId: number,
  beforeId?: number,
  size: number = 20
) => {
  const params = new URLSearchParams();
  params.append("roomId", roomId.toString());
  params.append("size", size.toString());
  if (beforeId !== undefined) {
    params.append("beforeId", beforeId.toString());
  }

  return axiosClient.get<ApiResponse<HistoryMessageResponse>>(
    `/messages/history?${params.toString()}`
  );
};
