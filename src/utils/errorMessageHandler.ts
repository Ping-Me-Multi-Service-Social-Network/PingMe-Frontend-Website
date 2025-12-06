import type { ApiResponse } from "@/types/common/apiResponse";
import axios from "axios";

export const getErrorMessage = (
  err: unknown,
  fallbackMessage = "Thao tác thất bại"
): string => {
  console.log("[PingMe] Error:", err);
  if (axios.isAxiosError(err)) {
    const res = err.response?.data as ApiResponse<unknown>;

    return res?.errorMessage || fallbackMessage;
  }

  return fallbackMessage;
};
