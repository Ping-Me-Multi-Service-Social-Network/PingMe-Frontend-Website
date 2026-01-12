"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Import Type Filter
import type { AccountFilterType } from "@/types/common/userSummary";
import { Search } from "lucide-react";

interface AccountSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatus: AccountFilterType; // Dùng type Filter
  onStatusChange: (value: AccountFilterType) => void;
}

export const AccountSearchFilters = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
}: AccountSearchFiltersProps) => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-11 border-purple-200 focus:border-purple-400 focus:ring-purple-200"
            />
          </div>

          <Select
            value={selectedStatus}
            // Ép kiểu về AccountFilterType khi change
            onValueChange={(val) => onStatusChange(val as AccountFilterType)}
          >
            <SelectTrigger className="w-full md:w-48 h-11 border-purple-200 focus:border-purple-400 focus:ring-purple-200">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="SUSPENDED">Tạm khóa</SelectItem>
              <SelectItem value="DEACTIVATED">Bị khóa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
