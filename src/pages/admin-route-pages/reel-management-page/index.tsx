"use client"

import { useState, useEffect, useCallback } from "react"
import { Play, Eye, Heart, MessageCircle, Bookmark, Calendar, User, Search, Filter, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { reelsApi } from "@/services/reels"
import type { AdminReel } from "@/types/reels"
import { toast } from "sonner"
import LoadingSpinner from "@/components/custom/LoadingSpinner"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Pagination from "@/components/custom/Pagination"
import ReelDetailModal from "./ReelDetailModal"

export default function ReelManagementPage() {
  const [reels, setReels] = useState<AdminReel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [captionFilter, setCaptionFilter] = useState("")
  const [userIdFilter, setUserIdFilter] = useState("")
  const [minViewsFilter, setMinViewsFilter] = useState("")
  const [maxViewsFilter, setMaxViewsFilter] = useState("")
  const [fromDateFilter, setFromDateFilter] = useState("")
  const [toDateFilter, setToDateFilter] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null)
  const [selectedReelId, setSelectedReelId] = useState<number | null>(null)

  const fetchReels = useCallback(async (
    page: number, 
    size: number, 
    caption?: string, 
    userId?: number, 
    minViews?: number, 
    maxViews?: number,
    from?: string,
    to?: string
  ) => {
    try {
      setIsLoading(true)
      const data = await reelsApi.getAdminReels(page, size, caption, userId, minViews, maxViews, from, to)
      setReels(data.content)
      setCurrentPage(data.page)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err) {
      console.error("Error fetching admin reels:", err)
      toast.error("Không thể tải danh sách reels")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const userId = userIdFilter ? Number(userIdFilter) : undefined
    const minViews = minViewsFilter ? Number(minViewsFilter) : undefined
    const maxViews = maxViewsFilter ? Number(maxViewsFilter) : undefined
    
    // Convert date to ISO datetime string
    const from = fromDateFilter ? `${fromDateFilter}T00:00:00` : undefined
    const to = toDateFilter ? `${toDateFilter}T23:59:59` : undefined
    
    fetchReels(currentPage, pageSize, captionFilter, userId, minViews, maxViews, from, to)
  }, [currentPage, pageSize, captionFilter, userIdFilter, minViewsFilter, maxViewsFilter, fromDateFilter, toDateFilter, fetchReels])

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size))
    setCurrentPage(0)
  }

  const handleCaptionFilterChange = (value: string) => {
    setCaptionFilter(value)
    setCurrentPage(0)
  }

  const handleUserIdFilterChange = (value: string) => {
    setUserIdFilter(value)
    setCurrentPage(0)
  }

  const handleMinViewsFilterChange = (value: string) => {
    setMinViewsFilter(value)
    setCurrentPage(0)
  }

  const handleMaxViewsFilterChange = (value: string) => {
    setMaxViewsFilter(value)
    setCurrentPage(0)
  }

  const handleFromDateFilterChange = (value: string) => {
    setFromDateFilter(value)
    setCurrentPage(0)
  }

  const handleToDateFilterChange = (value: string) => {
    setToDateFilter(value)
    setCurrentPage(0)
  }

  const filteredReels = reels.filter((reel) => {
    const matchesStatus = selectedStatus === "all" || reel.status === selectedStatus
    return matchesStatus
  })

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý Reels</h1>
        <p className="text-gray-600">Quản lý và kiểm duyệt nội dung video reels</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Caption Filter */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Lọc theo caption..."
                value={captionFilter}
                onChange={(e) => handleCaptionFilterChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* User ID Filter */}
          <div className="w-[100px]">
            <Input
              type="number"
              placeholder="User ID..."
              value={userIdFilter}
              onChange={(e) => handleUserIdFilterChange(e.target.value)}
            />
          </div>

          {/* Min Views Filter */}
          <div className="w-[120px]">
            <Input
              type="number"
              placeholder="Min views..."
              value={minViewsFilter}
              onChange={(e) => handleMinViewsFilterChange(e.target.value)}
              min="0"
            />
          </div>

          {/* Max Views Filter */}
          <div className="w-[120px]">
            <Input
              type="number"
              placeholder="Max views..."
              value={maxViewsFilter}
              onChange={(e) => handleMaxViewsFilterChange(e.target.value)}
              min="0"
            />
          </div>

          {/* From Date Filter */}
          <div className="w-[150px]">
            <Input
              type="date"
              value={fromDateFilter}
              onChange={(e) => handleFromDateFilterChange(e.target.value)}
              placeholder="Từ ngày..."
            />
          </div>

          {/* To Date Filter */}
          <div className="w-[150px]">
            <Input
              type="date"
              value={toDateFilter}
              onChange={(e) => handleToDateFilterChange(e.target.value)}
              placeholder="Đến ngày..."
            />
          </div>

          {/* Status Filter */}
          <div className="w-[180px]">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Chấp nhận</SelectItem>
                <SelectItem value="HIDDEN">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Page Size */}
          <div className="w-[150px]">
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 / trang</SelectItem>
                <SelectItem value="10">10 / trang</SelectItem>
                <SelectItem value="20">20 / trang</SelectItem>
                <SelectItem value="50">50 / trang</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex gap-6 text-sm text-gray-600">
            <div>
              <span className="font-semibold text-gray-900">{totalElements}</span> reels
            </div>
            <div>
              <span className="font-semibold text-gray-900">{filteredReels.length}</span> kết quả hiển thị
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredReels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Play className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">Không tìm thấy reel nào</p>
            <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="w-[100px]">Video</TableHead>
                  <TableHead className="min-w-[200px]">Caption</TableHead>
                  <TableHead className="w-[150px]">Người đăng</TableHead>
                  <TableHead className="w-[100px] text-center">Thống kê</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[150px]">Ngày tạo</TableHead>
                  <TableHead className="w-[100px] text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReels.map((reel) => (
                  <TableRow key={reel.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">#{reel.id}</TableCell>
                    
                    {/* Video Preview */}
                    <TableCell>
                      <button
                        onClick={() => setPreviewVideoUrl(reel.videoUrl)}
                        className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-blue-500 transition-all group"
                      >
                        <video
                          src={reel.videoUrl}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </button>
                    </TableCell>

                    {/* Caption */}
                    <TableCell>
                      <p className="text-sm line-clamp-2">{reel.caption}</p>
                    </TableCell>

                    {/* User */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {reel.userAvatarUrl ? (
                          <img
                            src={reel.userAvatarUrl}
                            alt={reel.userName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <span className="text-sm font-medium truncate">{reel.userName}</span>
                      </div>
                    </TableCell>

                    {/* Stats */}
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="w-3 h-3" />
                          <span>{reel.viewCount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-600">
                          <Heart className="w-3 h-3" />
                          <span>{reel.likeCount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600">
                          <MessageCircle className="w-3 h-3" />
                          <span>{reel.commentCount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Bookmark className="w-3 h-3" />
                          <span>{reel.saveCount}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {reel.status ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            reel.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : reel.status === "HIDDEN"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {reel.status === "ACTIVE"
                            ? "Chấp nhận"
                            : reel.status === "HIDDEN"
                              ? "Từ chối"
                              : reel.status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Chưa xác định</span>
                      )}
                    </TableCell>

                    {/* Created At */}
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(new Date(reel.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReelId(reel.id)}
                        >
                          <Info className="w-4 h-4 mr-1" />
                          Chi tiết
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 p-4">
                <Pagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  itemsPerPage={pageSize}
                  setItemsPerPage={setPageSize}
                  showItemsPerPageSelect={false}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Video Preview Modal */}
      {previewVideoUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewVideoUrl(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <video
              src={previewVideoUrl}
              controls
              autoPlay
              className="w-full rounded-lg"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setPreviewVideoUrl(null)}
            >
              Đóng
            </Button>
          </div>
        </div>
      )}

      {/* Reel Detail Modal */}
      {selectedReelId && (
        <ReelDetailModal
          reelId={selectedReelId}
          onClose={() => setSelectedReelId(null)}
        />
      )}
    </div>
  )
}
