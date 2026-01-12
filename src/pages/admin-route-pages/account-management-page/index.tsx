import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { AccountSearchFilters } from "./components/AccountSearchFilters";
import { AccountManagementTable } from "./components/AccountManagementTable";
import type {
  AccountFilterType,
  AccountStatusType,
  UserSummaryResponse,
} from "@/types/common/userSummary";
import { toast } from "sonner";
// Import hàm updateAccountStatus mới sửa
import {
  getAllUsers,
  updateAccountStatus,
} from "@/services/admin/userManagementApi.ts";
import { Button } from "@/components/ui/button";
import { UpdateStatusDialog } from "./components/UpdateStatusDialog";
import { ConfirmDialog } from "@/components/custom/ConfirmDialog";

const ITEMS_PER_PAGE = 7;

export default function AccountManagementPage() {
  const [users, setUsers] = useState<UserSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedStatus, setSelectedStatus] =
    useState<AccountFilterType>("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSummaryResponse | null>(
    null
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getAllUsers({
        page: currentPage,
        size: ITEMS_PER_PAGE,
        filter: "name,desc",
        search: searchQuery,
        status: selectedStatus,
      });

      if (!response.data.errorCode && response.data.data) {
        const pageData = response.data.data;
        setUsers(pageData.content);
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
      } else {
        setUsers([]);
        setTotalPages(0);
        toast.error(response.data.errorMessage || "Lỗi tải dữ liệu");
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể kết nối đến server");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, selectedStatus]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: AccountFilterType) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handleOpenUpdateStatus = (user: UserSummaryResponse) => {
    setSelectedUser(user);
    setIsUpdateDialogOpen(true);
  };

  // --- LOGIC GỌI API CHUNG ---
  // Hàm này dùng để gọi API cập nhật trạng thái cho mọi trường hợp
  const performUpdateStatus = async (id: number, status: AccountStatusType) => {
    try {
      // Gọi API patch/put
      const response = await updateAccountStatus(id, status);
      console.log(response);

      const isSuccess = response.data.data === true;

      if (isSuccess) {
        toast.success(`Cập nhật trạng thái ${status} thành công!`);
        fetchUsers();
      } else {
        toast.error(response.data.errorMessage || "Lỗi cập nhật trạng thái");
      }
    } catch (error) {
      toast.error("Lỗi kết nối: " + error);
    }
  };

  // --- LOGIC KHI BẤM NÚT LƯU TRONG DIALOG CẬP NHẬT ---
  const handleRequestUpdateStatus = async (
    userId: number,
    newStatus: AccountStatusType
  ) => {
    // 1. Nếu chọn DEACTIVATED -> Mở Confirm Dialog (chưa gọi API vội)
    if (newStatus === "DEACTIVATED") {
      setIsUpdateDialogOpen(false); // Đóng dialog chọn
      setPendingDeleteId(userId); // Lưu ID
      setIsConfirmOpen(true); // Mở dialog xác nhận
      return;
    }

    // 2. Nếu chọn ACTIVE hoặc SUSPENDED -> Gọi API luôn
    // Đóng dialog trước khi gọi API cho mượt
    setIsUpdateDialogOpen(false);
    await performUpdateStatus(userId, newStatus);
  };

  // --- LOGIC KHI BẤM XÁC NHẬN VÔ HIỆU HÓA ---
  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      setIsDeleting(true);
      // Gọi API với trạng thái DEACTIVATED
      await performUpdateStatus(pendingDeleteId, "DEACTIVATED");
      setIsConfirmOpen(false); // Đóng dialog xác nhận
    } finally {
      setIsDeleting(false);
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <PageHeader
        title="Quản lý tài khoản"
        description={`Quản lý ${totalElements} người dùng và trạng thái tài khoản`}
      />

      <AccountSearchFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
      />

      <div className="p-8">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            <AccountManagementTable
              users={users}
              onViewDetails={(id) => console.log(id)}
              onEditStatus={handleOpenUpdateStatus}
            />

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-purple-600" : ""}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}

        {!isLoading && users.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            Không tìm thấy kết quả nào.
          </div>
        )}
      </div>

      <UpdateStatusDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        user={selectedUser}
        onConfirm={handleRequestUpdateStatus}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Xác nhận vô hiệu hóa?"
        description="Hành động này sẽ vô hiệu hóa tài khoản người dùng này. Bạn có chắc chắn muốn tiếp tục?"
        onConfirm={handleConfirmDelete}
        confirmLabel="Vô hiệu hóa ngay"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
