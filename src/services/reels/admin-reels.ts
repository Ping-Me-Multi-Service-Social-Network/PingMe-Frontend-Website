import axiosMusicClient from "@/lib/axiosMusicClient";
import type {
  AdminReelResponse,
  AdminReelDetail,
  HideReelResponse,
} from "@/types/reels";
import type { ApiResponse } from "@/types/base/apiResponse";

/**
 * ======================================
 * ADMIN REELS OPERATIONS
 * ======================================
 */

export const getAdminReels = async (
  page = 0,
  size = 10,
  caption?: string,
  userId?: number,
  minViews?: number,
  maxViews?: number,
  from?: string,
  to?: string
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (caption && caption.trim()) {
    params.append("caption", caption.trim());
  }

  if (userId) {
    params.append("userId", userId.toString());
  }

  if (minViews !== undefined && minViews >= 0) {
    params.append("minViews", minViews.toString());
  }

  if (maxViews !== undefined && maxViews >= 0) {
    params.append("maxViews", maxViews.toString());
  }

  if (from && from.trim()) {
    params.append("from", from.trim());
  }

  if (to && to.trim()) {
    params.append("to", to.trim());
  }

  const response = await axiosMusicClient.get<ApiResponse<AdminReelResponse>>(
    `/admin/reels?${params.toString()}`
  );
  return response.data.data;
};

export const getAdminReelDetail = async (reelId: number) => {
  const response = await axiosMusicClient.get<ApiResponse<AdminReelDetail>>(
    `/admin/reels/${reelId}`
  );
  return response.data.data;
};

export const hardDeleteAdminReel = async (reelId: number) => {
  const response = await axiosMusicClient.delete<ApiResponse<void>>(
    `/admin/reels/${reelId}/hard`
  );
  return response.data;
};

export const hideAdminReel = async (reelId: number, reason?: string) => {
  const response = await axiosMusicClient.patch<ApiResponse<HideReelResponse>>(
    `/admin/reels/${reelId}/hide`,
    { reason }
  );
  return response.data.data;
};

export const unhideAdminReel = async (reelId: number) => {
  const response = await axiosMusicClient.patch<ApiResponse<HideReelResponse>>(
    `/admin/reels/${reelId}/unhide`
  );
  return response.data.data;
};
