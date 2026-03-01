"use client"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useReelNavigation } from "@/hooks/useReelNavigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button.tsx"
import ReelDetailView from "../components/ReelDetailView.tsx"
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx"
import { EmptyState } from "@/components/custom/EmptyState.tsx"
import type { Reel } from "@/types/reels"
import { reelsApi } from "@/services/reels"

export default function SearchResultsPage() {
  const { t } = useTranslation("reels")
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get("q") || ""

  const [reels, setReels] = useState<Reel[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        navigate("/app/reels")
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
        setError(t("search.searchError"))
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
    navigate(`/app/reels/search?q=${encodeURIComponent(`#${hashtag}`)}`)
  }

  const handleBackToMain = () => {
    navigate("/app/reels")
  }

  const { containerRef } = useReelNavigation({
    setCurrentIndex,
    totalItems: reels.length,
  })

  const BackHeader = ({ children }: { children?: React.ReactNode }) => (
    <div className="p-4 border-b border-gray-700 bg-gray-900 flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBackToMain}
        className="text-white hover:bg-gray-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("search.back")}
      </Button>
      {children}
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-900 flex-col overflow-hidden">
        <BackHeader />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error || reels.length === 0) {
    return (
      <div className="flex h-screen bg-gray-900 flex-col overflow-hidden">
        <BackHeader />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            title={error || t("search.resultsFor", { query })}
            description={t("search.tryOther")}
          />
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex h-screen bg-gray-900 flex-col overflow-hidden">
      {/* Header */}
      <BackHeader>
        <div className="text-white text-sm">
          {t("search.resultsFor", { query })}
          <span className="ml-2 text-gray-400">{t("search.video_count", { count: reels.length })}</span>
        </div>
      </BackHeader>

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
