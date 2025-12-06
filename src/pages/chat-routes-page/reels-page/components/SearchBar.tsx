"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, X, Clock, History, Trash2 } from "lucide-react"
import { reelsApi } from "@/services/reels"
import type { Reel, SearchHistoryItem } from "@/types/reels"
import { getErrorMessage } from "@/utils/errorMessageHandler"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { toast } from "sonner"

interface SearchBarProps {
  onSearchResults: (reels: Reel[]) => void
  onSearchChange: (isSearching: boolean) => void
  onReelClick?: (reel: Reel) => void
}

export function SearchBar({ onSearchResults, onSearchChange, onReelClick }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<Reel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const searchBoxRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load search history
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        setIsLoadingHistory(true)
        const data = await reelsApi.getSearchHistory(0, 10)
        // Filter unique queries (keep only the most recent one for each query)
        const uniqueHistory = data.content.filter(
          (item, index, self) => index === self.findIndex((t) => t.query.toLowerCase() === item.query.toLowerCase()),
        )
        setSearchHistory(uniqueHistory)
      } catch (err) {
        console.error("Error loading search history:", err)
      } finally {
        setIsLoadingHistory(false)
      }
    }
    loadSearchHistory()
  }, [])

  // Handle search with debounce
  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        setIsOpen(false)
        onSearchResults([])
        onSearchChange(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await reelsApi.searchReels(searchQuery, 0, 20)
        setResults(data.content)
        setIsOpen(true)
        onSearchResults(data.content)
        onSearchChange(true)
      } catch (err) {
        setError(getErrorMessage(err))
        setResults([])
      } finally {
        setIsLoading(false)
      }
    },
    [onSearchResults, onSearchChange],
  )

  // Debounce search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (!query.trim()) {
      setResults([])
      setIsOpen(false)
      setIsLoading(false)
      onSearchResults([])
      onSearchChange(false)
      return
    }

    setIsLoading(true)
    debounceTimerRef.current = setTimeout(() => {
      handleSearch(query)
    }, 500)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query])

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleClear = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
    setShowHistory(false)
    onSearchResults([])
    onSearchChange(false)
  }

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery)
    setShowHistory(false)
    handleSearch(historyQuery)
  }

  const handleInputFocus = () => {
    if (!query) {
      setShowHistory(true)
      setIsOpen(true)
    } else {
      setIsOpen(true)
    }
  }

  const handleDeleteHistory = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    try {
      await reelsApi.deleteSearchHistory(id)
      setSearchHistory((prev) => prev.filter((item) => item.id !== id))
      toast.success("Đã xóa lịch sử tìm kiếm")
    } catch (err) {
      console.error("Error deleting search history:", err)
      toast.error("Không thể xóa lịch sử tìm kiếm")
    }
  }

  return (
    <div ref={searchBoxRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
        <Input
          type="text"
          placeholder="Tìm kiếm video..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowHistory(false)
          }}
          onFocus={handleInputFocus}
          className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {query && (
          <button onClick={handleClear} className="absolute right-3 text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {showHistory && !query ? (
            // Show search history
            <div className="py-2">
              <div className="px-4 py-2 flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase">
                <History className="w-4 h-4" />
                Lịch sử tìm kiếm
              </div>
              {isLoadingHistory ? (
                <div className="p-4 text-center text-gray-400 text-sm">Đang tải...</div>
              ) : searchHistory.length > 0 ? (
                searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors flex items-center gap-3 group"
                    onClick={() => handleHistoryClick(item.query)}
                  >
                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.query}</p>
                      <p className="text-xs text-gray-500">
                        {item.searchedAt
                          ? formatDistanceToNow(new Date(item.searchedAt), {
                              addSuffix: true,
                              locale: vi,
                            })
                          : "Gần đây"}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteHistory(e, item.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-600 rounded-full transition-all flex-shrink-0"
                      title="Xóa lịch sử"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400 text-sm">Chưa có lịch sử tìm kiếm</div>
              )}
            </div>
          ) : query ? (
            // Show search results
            <>
              {isLoading ? (
                <div className="p-4 text-center text-gray-400">Đang tìm kiếm...</div>
              ) : error ? (
                <div className="p-4 text-center text-red-400">{error}</div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((reel) => (
                    <div
                      key={reel.id}
                      className="px-4 py-2 hover:bg-gray-700 cursor-pointer transition-colors flex items-center gap-3"
                      onClick={() => {
                        onReelClick?.(reel)
                        setIsOpen(false)
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded bg-gray-700 overflow-hidden flex-shrink-0">
                        <video src={reel.videoUrl} className="w-full h-full object-cover" />
                      </div>

                      {/* Video info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {reel.caption || "Video không tiêu đề"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {reel.userName} • {reel.viewCount} lượt xem
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-400">Không tìm thấy video nào</div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
