export type CategoryType =
  | "FOOD_AND_BEVERAGE"
  | "COFFEE"
  | "TRANSPORTATION"
  | "GAS"
  | "SHOPPING"
  | "HOUSEHOLD"
  | "ELECTRICITY"
  | "WATER"
  | "INTERNET"
  | "PHONE"
  | "ENTERTAINMENT"
  | "HEALTHCARE"
  | "PETS"
  | "GIFTS"
  | "EDUCATION"
  | "TRAVEL"
  | "OTHER";

export type TransactionType = "INCOME" | "EXPENSE";

export type BudgetStatus = "ON_TRACK" | "WARNING" | "OVER_LIMIT";

export const CATEGORY_OPTIONS = [
  "FOOD_AND_BEVERAGE",
  "COFFEE",
  "TRANSPORTATION",
  "GAS",
  "SHOPPING",
  "HOUSEHOLD",
  "ELECTRICITY",
  "WATER",
  "INTERNET",
  "PHONE",
  "ENTERTAINMENT",
  "HEALTHCARE",
  "PETS",
  "GIFTS",
  "EDUCATION",
  "TRAVEL",
  "OTHER",
] as const satisfies readonly CategoryType[];

export const TRANSACTION_TYPE_OPTIONS = [
  "INCOME",
  "EXPENSE",
] as const satisfies readonly TransactionType[];

export const BUDGET_STATUS_OPTIONS = [
  "ON_TRACK",
  "WARNING",
  "OVER_LIMIT",
] as const satisfies readonly BudgetStatus[];

export interface CreateTransactionRequest {
  amount: number;
  type: TransactionType;
  category: CategoryType;
  note: string;
  date: string;
}

export interface SetBudgetTargetRequest {
  month: number;
  year: number;
  targetAmount: number;
}

export interface ChatAIRequest {
  prompt: string;
}

export interface TransactionResponse {
  id: number;
  amount: number;
  note: string;
  date: string;
  type: TransactionType;
  category: CategoryType;
}

export interface MonthlyStatisticsResponse {
  month: number;
  year: number;
  targetAmount: number | null;
  spent: number;
  percent: number | null;
  status: BudgetStatus | null;
}

export interface StatisticsByCategoryResponse {
  totalByCategory: Record<string, number>;
}

export interface ComparisonResponse {
  currentMonth: number;
  previousMonth: number;
  diff: number;
  percent: number;
  trend: "UP" | "DOWN" | "STABLE";
  incomeCurrentMonth: number;
  incomePreviousMonth: number;
}

export interface DailyStatisticsResponse {
  day: number;
  total: number;
}

export interface TopCategoryResponse {
  category: CategoryType;
  total: number;
}

export interface YearlyStatisticsResponse {
  year: number;
  items: MonthlyYearlyItem[];
  totalIncome: number;
  totalExpense: number;
  totalNet: number;
}

export interface MonthlyYearlyItem {
  month: number;
  income: number;
  expense: number;
  net: number;
}

export interface RangeStatisticsResponse {
  from: string;
  to: string;
  income: number;
  expense: number;
  net: number;
  totalByCategory: Record<string, number>;
}

export interface AIResponseData {
  answer: string;
}

export interface AIChatHistoryResponse {
  id: number;
  role: "USER" | "AI";
  content: string;
  createdAt: string;
}

export interface AIHistoryPageResponse {
  content: AIChatHistoryResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasMore: boolean;
}
