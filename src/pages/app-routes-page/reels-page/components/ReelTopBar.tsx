import { SearchBar } from "./SearchBar.tsx";
import type { Reel } from "@/types/reels";
import { Library } from "lucide-react";
import { useState } from "react";
import { ReelsLibrary } from "./ReelsLibrary.tsx";
import { useTranslation } from "react-i18next";

interface ReelsTopBarProps {
  onCreateClick?: () => void;
  onManageClick?: () => void;
  onSearchResults?: (reels: Reel[]) => void;
  onSearchChange?: (isSearching: boolean) => void;
  onReelClick?: (reel: Reel) => void;
  triggerSearch?: string;
}

export function ReelsTopBar({
  onManageClick,
  onSearchResults,
  onSearchChange,
  onReelClick,
  triggerSearch,
}: ReelsTopBarProps) {
  const { t } = useTranslation("reels");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  return (
    <>
      <div className="reels-topbar">
        <span className="reels-topbar__title">{t("topBar.title")}</span>

        <div className="reels-search-wrapper">
          <SearchBar
            onSearchResults={onSearchResults}
            onSearchChange={onSearchChange}
            onReelClick={onReelClick}
            triggerSearch={triggerSearch}
          />
        </div>

        <div className="reels-topbar__actions">
          <button
            className="reels-topbar__btn"
            onClick={() => setIsLibraryOpen(true)}
          >
            <Library />
            {t("topBar.library")}
          </button>

          <button className="reels-topbar__btn" onClick={onManageClick}>
            {t("topBar.manage")}
          </button>
        </div>
      </div>

      <ReelsLibrary
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onReelClick={onReelClick}
      />
    </>
  );
}
