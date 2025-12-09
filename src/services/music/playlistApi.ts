import axiosClient from "@/lib/axiosClient";
import type { 
    PlaylistDto, 
    PlaylistDetailDto, 
    CreatePlaylistRequest,
    ReorderPlaylistRequest 
} from "@/types/music/playlist";
import type { PageResponse } from "@/types/common/apiResponse";

export const playlistApi = {
    // Create a new playlist
    createPlaylist: async (data: CreatePlaylistRequest): Promise<PlaylistDto> => {
        const response = await axiosClient.post("/playlists", data);
        return response.data;
    },

    // Get all playlists for current user
    getPlaylists: async (): Promise<PlaylistDto[]> => {
        const response = await axiosClient.get("/playlists");
        return response.data;
    },

    // Get playlist details with songs
    getPlaylistDetail: async (id: number): Promise<PlaylistDetailDto> => {
        const response = await axiosClient.get(`/playlists/${id}`);
        return response.data;
    },

    // Delete a playlist
    deletePlaylist: async (id: number): Promise<void> => {
        await axiosClient.delete(`/playlists/${id}`);
    },

    // Update playlist (name and/or public status)
    updatePlaylist: async (id: number, data: { name?: string; isPublic?: boolean }): Promise<PlaylistDto> => {
        const response = await axiosClient.put(`/playlists/${id}`, data);
        return response.data;
    },  

    // Add a song to playlist
    addSongToPlaylist: async (playlistId: number, songId: number): Promise<{ alreadyExists: boolean }> => {
        const response = await axiosClient.post(`/playlists/${playlistId}/songs/${songId}`);
        return response.data;
    },

    // Remove a song from playlist
    removeSongFromPlaylist: async (playlistId: number, songId: number): Promise<void> => {
        await axiosClient.delete(`/playlists/${playlistId}/songs/${songId}`);
    },

    // Reorder songs in playlist
    reorderPlaylist: async (playlistId: number, orderedSongIds: number[]): Promise<void> => {
        const payload: ReorderPlaylistRequest = { orderedSongIds };
        await axiosClient.patch(`/playlists/${playlistId}/songs/reorder`, payload);
    },

    // Get all public playlists (for discover page)
    getPublicPlaylists: async (page: number = 0, size: number = 20): Promise<PageResponse<PlaylistDto>> => {
        const response = await axiosClient.get("/playlists/public", {
            params: { page, size }
        });
        return response.data;
    },
};
