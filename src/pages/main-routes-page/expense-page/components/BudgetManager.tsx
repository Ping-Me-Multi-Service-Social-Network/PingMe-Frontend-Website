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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  setBudgetTarget,
  deleteBudgetTarget,
  getMonthlyStatistics,
} from "@/services/transaction";
import type { MonthlyStatisticsResponse } from "@/types/transaction";

export default function BudgetManager() {
  const [monthlyStats, setMonthlyStats] =
    useState<MonthlyStatisticsResponse | null>(null);
  const [targetAmount, setTargetAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    loadMonthlyStats();
  }, []);

  const loadMonthlyStats = async () => {
    setLoading(true);
    try {
      const response = await getMonthlyStatistics(currentMonth, currentYear);
      if (response.data.data) {
        setMonthlyStats(response.data.data);
        setTargetAmount(response.data.data.targetAmount || 0);
      }
    } catch (error) {
      toast.error("Lỗi khi tải thống kê tháng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetBudget = async () => {
    if (!targetAmount || targetAmount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    try {
      await setBudgetTarget({
        month: currentMonth,
        year: currentYear,
        targetAmount,
      });
      toast.success("Cập nhật ngân sách thành công");
      setIsEditing(false);
      loadMonthlyStats();
    } catch (error) {
      toast.error("Lỗi khi cập nhật ngân sách");
      console.error(error);
    }
  };

  const handleDeleteBudget = async () => {
    try {
      await deleteBudgetTarget(currentMonth, currentYear);
      toast.success("Xóa ngân sách thành công");
      loadMonthlyStats();
      setTargetAmount(0);
    } catch (error) {
      toast.error("Lỗi khi xóa ngân sách");
      console.error(error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "ON_TRACK":
        return "text-green-600";
      case "WARNING":
        return "text-yellow-600";
      case "OVER_LIMIT":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "ON_TRACK":
        return "Đang Theo Kế Hoạch";
      case "WARNING":
        return "Cảnh Báo";
      case "OVER_LIMIT":
        return "Vượt Quá Giới Hạn";
      default:
        return "Chưa Đặt Ngân Sách";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Current Budget Card */}
      <Card className="border-purple-200 dark:border-purple-800 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader className="border-b border-purple-100 dark:border-purple-900">
          <CardTitle className="text-purple-700 dark:text-purple-400">
            Ngân Sách Hiện Tại
          </CardTitle>
          <CardDescription>
            Tháng {currentMonth}/{currentYear}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {monthlyStats ? (
            <>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Mục Tiêu</Label>
                  <span className="text-2xl font-bold">
                    {monthlyStats.targetAmount
                      ? formatCurrency(monthlyStats.targetAmount)
                      : "Chưa Đặt"}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Đã Chi Tiêu</Label>
                  <span className="text-2xl font-bold text-red-600">
                    {formatCurrency(monthlyStats.spent)}
                  </span>
                </div>
              </div>

              {monthlyStats.targetAmount && (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Tiến Độ</Label>
                      <span className="text-lg font-semibold">
                        {monthlyStats.percent
                          ? monthlyStats.percent.toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={Math.min(monthlyStats.percent || 0, 100)}
                      className="h-3"
                    />
                  </div>

                  <div>
                    <Label>Trạng Thái</Label>
                    <p
                      className={`text-lg font-semibold ${getStatusColor(
                        monthlyStats.status
                      )}`}
                    >
                      {getStatusLabel(monthlyStats.status)}
                    </p>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">Không có dữ liệu</p>
          )}
        </CardContent>
      </Card>

      {/* Edit Budget Card */}
      <Card className="border-pink-200 dark:border-pink-800 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader className="border-b border-pink-100 dark:border-pink-900">
          <CardTitle className="text-pink-700 dark:text-pink-400">
            Chỉnh Sửa Ngân Sách
          </CardTitle>
          <CardDescription>Đặt mục tiêu chi tiêu hàng tháng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="target">Mục Tiêu Chi Tiêu (VND)</Label>
                <Input
                  id="target"
                  type="number"
                  value={targetAmount || ""}
                  onChange={(e) =>
                    setTargetAmount(Number.parseFloat(e.target.value) || 0)
                  }
                  placeholder="Nhập số tiền"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSetBudget}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  Lưu
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setTargetAmount(monthlyStats?.targetAmount || 0);
                  }}
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-sm">
                Mục tiêu hiện tại:{" "}
                {monthlyStats?.targetAmount
                  ? formatCurrency(monthlyStats.targetAmount)
                  : "Chưa Đặt"}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  Chỉnh Sửa
                </Button>
                {monthlyStats?.targetAmount && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteBudget}
                    className="flex-1"
                  >
                    Xóa
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
