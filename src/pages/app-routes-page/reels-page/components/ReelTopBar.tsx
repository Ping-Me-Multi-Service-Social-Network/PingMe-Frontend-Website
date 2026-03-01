"use client"

import { Button } from "@/components/ui/button.tsx"
import { SearchBar } from "./SearchBar.tsx"
import type { Reel } from "@/types/reels"
import { Library } from "lucide-react"
import { useState } from "react"
import { ReelsLibrary } from "./ReelsLibrary.tsx"
import { useTranslation } from "react-i18next"

interface ReelsTopBarProps {
  onCreateClick?: () => void
  onManageClick?: () => void
  onSearchResults?: (reels: Reel[]) => void
  onSearchChange?: (isSearching: boolean) => void
  onReelClick?: (reel: Reel) => void
  triggerSearch?: string
}

export function ReelsTopBar({ onManageClick, onSearchResults, onSearchChange, onReelClick, triggerSearch }: ReelsTopBarProps) {
  const { t } = useTranslation("reels")
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)

  return (
    <>
      <div className="p-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white whitespace-nowrap">{t("topBar.title")}</h2>

          <div className="flex-1 max-w-md">
            <SearchBar
              onSearchResults={onSearchResults || (() => { })}
              onSearchChange={onSearchChange || (() => { })}
              onReelClick={onReelClick}
              triggerSearch={triggerSearch}
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2 text-gray-200 border-gray-600 hover:bg-gray-800 bg-transparent whitespace-nowrap"
            onClick={() => setIsLibraryOpen(true)}
          >
            <Library className="w-4 h-4" />
            {t("topBar.library")}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2 text-gray-200 border-gray-600 hover:bg-gray-800 bg-transparent whitespace-nowrap"
            onClick={onManageClick}
          >
            {t("topBar.manage")}
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
