"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { ReelsTopBar } from "./components/ReelTopBar"
import LoadingSpinner from "@/components/custom/LoadingSpinner"
import { EmptyState } from "@/components/custom/EmptyState"
import ReelDetailView from "./components/ReelDetailView"
import { CreateReelModal } from "./components/CreateReelModal"
import { EditReelModal } from "./components/EditReelModal"
import type { Reel } from "@/types/reels"
import { reelsApi } from "@/services/reels"
import { getErrorMessage } from "@/utils/errorMessageHandler"
import { useNavigate } from "react-router-dom"

export default function ReelsPage() {
  const navigate = useNavigate()
  const [reels, setReels] = useState<Reel[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFetching, setIsFetching] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    hasMore: true,
    isLoadingMore: false,
  })
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedReel, setSelectedReel] = useState<Reel | undefined>()
  const [searchResults, setSearchResults] = useState<Reel[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchTrigger, setSearchTrigger] = useState<string>("")

  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartRef = useRef<number | null>(null)
  const touchDeltaRef = useRef<number>(0)

  const fetchReels = useCallback(async (page: number, size: number, append = false) => {
    try {
      if (!append) setIsFetching(true)
      else setPagination((prev) => ({ ...prev, isLoadingMore: true }))

      const res = await reelsApi.getReelFeed(page, size)

      setReels((prev) => {
        if (append) {
          return [...prev, ...res.content]
        }
        return res.content
      })

      setPagination({
        currentPage: res.page,
        totalPages: res.totalPages,
        hasMore: res.hasMore,
        isLoadingMore: false,
      })
    } catch (err) {
      console.error("[v0] Error fetching reels:", getErrorMessage(err))
    } finally {
      setIsFetching(false)
      setPagination((prev) => ({ ...prev, isLoadingMore: false }))
    }
  }, [])

  useEffect(() => {
    fetchReels(0, 10)
  }, [fetchReels])

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      scrollTimeoutRef.current = setTimeout(() => {
        if (e.deltaY > 0) {
          // Scroll down - next video
          setCurrentIndex((prev) => {
            const nextIndex = prev + 1
            // Load more if near the end
            if (
              nextIndex >= (isSearching ? searchResults.length : reels.length) - 3 &&
              pagination.hasMore &&
              !pagination.isLoadingMore
            ) {
              fetchReels(pagination.currentPage + 1, 10, true)
            }
            return Math.min(nextIndex, (isSearching ? searchResults.length : reels.length) - 1)
          })
        } else {
          // Scroll up - previous video
          setCurrentIndex((prev) => Math.max(prev - 1, 0))
        }
      }, 100)
    },
    [reels.length, pagination, fetchReels, isSearching, searchResults.length],
  )

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      const handleTouchStart = (e: TouchEvent) => {
        touchStartRef.current = e.touches[0].clientY
        touchDeltaRef.current = 0
      }

      const handleTouchMove = (e: TouchEvent) => {
        if (touchStartRef.current === null) return
        const delta = touchStartRef.current - e.touches[0].clientY
        touchDeltaRef.current = delta
        // prevent native scroll while swiping in the feed
        e.preventDefault()
      }

      const handleTouchEnd = () => {
        const delta = touchDeltaRef.current
        const threshold = 50 // px
        if (delta > threshold) {
          setCurrentIndex((prev) => {
            const nextIndex = prev + 1
            if (
              nextIndex >= (isSearching ? searchResults.length : reels.length) - 3 &&
              pagination.hasMore &&
              !pagination.isLoadingMore
            ) {
              fetchReels(pagination.currentPage + 1, 10, true)
            }
            return Math.min(nextIndex, (isSearching ? searchResults.length : reels.length) - 1)
          })
        } else if (delta < -threshold) {
          setCurrentIndex((prev) => Math.max(prev - 1, 0))
        }
        touchStartRef.current = null
        touchDeltaRef.current = 0
      }

      container.addEventListener("wheel", handleWheel, { passive: false })
      container.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      })
      container.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      })
      container.addEventListener("touchend", handleTouchEnd, {
        passive: false,
      })

      return () => {
        container.removeEventListener("wheel", handleWheel)
        container.removeEventListener("touchstart", handleTouchStart)
        container.removeEventListener("touchmove", handleTouchMove)
        container.removeEventListener("touchend", handleTouchEnd)
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
      }
    }
  }, [handleWheel, reels.length, pagination, fetchReels, isSearching, searchResults.length])

  const handleReelUpdate = (updatedReel: Reel) => {
    setReels((prev) => prev.map((reel) => (reel.id === updatedReel.id ? updatedReel : reel)))
  }

  const handleReelDeleted = (reelId: number) => {
    setReels((prev) => prev.filter((reel) => reel.id !== reelId))
    if (currentIndex >= reels.length - 1) {
      setCurrentIndex(Math.max(0, reels.length - 2))
    }
  }

  const handleReelEdit = (reel: Reel) => {
    setSelectedReel(reel)
    setIsEditOpen(true)
  }

  const handleManageClick = () => {
    navigate("/reels/video-manager")
  }

  const handleSearchResults = (results: Reel[]) => {
    setSearchResults(results)
  }

  const handleSearchChange = (isSearching: boolean) => {
    setIsSearching(isSearching)
  }

  const handleReelClick = (reel: Reel) => {
    // Tìm trong search results nếu đang search
    if (isSearching && searchResults.length > 0) {
      const index = searchResults.findIndex((r) => r.id === reel.id)
      if (index !== -1) {
        setCurrentIndex(index)
        return
      }
    }
    
    // Nếu không tìm thấy trong search results, tìm trong danh sách chính
    const index = reels.findIndex((r) => r.id === reel.id)
    if (index !== -1) {
      // Nếu đang search, tắt search mode và load lại reels
      if (isSearching) {
        setIsSearching(false)
        setSearchResults([])
      }
      setCurrentIndex(index)
    } else {
      // Nếu không có trong reels hiện tại, thêm vào đầu danh sách
      setReels((prev) => [reel, ...prev])
      setCurrentIndex(0)
      if (isSearching) {
        setIsSearching(false)
        setSearchResults([])
      }
    }
  }

  const handleHashtagClick = (hashtag: string) => {
    // Trigger search with hashtag (with # prefix for display)
    setSearchTrigger(`#${hashtag}`)
    // Reset trigger after a short delay to allow new searches
    setTimeout(() => setSearchTrigger(""), 100)
  }

  return (
    <div ref={containerRef} className="flex h-screen bg-gray-900 flex-col overflow-hidden">
      <ReelsTopBar
        onManageClick={handleManageClick}
        onSearchResults={handleSearchResults}
        onSearchChange={handleSearchChange}
        onReelClick={handleReelClick}
        triggerSearch={searchTrigger}
      />

      {/* Full-Screen Reels Feed */}
      <div className="flex-1 relative overflow-hidden">
        {isFetching && reels.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : reels.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState title="Chưa có Reels" description="Hãy tạo hoặc theo dõi các Reels để xem tại đây" />
          </div>
        ) : (
          <div className="h-full w-full overflow-hidden relative">
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                transform: `translateY(-${currentIndex * 100}%)`,
                transition: "transform 420ms cubic-bezier(0.22, 0.8, 0.24, 1)",
              }}
            >
              {(isSearching ? searchResults : reels).map((r, i) => (
                <div key={r.id} className="h-full w-full">
                  <ReelDetailView
                    reel={r}
                    isActive={i === currentIndex}
                    onUpdate={handleReelUpdate}
                    onDelete={handleReelDeleted}
                    onEdit={handleReelEdit}
                    onHashtagClick={handleHashtagClick}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Counter removed per UX request */}
      </div>

      <CreateReelModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchReels(0, 10)}
      />

      <EditReelModal
        isOpen={isEditOpen}
        reel={selectedReel}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedReel(undefined)
        }}
        onSuccess={() => fetchReels(0, 10)}
      />
    </div>
  )
}
