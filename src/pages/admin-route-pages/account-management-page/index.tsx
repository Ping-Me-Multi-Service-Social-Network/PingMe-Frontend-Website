import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { AccountSearchFilters } from "./components/AccountSearchFilters";
import { AccountManagementTable } from "./components/AccountManagementTable";
import type {
  AccountStatusType,
  UserSummaryResponse,
} from "@/types/common/userSummary";
import { toast } from "sonner";
import { getAllUsers, deleteUser } from "@/services/user/userApi";
import { Button } from "@/components/ui/button";
import { UpdateStatusDialog } from "./components/UpdateStatusDialog";

import { ConfirmDialog } from "@/components/custom/ConfirmDialog";

const ITEMS_PER_PAGE = 7;

export default function AccountManagementPage() {
  const [allUsers, setAllUsers] = useState<UserSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // --- STATE DIALOG ---
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSummaryResponse | null>(
    null
  );

  // State cho Confirm Dialog
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAllUsers = async () => {
    try {
      setIsLoading(true);
      // Gọi size 1000 để lấy hết dữ liệu về frontend
      const response = await getAllUsers({
        page: 0,
        size: 1000,
        filter: "id,desc",
      });

      if (!response.data.errorCode && response.data.data) {
        setAllUsers(response.data.data.content);
        setCurrentPage(1);
      } else {
        toast.error(response.data.errorMessage || "Lỗi tải dữ liệu");
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể kết nối đến server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // --- 2. LOGIC XỬ LÝ SEARCH & FILTER & PAGINATION (Client Side) ---

  // Bước A: Lọc dữ liệu từ allUsers
  const filteredUsers = allUsers.filter((user) => {
    // Logic tìm kiếm (Tên hoặc Email)
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Logic lọc trạng thái
    const matchesStatus =
      selectedStatus === "all" || user.accountStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Bước B: Tính toán số trang
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  // Bước C: Cắt dữ liệu cho trang hiện tại (Slice)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- HANDLERS ---

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1); // Reset về trang 1 khi lọc
  };

  // --- LOGIC CẬP NHẬT TRẠNG THÁI ---
  const handleOpenUpdateStatus = (user: UserSummaryResponse) => {
    setSelectedUser(user);
    setIsUpdateDialogOpen(true);
  };

  const handleRequestUpdateStatus = async (
    userId: number,
    newStatus: AccountStatusType
  ) => {
    if (newStatus === "SUSPENDED") {
      toast.info("Chức năng Tạm khóa đang phát triển!");
      return;
    }
    if (newStatus === "ACTIVE") {
      toast.info("Chức năng Kích hoạt lại chưa có API!");
      return;
    }

    // Nếu chọn DEACTIVATED -> Mở ConfirmDialog
    if (newStatus === "DEACTIVATED") {
      setIsUpdateDialogOpen(false); // Đóng dialog chọn
      setPendingDeleteId(userId); // Lưu ID
      setIsConfirmOpen(true); // Mở dialog xác nhận
    }
  };

  // --- LOGIC XÓA THẬT (Khi bấm nút Vô hiệu hóa ngay) ---
  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      setIsDeleting(true);
      const response = await deleteUser(pendingDeleteId);

      // Chấp nhận các mã thành công: 200, 0, hoặc null
      const isSuccess =
        response.data.errorCode === 200 ||
        response.data.errorCode === 0 ||
        response.data.errorCode === null;

      if (isSuccess) {
        toast.success("Đã vô hiệu hóa tài khoản!");
        setIsConfirmOpen(false); // Đóng dialog
        fetchAllUsers(); // Load lại dữ liệu mới từ server
      } else {
        toast.error(response.data.errorMessage || "Lỗi xóa tài khoản");
      }
    } catch (error) {
      toast.error("Lỗi kết nối khi xóa: " + error);
    } finally {
      setIsDeleting(false);
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <PageHeader
        title="Quản lý tài khoản"
        description="Quản lý người dùng và trạng thái tài khoản"
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
            {/* QUAN TRỌNG: Truyền paginatedUsers (đã cắt) vào bảng */}
            <AccountManagementTable
              users={paginatedUsers}
              onViewDetails={(id) => console.log(id)}
              onEditStatus={handleOpenUpdateStatus}
            />

            {/* Pagination UI */}
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

        {!isLoading && filteredUsers.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            Không tìm thấy kết quả nào.
          </div>
        )}
      </div>

      {/* Dialog Chọn trạng thái */}
      <UpdateStatusDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        user={selectedUser}
        onConfirm={handleRequestUpdateStatus}
      />

      {/* Dialog Xác nhận (Sử dụng ConfirmDialog của bạn) */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Xác nhận vô hiệu hóa?"
        description="Hành động này sẽ vô hiệu hóa tài khoản người dùng này và không thể hoàn tác thông qua giao diện quản trị hiện tại. Bạn có chắc chắn muốn tiếp tục?"
        onConfirm={handleConfirmDelete}
        confirmLabel="Vô hiệu hóa ngay" // Đổi tên prop cho khớp component của bạn
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
