import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { AccountSearchFilters } from "./components/AccountSearchFilters";
import { AccountManagementTable } from "./components/AccountManagementTable";
import type {
  AccountStatusType,
  UserSummaryResponse,
} from "@/types/common/userSummary";
import { toast } from "sonner";
import { getAllUsers, deleteUser } from "@/services/admin/userManagementApi.ts";
import { Button } from "@/components/ui/button";
import { UpdateStatusDialog } from "./components/UpdateStatusDialog";
import { ConfirmDialog } from "@/components/custom/ConfirmDialog";

// Cấu hình số lượng hiển thị mỗi trang
const ITEMS_PER_PAGE = 7;

export default function AccountManagementPage() {
  // Thay đổi: Chỉ lưu users của trang hiện tại
  const [users, setUsers] = useState<UserSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State quản lý Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // State quản lý Pagination từ Server
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0); // (Optional) Để hiển thị tổng số bản ghi

  // --- STATE DIALOG ---
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSummaryResponse | null>(
    null
  );

  // State cho Confirm Dialog
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- 1. HÀM FETCH DỮ LIỆU TỪ SERVER (Server Side Pagination) ---
  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      // Gọi API với đầy đủ tham số phân trang & lọc
      const response = await getAllUsers({
        page: currentPage, // Server thường tính từ 0, UI tính từ 1
        size: ITEMS_PER_PAGE,
        filter: "name,desc", // Hoặc "id,desc" tùy nhu cầu sort
      });

      if (!response.data.errorCode && response.data.data) {
        const pageData = response.data.data;
        setUsers(pageData.content); // Chỉ set users của trang hiện tại
        setTotalPages(pageData.totalPages); // Cập nhật tổng số trang từ server
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

  // --- 2. EFFECT: Tự động gọi lại API khi Page, Search hoặc Status thay đổi ---
  useEffect(() => {
    // Kỹ thuật Debounce đơn giản cho Search để tránh spam API khi gõ phím liên tục
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300); // Đợi 300ms sau khi ngừng gõ mới gọi API

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, selectedStatus]);
  // Lưu ý: Thêm searchQuery và selectedStatus vào dependency array

  // --- HANDLERS ---

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi từ khóa tìm kiếm
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  };

  // --- LOGIC CẬP NHẬT TRẠNG THÁI (Giữ nguyên) ---
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
      setIsUpdateDialogOpen(false);
      setPendingDeleteId(userId);
      setIsConfirmOpen(true);
    }
  };

  // --- LOGIC XÓA THẬT ---
  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      setIsDeleting(true);
      const response = await deleteUser(pendingDeleteId);

      const isSuccess =
        response.data.errorCode === 200 ||
        response.data.errorCode === 0 ||
        response.data.errorCode === null;

      if (isSuccess) {
        toast.success("Đã vô hiệu hóa tài khoản!");
        setIsConfirmOpen(false);
        fetchUsers(); // Load lại dữ liệu trang hiện tại
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
            {/* Truyền trực tiếp users (đã được phân trang từ server) */}
            <AccountManagementTable
              users={users}
              onViewDetails={(id) => console.log(id)}
              onEditStatus={handleOpenUpdateStatus}
            />

            {/* Pagination UI - Sử dụng totalPages từ Server */}
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
                  {/* Logic render số trang đơn giản */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      // Chỉ hiện trang đầu, trang cuối, và các trang xung quanh currentPage (Optional optimization)
                      // Ở đây giữ nguyên logic cũ của bạn để hiển thị tất cả nếu ít trang
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className={
                            currentPage === page ? "bg-purple-600" : ""
                          }
                        >
                          {page}
                        </Button>
                      );
                    }
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
