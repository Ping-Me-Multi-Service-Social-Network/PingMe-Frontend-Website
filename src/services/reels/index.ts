import axiosClient from "@/lib/axiosClient"
import type {
  Reel,
  ReelFeedResponse,
  CreateReelRequest,
  UpdateReelRequest,
  CreateCommentRequest,
  ReelComment,
  ReelCommentResponse,
  ReactionType,
  ReelDetailResponse,
  SaveResponse,
} from "@/types/reels"
import type { ApiResponse } from "@/types/common/apiResponse"

export const reelsApi = {
  // Fetch reel feed with pagination
  getReelFeed: async (page = 0, size = 10) => {
    const response = await axiosClient.get<ApiResponse<ReelFeedResponse>>(`/reels/feed?page=${page}&size=${size}`)
    return response.data.data
  },

  // Get reel details by ID
  getReelById: async (reelId: number) => {
    const response = await axiosClient.get<ApiResponse<ReelDetailResponse>>(`/reels/${reelId}`)
    return response.data.data
  },

  // Create new reel
  createReel: async (data: CreateReelRequest) => {
    const formData = new FormData()
    formData.append("data", JSON.stringify({ caption: data.caption }))
    formData.append("video", data.video)

    const response = await axiosClient.post<ApiResponse<Reel>>("/reels", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data.data
  },

  // Update reel
  updateReel: async (reelId: number, data: UpdateReelRequest) => {
    const formData = new FormData()

    // Add caption as JSON in "data" field
    formData.append("data", JSON.stringify({ caption: data.caption }))

    // Only add video if it's provided (optional update)
    if (data.video) {
      formData.append("video", data.video)
    }

    const response = await axiosClient.put<ApiResponse<Reel>>(`/reels/${reelId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data.data
  },

  // Delete reel
  deleteReel: async (reelId: number) => {
    const response = await axiosClient.delete<ApiResponse<void>>(`/reels/${reelId}`)
    return response.data
  },

  // Toggle like
  toggleLike: async (reelId: number) => {
    const response = await axiosClient.post<ApiResponse<Reel>>(`/reels/${reelId}/likes/toggle`)
    return response.data.data
  },

  // Get comments for reel
  getComments: async (reelId: number, page = 0, size = 20) => {
    const response = await axiosClient.get<ApiResponse<ReelCommentResponse>>(
      `/reel-comments/reels/${reelId}?page=${page}&size=${size}`,
    )
    return response.data.data
  },

  // Create comment
  createComment: async (reelId: number, data: CreateCommentRequest) => {
    const response = await axiosClient.post<ApiResponse<ReelComment>>(`/reel-comments/reels/${reelId}`, data)
    return response.data.data
  },

  // Delete comment
  deleteComment: async (commentId: number) => {
    const response = await axiosClient.delete<ApiResponse<void>>(`/reel-comments/${commentId}`)
    return response.data
  },

  // Update comment
  updateComment: async (commentId: number, content: string) => {
    const response = await axiosClient.put<ApiResponse<ReelComment>>(`/reel-comments/${commentId}`, { content })
    return response.data.data
  },

  // Get user reels
  getUserReels: async (userId: number, page = 0, size = 10) => {
    const response = await axiosClient.get<ApiResponse<ReelFeedResponse>>(
      `/reels/user/${userId}?page=${page}&size=${size}`,
    )
    return response.data.data
  },

  // Search reels
  searchReels: async (query: string, page = 0, size = 10) => {
    const response = await axiosClient.get<ApiResponse<ReelFeedResponse>>(
      `/reels/search?query=${query}&page=${page}&size=${size}`,
    )
    return response.data.data
  },

  // Increment view count
  incrementViewCount: async (reelId: number) => {
    const response = await axiosClient.post<ApiResponse<Reel>>(`/reels/${reelId}/views`)
    return response.data.data
  },

  // Add comment reaction
  addCommentReaction: async (commentId: number, reactionType: ReactionType) => {
    const response = await axiosClient.post<ApiResponse<ReelComment>>(
      `/reel-comments/${commentId}/reactions?type=${reactionType}`,
    )
    return response.data.data
  },

  // Remove comment reaction
  removeCommentReaction: async (commentId: number) => {
    const response = await axiosClient.delete<ApiResponse<ReelComment>>(`/reel-comments/${commentId}/reactions`)
    return response.data.data
  },

  // Pin comment
  pinComment: async (commentId: number) => {
    const response = await axiosClient.post<ApiResponse<ReelComment>>(`/reel-comments/${commentId}/pin`)
    return response.data.data
  },

  // Unpin comment
  unpinComment: async (commentId: number) => {
    const response = await axiosClient.post<ApiResponse<ReelComment>>(`/reel-comments/${commentId}/unpin`)
    return response.data.data
  },

  // Get replies for a comment
  getCommentReplies: async (commentId: number, page = 0, size = 10) => {
    const response = await axiosClient.get<ApiResponse<ReelCommentResponse>>(
      `/reel-comments/${commentId}/replies?page=${page}&size=${size}`,
    )
    return response.data.data
  },

  // Toggle save
  toggleSave: async (reelId: number) => {
    const response = await axiosClient.post<ApiResponse<SaveResponse>>(`/reels/${reelId}/saves/toggle`)
    return response.data.data
  },

  getUserLikedReels: async (page = 0, size = 20) => {
    const response = await axiosClient.get<ApiResponse<ReelFeedResponse>>(`/reels/me/likes?page=${page}&size=${size}`)
    return response.data.data
  },

  getUserSavedReels: async (page = 0, size = 20) => {
    const response = await axiosClient.get<ApiResponse<ReelFeedResponse>>(`/reels/me/saved?page=${page}&size=${size}`)
    return response.data.data
  },

  getUserViewedReels: async (page = 0, size = 20) => {
    const response = await axiosClient.get<ApiResponse<ReelFeedResponse>>(`/reels/me/views?page=${page}&size=${size}`)
    return response.data.data
  },
}
