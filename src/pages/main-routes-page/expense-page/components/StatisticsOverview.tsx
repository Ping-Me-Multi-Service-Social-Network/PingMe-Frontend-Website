import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  getStatisticsByCategory,
  compareMonths,
  getDailyStatistics,
  getTopCategories,
} from "@/services/transaction";
import type {
  StatisticsByCategoryResponse,
  ComparisonResponse,
  DailyStatisticsResponse,
  TopCategoryResponse,
  CategoryType,
} from "@/types/transaction";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

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

export default function StatisticsOverview() {
  const [categoryStats, setCategoryStats] =
    useState<StatisticsByCategoryResponse | null>(null);
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStatisticsResponse[]>([]);
  const [topCategories, setTopCategories] = useState<TopCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    loadStatistics(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const loadStatistics = async (month: number, year: number) => {
    setLoading(true);
    try {
      const [catRes, compRes, dailyRes, topRes] = await Promise.all([
        getStatisticsByCategory(month, year),
        compareMonths(month, year),
        getDailyStatistics(month, year),
        getTopCategories(month, year),
      ]);

      if (catRes.data.data) setCategoryStats(catRes.data.data);
      if (compRes.data.data) setComparison(compRes.data.data);
      if (dailyRes.data.data) setDailyStats(dailyRes.data.data);
      if (topRes.data.data) setTopCategories(topRes.data.data);
    } catch (error) {
      toast.error("Lỗi khi tải thống kê");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const categoryData = categoryStats
    ? Object.entries(categoryStats.totalByCategory).map(
        ([category, amount]) => ({
          name: CATEGORY_LABELS[category as CategoryType] || category,
          value: amount,
        })
      )
    : [];

  const comparisonData = comparison
    ? [
        {
          name: "Tháng Trước",
          expense: comparison.previousMonth,
          income: comparison.incomePreviousMonth,
        },
        {
          name: "Tháng Này",
          expense: comparison.currentMonth,
          income: comparison.incomeCurrentMonth,
        },
      ]
    : [];

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lọc Thống Kê</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(Number.parseInt(e.target.value))
              }
              disabled={loading}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              {monthNames.map((name, idx) => (
                <option key={idx} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
              disabled={loading}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    Năm {year}
                  </option>
                );
              })}
            </select>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-8 text-muted-foreground">
          Đang tải thống kê...
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {comparison && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>So Sánh Tháng</CardTitle>
                <CardDescription>
                  Chi tiêu tháng này vs tháng trước
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <p className="text-xs text-muted-foreground font-medium mb-2">
                      Thu Nhập Tháng Này
                    </p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(comparison.incomeCurrentMonth)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <p className="text-xs text-muted-foreground font-medium mb-2">
                      Thu Nhập Tháng Trước
                    </p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(comparison.incomePreviousMonth)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 p-4 rounded-lg border border-red-200 dark:border-red-700">
                    <p className="text-xs text-muted-foreground font-medium mb-2">
                      Chi Tiêu Tháng Này
                    </p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(comparison.currentMonth)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 p-4 rounded-lg border border-red-200 dark:border-red-700">
                    <p className="text-xs text-muted-foreground font-medium mb-2">
                      Chi Tiêu Tháng Trước
                    </p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(comparison.previousMonth)}
                    </p>
                  </div>

                  <div
                    className={`bg-gradient-to-br p-4 rounded-lg border ${
                      comparison.trend === "UP"
                        ? "from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 border-red-200 dark:border-red-700"
                        : comparison.trend === "DOWN"
                        ? "from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700"
                        : "from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <p className="text-xs text-muted-foreground font-medium mb-2">
                      Thay Đổi Chi Tiêu
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        comparison.trend === "UP"
                          ? "text-red-600 dark:text-red-400"
                          : comparison.trend === "DOWN"
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {comparison.trend === "UP"
                        ? "↑"
                        : comparison.trend === "DOWN"
                        ? "↓"
                        : "→"}{" "}
                      {comparison.percent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {comparisonData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Biểu Đồ So Sánh</CardTitle>
                <CardDescription>
                  Thu nhập và chi tiêu so sánh tháng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Bar dataKey="income" fill="#10b981" name="Thu Nhập" />
                    <Bar dataKey="expense" fill="#ef4444" name="Chi Tiêu" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Phân Bố Theo Danh Mục</CardTitle>
              <CardDescription>Chi tiêu theo từng danh mục</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) =>
                        `${name}: ${(value / 1000000).toFixed(1)}M`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <p className="text-base">Chưa có dữ liệu</p>
                </div>
              )}
            </CardContent>
          </Card>

          {dailyStats.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Thống Kê Theo Ngày</CardTitle>
                <CardDescription>
                  Chi tiêu hàng ngày trong tháng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {topCategories.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Danh Mục</CardTitle>
                <CardDescription>Danh mục chi tiêu nhiều nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topCategories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="category"
                      tickFormatter={(cat) =>
                        CATEGORY_LABELS[cat as CategoryType] || cat
                      }
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Bar dataKey="total" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
