"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReelDetailView from "../components/ReelDetailView"
import LoadingSpinner from "@/components/custom/LoadingSpinner"
import { EmptyState } from "@/components/custom/EmptyState"
import type { Reel } from "@/types/reels"
import { reelsApi } from "@/services/reels"

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get("q") || ""
  
  const [reels, setReels] = useState<Reel[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartRef = useRef<number | null>(null)
  const touchDeltaRef = useRef<number>(0)

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        navigate("/reels")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await reelsApi.searchReels(query, 0, 50)
        
        // Client-side filtering
        const searchLower = query.toLowerCase().replace(/^#/, '')
        const filteredResults = data.content.filter((reel) => {
          const captionMatch = reel.caption?.toLowerCase().includes(searchLower)
          const hashtagMatch = reel.hashtags?.some(tag => 
            tag.toLowerCase().includes(searchLower)
          )
          const userMatch = reel.userName?.toLowerCase().includes(searchLower)
          
          return captionMatch || hashtagMatch || userMatch
        })
        
        setReels(filteredResults)
      } catch (err) {
        console.error("Error searching reels:", err)
        setError("Không thể tìm kiếm reels")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSearchResults()
  }, [query, navigate])

  const handleReelUpdate = (updatedReel: Reel) => {
    setReels((prev) =>
      prev.map((r) => (r.id === updatedReel.id ? updatedReel : r))
    )
  }

  const handleReelDeleted = (reelId: number) => {
    setReels((prev) => prev.filter((r) => r.id !== reelId))
    if (currentIndex >= reels.length - 1) {
      setCurrentIndex(Math.max(0, reels.length - 2))
    }
  }

  const handleHashtagClick = (hashtag: string) => {
    navigate(`/reels/search?q=${encodeURIComponent(`#${hashtag}`)}`)
  }

  const handleBackToMain = () => {
    navigate("/reels")
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1)
      } else if (e.key === "ArrowDown" && currentIndex < reels.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentIndex, reels.length])

  // Wheel + Touch navigation
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      scrollTimeoutRef.current = setTimeout(() => {
        if (e.deltaY > 0) {
          // Scroll down - next video
          setCurrentIndex((prev) => Math.min(prev + 1, reels.length - 1))
        } else {
          // Scroll up - previous video
          setCurrentIndex((prev) => Math.max(prev - 1, 0))
        }
      }, 100)
    },
    [reels.length],
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
          setCurrentIndex((prev) => Math.min(prev + 1, reels.length - 1))
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
  }, [handleWheel, reels.length])

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-900 flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToMain}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay về
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error || reels.length === 0) {
    return (
      <div className="flex h-screen bg-gray-900 flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToMain}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay về
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            title={error || `Không tìm thấy kết quả cho "${query}"`}
            description="Thử tìm kiếm với từ khóa khác"
          />
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex h-screen bg-gray-900 flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToMain}
          className="text-white hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay về
        </Button>
        <div className="text-white text-sm">
          Kết quả tìm kiếm: <span className="font-semibold">{query}</span>
          <span className="ml-2 text-gray-400">({reels.length} video)</span>
        </div>
      </div>

      {/* Reels Feed */}
      <div className="flex-1 relative overflow-hidden">
        <div className="h-full w-full overflow-hidden relative">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              transform: `translateY(-${currentIndex * 100}%)`,
              transition: "transform 420ms cubic-bezier(0.22, 0.8, 0.24, 1)",
            }}
          >
            {reels.map((reel, index) => (
              <div key={reel.id} className="h-full w-full">
                <ReelDetailView
                  reel={reel}
                  isActive={index === currentIndex}
                  onUpdate={handleReelUpdate}
                  onDelete={handleReelDeleted}
                  onHashtagClick={handleHashtagClick}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
