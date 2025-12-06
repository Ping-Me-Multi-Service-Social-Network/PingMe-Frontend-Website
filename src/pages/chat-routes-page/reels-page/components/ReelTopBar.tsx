"use client"

import { Button } from "@/components/ui/button"
import { SearchBar } from "./SearchBar"
import type { Reel } from "@/types/reels"
import { Library } from "lucide-react"
import { useState } from "react"
import { ReelsLibrary } from "./ReelsLibrary"

interface ReelsTopBarProps {
  onCreateClick?: () => void
  onManageClick?: () => void
  onSearchResults?: (reels: Reel[]) => void
  onSearchChange?: (isSearching: boolean) => void
  onReelClick?: (reel: Reel) => void
}

export function ReelsTopBar({ onManageClick, onSearchResults, onSearchChange, onReelClick }: ReelsTopBarProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)

  return (
    <>
      <div className="p-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white whitespace-nowrap">Reels</h2>

          <div className="flex-1 max-w-md">
            <SearchBar 
              onSearchResults={onSearchResults || (() => {})} 
              onSearchChange={onSearchChange || (() => {})} 
              onReelClick={onReelClick}
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2 text-gray-200 border-gray-600 hover:bg-gray-800 bg-transparent whitespace-nowrap"
            onClick={() => setIsLibraryOpen(true)}
          >
            <Library className="w-4 h-4" />
            Thư viện
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2 text-gray-200 border-gray-600 hover:bg-gray-800 bg-transparent whitespace-nowrap"
            onClick={onManageClick}
          >
            Quản lý
          </Button>
        </div>
      </div>

      <ReelsLibrary 
        isOpen={isLibraryOpen} 
        onClose={() => setIsLibraryOpen(false)} 
        onReelClick={onReelClick}
      />
    </>
  )
}
