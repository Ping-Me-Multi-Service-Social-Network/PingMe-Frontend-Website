import axiosClient from "@/lib/axiosClient";
import type { ApiResponse, Slice } from "@/types/base/apiResponse";
import type {AIChatResponse} from "@/types/ai/aiChatResponse";
import type {AIChatRoomInformation} from "@/types/ai/aiChatRoomInformation";
import type {AIMessage} from "@/types/ai/aiMessage";

export const aiChatBoxService = {
  getChatHistory: (chatRoomId: string, page: number = 0, size: number = 20) =>
    axiosClient.get<ApiResponse<Slice<AIMessage>>>(`/core-service/ai-chatbox/room/${chatRoomId}`, {
      params: { page, size },
    }),

  getUserChatRooms: (page: number = 0, size: number = 10) =>
    axiosClient.get<ApiResponse<Slice<AIChatRoomInformation>>>(`/core-service/ai-chatbox/rooms`, {
      params: { page, size },
    }),

  chatWithAI: (prompt: string, chatRoomId?: string, files?: File[]) => {
    const formData = new FormData();
    formData.append("prompt", prompt);
    if (chatRoomId) formData.append("chatRoomId", chatRoomId);
    if (files) {
      files.forEach((file) => formData.append("files", file));
    }

    return axiosClient.post<ApiResponse<AIChatResponse>>("/core-service/ai-chatbox/chat", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteChatRoom: (chatRoomId: string) =>
    axiosClient.delete<ApiResponse<void>>(`/core-service/ai-chatbox/room/${chatRoomId}`),
};
