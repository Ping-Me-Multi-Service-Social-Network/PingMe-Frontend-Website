import axiosClient from "@/lib/axiosClient";
import type { FavoriteDto } from "@/types/music/favorite";

export const favoriteApi = {
    // Get all favorite songs for current user
    getFavorites: async (): Promise<FavoriteDto[]> => {
        const response = await axiosClient.get("/favorites");
        return response.data;
    },

    // Add a song to favorites
    addFavorite: async (songId: number): Promise<void> => {
        await axiosClient.post(`/favorites/${songId}`);
    },

    // Remove a song from favorites
    removeFavorite: async (songId: number): Promise<void> => {
        await axiosClient.delete(`/favorites/${songId}`);
    },

    // Check if a song is in favorites
    isFavorite: async (songId: number): Promise<boolean> => {
        const response = await axiosClient.get(`/favorites/is/${songId}`);
        return response.data;
    },
};
