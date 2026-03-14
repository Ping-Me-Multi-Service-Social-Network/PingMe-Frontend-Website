import axiosMusicClient from "@/lib/axiosMusicClient";
import type { ApiResponse } from "@/types/base/apiResponse";

const COMMON_URL = "/music-service/common";

/**
 * Common service for shared music operations
 */
export const commonService = {
  /**
   * Get music dashboard data
   */
  getMusicDashboard: async () => {
    const response = await axiosMusicClient.get(`${COMMON_URL}/dashboard`);
    return response.data;
  },

  /**
   * Get available artist roles
   */
  getArtistRoles: async (): Promise<string[]> => {
    const response = await axiosMusicClient.get<ApiResponse<string[]>>(
      `${COMMON_URL}/roles`,
    );
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },
};
