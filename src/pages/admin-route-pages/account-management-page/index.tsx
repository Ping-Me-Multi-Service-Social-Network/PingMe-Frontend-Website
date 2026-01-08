import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { AccountSearchFilters } from "./components/AccountSearchFilters";
import { AccountManagementTable } from "./components/AccountManagementTable";
import type { UserSummaryResponse } from "@/types/common/userSummary";
import { toast } from "sonner";
import { getAllUsers } from "@/services/common/userLookupApi";

export default function AccountManagementPage() {
  const [users, setUsers] = useState<UserSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getAllUsers({
        page: pagination.page,
        size: pagination.size,
        filter: "id,desc",
      });

      if (response.data.errorCode === null) {
        const pageData = response.data.data;
        setUsers(pageData.content);
        setPagination((prev) => ({
          ...prev,
          totalElements: pageData.totalElements,
          totalPages: pageData.totalPages,
        }));
      } else {
        toast.error(response.data.errorMessage || "Lỗi tải dữ liệu");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Không thể kết nối đến server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.size]);

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
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : (
          <AccountManagementTable
            users={users}
            onViewDetails={handleViewDetails}
          />
        )}

        {!isLoading && users.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            Không tìm thấy tài khoản nào.
          </div>
        )}
      </div>
    </div>
  );
}
