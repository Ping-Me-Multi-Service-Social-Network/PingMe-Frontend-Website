import axiosClient from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/base/apiResponse";
import type { AudioTranscribeResponse } from "@/types/ai/audioTranscribeResponse";

export const audioTranscribeService = {
  transcribeAudio: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosClient.post<ApiResponse<AudioTranscribeResponse>>("/transcribe/audio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};