import type { ApiResponse } from "@/types/base/apiResponse";
import { isAxiosError } from "axios";
import i18n from "@/i18n";

export const getErrorMessage = (
  err: unknown,
  fallbackMessage?: string
): string => {
  const defaultFallback = i18n.t("common.errors.actionFail", { defaultValue: "Action failed" });
  const message = fallbackMessage || defaultFallback;

  console.log("[PingMe] Error:", err);
  if (isAxiosError(err)) {
    const res = err.response?.data as ApiResponse<unknown>;

    return res?.errorMessage || message;
  }

  return message;
};
