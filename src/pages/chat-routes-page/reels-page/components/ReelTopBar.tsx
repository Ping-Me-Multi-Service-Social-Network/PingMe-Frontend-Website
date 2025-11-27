"use client";

import { Button } from "@/components/ui/button";

interface ReelsTopBarProps {
  onCreateClick?: () => void;
  onManageClick?: () => void;
}

export function ReelsTopBar({ onManageClick }: ReelsTopBarProps) {
  return (
    <div className="p-4 border-b border-gray-700 bg-gray-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Reels</h2>
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-2 text-gray-200 border-gray-600 hover:bg-gray-800 bg-transparent"
          onClick={onManageClick}
        >
          Quản lý
        </Button>
      </div>
    </div>
  );
}
