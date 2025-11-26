import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  createTransaction,
  getTransactionsByMonth,
  getTransactionDetail,
  updateTransaction,
  deleteTransaction,
} from "@/services/transaction";
import type {
  CreateTransactionRequest,
  TransactionResponse,
  CategoryType,
  TransactionType,
} from "@/types/transaction";
import { CATEGORY_OPTIONS } from "@/types/transaction";

const CATEGORY_LABELS: Record<CategoryType, string> = {
  FOOD_AND_BEVERAGE: "Ăn Uống",
  COFFEE: "Cà Phê",
  TRANSPORTATION: "Vận Chuyển",
  GAS: "Xăng Dầu",
  SHOPPING: "Mua Sắm",
  HOUSEHOLD: "Gia Dụng",
  ELECTRICITY: "Điện",
  WATER: "Nước",
  INTERNET: "Internet",
  PHONE: "Điện Thoại",
  ENTERTAINMENT: "Giải Trí",
  HEALTHCARE: "Y Tế",
  PETS: "Thú Cưng",
  GIFTS: "Quà Tặng",
  EDUCATION: "Giáo Dục",
  TRAVEL: "Du Lịch",
  OTHER: "Khác",
};

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionResponse | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [filterDay, setFilterDay] = useState<string>("");
  const [filterMonth, setFilterMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [filterYear, setFilterYear] = useState<number>(
    new Date().getFullYear()
  );
  const PAGE_SIZE = 6;

  const [formData, setFormData] = useState<CreateTransactionRequest>({
    amount: 0,
    type: "EXPENSE",
    category: "FOOD_AND_BEVERAGE",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadTransactions();
  }, [filterMonth, filterYear, filterDay]);

  const loadTransactions = async () => {
    setLoading(true);
    setCurrentPage(0);
    try {
      const response = await getTransactionsByMonth(filterMonth, filterYear);
      if (response.data.data) {
        let filtered = response.data.data;

        if (filterDay) {
          filtered = filtered.filter((t) => t.date === filterDay);
        }

        setTransactions(filtered);
      }
    } catch (error) {
      toast.error("Lỗi khi tải giao dịch");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const paginatedTransactions = transactions.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );
  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);
  const isLastPage = currentPage >= totalPages - 1;

  const handleAddTransaction = async () => {
    if (!formData.note || formData.amount <= 0) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      await createTransaction(formData);
      toast.success("Thêm giao dịch thành công");
      setOpenAdd(false);
      setFormData({
        amount: 0,
        type: "EXPENSE",
        category: "FOOD_AND_BEVERAGE",
        note: "",
        date: new Date().toISOString().split("T")[0],
      });
      loadTransactions();
    } catch (error) {
      toast.error("Lỗi khi thêm giao dịch");
      console.error(error);
    }
  };

  const handleViewDetail = async (transaction: TransactionResponse) => {
    try {
      const response = await getTransactionDetail(transaction.id);
      if (response.data.data) {
        setSelectedTransaction(response.data.data);
        setOpenDetail(true);
      }
    } catch (error) {
      toast.error("Lỗi khi tải chi tiết giao dịch");
      console.error(error);
    }
  };

  const handleEditClick = async (transaction: TransactionResponse) => {
    try {
      const response = await getTransactionDetail(transaction.id);
      if (response.data.data) {
        setSelectedTransaction(response.data.data);
        setFormData({
          amount: response.data.data.amount,
          type: response.data.data.type,
          category: response.data.data.category,
          note: response.data.data.note,
          date: response.data.data.date,
        });
        setOpenEdit(true);
      }
    } catch (error) {
      toast.error("Lỗi khi tải chi tiết giao dịch");
      console.error(error);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedTransaction || !formData.note || formData.amount <= 0) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      await updateTransaction(selectedTransaction.id, formData);
      toast.success("Cập nhật giao dịch thành công");
      setOpenEdit(false);
      setSelectedTransaction(null);
      loadTransactions();
    } catch (error) {
      toast.error("Lỗi khi cập nhật giao dịch");
      console.error(error);
    }
  };

  const handleDeleteClick = (transaction: TransactionResponse) => {
    setSelectedTransaction(transaction);
    setOpenDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTransaction) return;

    try {
      await deleteTransaction(selectedTransaction.id);
      toast.success("Xoá giao dịch thành công");
      setOpenDelete(false);
      setSelectedTransaction(null);
      loadTransactions();
    } catch (error) {
      toast.error("Lỗi khi xoá giao dịch");
      console.error(error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const years = Array.from({ length: 10 }, (_, i) => filterYear - 5 + i);

  return (
    <>
      <Card className="border-emerald-200 dark:border-emerald-800 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-emerald-700 dark:text-emerald-400">
                  Danh Sách Giao Dịch
                </CardTitle>
                <CardDescription>
                  Tháng {filterMonth}/{filterYear}
                </CardDescription>
              </div>
              <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm Giao Dịch
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm Giao Dịch Mới</DialogTitle>
                    <DialogDescription>
                      Nhập thông tin giao dịch của bạn
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="date">Ngày</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="type">Loại</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            type: value as TransactionType,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EXPENSE">Chi Tiêu</SelectItem>
                          <SelectItem value="INCOME">Thu Nhập</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="category">Danh Mục</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            category: value as CategoryType,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {CATEGORY_LABELS[cat]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="amount">Số Tiền</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            amount: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="note">Ghi Chú</Label>
                      <Textarea
                        id="note"
                        value={formData.note}
                        onChange={(e) =>
                          setFormData({ ...formData, note: e.target.value })
                        }
                        placeholder="Thêm ghi chú (tuỳ chọn)"
                      />
                    </div>

                    <Button
                      onClick={handleAddTransaction}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      Lưu Giao Dịch
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Bộ Lọc</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilterDay("");
                      setFilterMonth(new Date().getMonth() + 1);
                      setFilterYear(new Date().getFullYear());
                      setCurrentPage(0);
                    }}
                    className="text-xs h-8"
                  >
                    Đặt Lại
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="filter-day" className="text-xs font-medium">
                      Ngày
                    </Label>
                    <Input
                      id="filter-day"
                      type="date"
                      value={filterDay}
                      onChange={(e) => {
                        setFilterDay(e.target.value);
                        setCurrentPage(0);
                      }}
                      className="text-sm h-9"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="filter-month"
                      className="text-xs font-medium"
                    >
                      Tháng
                    </Label>
                    <Select
                      value={filterMonth.toString()}
                      onValueChange={(v) => {
                        setFilterMonth(Number.parseInt(v));
                        setCurrentPage(0);
                      }}
                    >
                      <SelectTrigger id="filter-month" className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (m) => (
                            <SelectItem key={m} value={m.toString()}>
                              {m}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="filter-year"
                      className="text-xs font-medium"
                    >
                      Năm
                    </Label>
                    <Select
                      value={filterYear.toString()}
                      onValueChange={(v) => {
                        setFilterYear(Number.parseInt(v));
                        setCurrentPage(0);
                      }}
                    >
                      <SelectTrigger id="filter-year" className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Đang tải...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không có giao dịch nào
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead className="text-right">Số Tiền</TableHead>
                    <TableHead className="text-right">Hành Động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        {transaction.type === "INCOME"
                          ? "Thu Nhập"
                          : "Chi Tiêu"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(transaction)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(transaction)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trang Trước
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const startPage = Math.max(0, currentPage - 2);
                    return startPage + i;
                  }).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={isLastPage}
                >
                  Trang Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {isLastPage && currentPage > 0 && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  Đã đến trang cuối cùng
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi Tiết Giao Dịch</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày:</span>
                <span className="font-semibold">
                  {selectedTransaction.date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Danh Mục:</span>
                <span className="font-semibold">
                  {CATEGORY_LABELS[selectedTransaction.category]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loại:</span>
                <span className="font-semibold">
                  {selectedTransaction.type === "INCOME"
                    ? "Thu Nhập"
                    : "Chi Tiêu"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số Tiền:</span>
                <span className="font-semibold">
                  {selectedTransaction.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(selectedTransaction.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ghi Chú:</span>
                <span className="font-semibold">
                  {selectedTransaction.note}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Giao Dịch</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin giao dịch của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-date">Ngày</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-type">Loại</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    type: value as TransactionType,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Chi Tiêu</SelectItem>
                  <SelectItem value="INCOME">Thu Nhập</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-category">Danh Mục</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as CategoryType,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-amount">Số Tiền</Label>
              <Input
                id="edit-amount"
                type="number"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: Number.parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-note">Ghi Chú</Label>
              <Textarea
                id="edit-note"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Thêm ghi chú (tuỳ chọn)"
              />
            </div>

            <Button onClick={handleSaveEdit} className="w-full">
              Lưu Thay Đổi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác Nhận Xoá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá giao dịch này không? Hành động này không
              thể được hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 p-4 bg-muted rounded-lg">
            {selectedTransaction && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Danh Mục:</span>
                  <span className="font-semibold">
                    {CATEGORY_LABELS[selectedTransaction.category]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số Tiền:</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedTransaction.amount)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <AlertDialogCancel>Huỷ Bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xoá
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
