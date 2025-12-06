"use client"

import { useState, useEffect } from "react"
import { reelsApi } from "@/services/reels"
import type { Reel } from "@/types/reels"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Bookmark, Eye, Play } from "lucide-react"
import LoadingSpinner from "@/components/custom/LoadingSpinner"
import { EmptyState } from "@/components/custom/EmptyState"

interface ReelsLibraryProps {
  isOpen: boolean
  onClose: () => void
  onReelClick?: (reel: Reel) => void
}

const ReelThumbnail = ({ reel, onClick }: { reel: Reel; onClick?: () => void }) => {
  return (
    <div 
      className="relative aspect-[3/4] bg-gray-800 rounded overflow-hidden cursor-pointer group hover:opacity-80"
      onClick={onClick}
    >
      <video
        src={reel.videoUrl}
        className="w-full h-full object-cover"
        preload="metadata"
      />
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Play className="w-12 h-12 text-white" fill="white" />
      </div>
    </div>
  )
}

export function ReelsLibrary({ isOpen, onClose, onReelClick }: ReelsLibraryProps) {
  const [activeTab, setActiveTab] = useState<"likes" | "saves" | "views">("likes")
  const [likedReels, setLikedReels] = useState<Reel[]>([])
  const [savedReels, setSavedReels] = useState<Reel[]>([])
  const [viewedReels, setViewedReels] = useState<Reel[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const loadLibraryReels = async () => {
      setIsLoading(true)
      try {
        const [liked, saved, viewed] = await Promise.all([
          reelsApi.getUserLikedReels(0, 50),
          reelsApi.getUserSavedReels(0, 50),
          reelsApi.getUserViewedReels(0, 50),
        ])
        setLikedReels(liked.content)
        setSavedReels(saved.content)
        setViewedReels(viewed.content)
      } catch (error) {
        console.log("[v0] Error loading library reels:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLibraryReels()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-[80vw] h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Thư viện của tôi</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <LoadingSpinner />
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "likes" | "saves" | "views")}
            className="flex-1 flex flex-col"
          >
            <TabsList className="w-full rounded-none bg-gray-800 border-b border-gray-700">
              <TabsTrigger 
                value="likes" 
                className="flex items-center gap-2 flex-1 font-bold text-white data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <Heart className="w-4 h-4" />
                Yêu thích ({likedReels.length})
              </TabsTrigger>
              <TabsTrigger 
                value="saves" 
                className="flex items-center gap-2 flex-1 font-bold text-white data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <Bookmark className="w-4 h-4" />
                Đã lưu ({savedReels.length})
              </TabsTrigger>
              <TabsTrigger 
                value="views" 
                className="flex items-center gap-2 flex-1 font-bold text-white data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <Eye className="w-4 h-4" />
                Đã xem ({viewedReels.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="likes" className="m-0 p-4">
                {likedReels.length === 0 ? (
                  <EmptyState title="Chưa có reel yêu thích" description="Những reel bạn thích sẽ hiển thị ở đây" />
                ) : (
                  <div className="grid grid-cols-5 gap-2">
                    {likedReels.map((reel) => (
                      <ReelThumbnail 
                        key={reel.id} 
                        reel={reel} 
                        onClick={() => {
                          onReelClick?.(reel)
                          onClose()
                        }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="saves" className="m-0 p-4">
                {savedReels.length === 0 ? (
                  <EmptyState title="Chưa có reel được lưu" description="Những reel bạn lưu sẽ hiển thị ở đây" />
                ) : (
                  <div className="grid grid-cols-5 gap-2">
                    {savedReels.map((reel) => (
                      <ReelThumbnail 
                        key={reel.id} 
                        reel={reel} 
                        onClick={() => {
                          onReelClick?.(reel)
                          onClose()
                        }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="views" className="m-0 p-4">
                {viewedReels.length === 0 ? (
                  <EmptyState title="Chưa có reel được xem" description="Những reel bạn xem sẽ hiển thị ở đây" />
                ) : (
                  <div className="grid grid-cols-5 gap-2">
                    {viewedReels.map((reel) => (
                      <ReelThumbnail 
                        key={reel.id} 
                        reel={reel} 
                        onClick={() => {
                          onReelClick?.(reel)
                          onClose()
                        }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  )
}