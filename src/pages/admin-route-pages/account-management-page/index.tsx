import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { AccountSearchFilters } from "./components/AccountSearchFilters";
import { AccountManagementTable } from "./components/AccountManagementTable";
import type { UserSummaryResponse } from "@/types/common/userSummary";

const mockUsers: UserSummaryResponse[] = [
  {
    id: 1,
    email: "user1@example.com",
    name: "Nguyễn Văn A",
    avatarUrl: "",
    friendshipSummary: null,
  },
  {
    id: 2,
    email: "user2@example.com",
    name: "Trần Thị B",
    avatarUrl: "",
    friendshipSummary: null,
  },
  {
    id: 3,
    email: "user3@example.com",
    name: "Lê Văn C",
    avatarUrl: "",
    friendshipSummary: null,
  },
  {
    id: 4,
    email: "user4@example.com",
    name: "Phạm Thị D",
    avatarUrl: "",
    friendshipSummary: null,
  },
];

export default function AccountManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const handleViewDetails = (userId: number) => {
    console.log("[PingMe] View details for user ID:", userId);
  };

  return (
    <div className="flex-1 overflow-auto">
      <PageHeader
        title="Quản lý tài khoản"
        description="Quản lý người dùng và trạng thái tài khoản"
      />

      <AccountSearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Content */}
      <div className="p-8">
        <AccountManagementTable
          users={mockUsers}
          onViewDetails={handleViewDetails}
        />
      </div>
    </div>
  );
}
