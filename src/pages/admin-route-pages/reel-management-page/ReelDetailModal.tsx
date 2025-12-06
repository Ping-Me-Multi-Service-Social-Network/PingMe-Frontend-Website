import { useState, useEffect } from "react"
import { X, Eye, Heart, MessageCircle, Bookmark, Calendar, User, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { reelsApi } from "@/services/reels"
import type { AdminReelDetail } from "@/types/reels"
import { toast } from "sonner"
import LoadingSpinner from "@/components/custom/LoadingSpinner"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface ReelDetailModalProps {
  reelId: number
  onClose: () => void
}

export default function ReelDetailModal({ reelId, onClose }: ReelDetailModalProps) {
  const [reel, setReel] = useState<AdminReelDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReelDetail = async () => {
      try {
        setIsLoading(true)
        const data = await reelsApi.getAdminReelDetail(reelId)
        setReel(data)
      } catch (error) {
        console.error("Error fetching reel detail:", error)
        toast.error("Không thể tải chi tiết reel")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReelDetail()
  }, [reelId])

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">Chưa xét duyệt</Badge>
    
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Chấp nhận</Badge>
      case "HIDDEN":
        return <Badge className="bg-red-500">Từ chối</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!reel) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Chi tiết Reel #{reel.id}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Player */}
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-[9/16] max-h-[600px]">
                <video
                  src={reel.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  playsInline
                />
              </div>
            </div>

            {/* Information */}
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                {reel.userAvatarUrl ? (
                  <img
                    src={reel.userAvatarUrl}
                    alt={reel.userName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {reel.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold">{reel.userName}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    User ID: {reel.userId}
                  </p>
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">Caption</h3>
                <p className="text-gray-600 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {reel.caption}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Lượt xem</p>
                    <p className="font-semibold text-blue-600">{reel.viewCount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg">
                  <Heart className="w-5 h-5 text-pink-600" />
                  <div>
                    <p className="text-sm text-gray-600">Lượt thích</p>
                    <p className="font-semibold text-pink-600">{reel.likeCount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Bình luận</p>
                    <p className="font-semibold text-green-600">{reel.commentCount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                  <Bookmark className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Lượt lưu</p>
                    <p className="font-semibold text-purple-600">{reel.saveCount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">Trạng thái</h3>
                <div className="flex items-center gap-2">
                  {getStatusBadge(reel.status)}
                </div>
              </div>

              {/* Admin Note */}
              {reel.adminNote && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700">Ghi chú của Admin</h3>
                  <p className="text-gray-600 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    {reel.adminNote}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Ngày tạo:</span>
                  <span className="font-medium">
                    {new Date(reel.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(reel.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
