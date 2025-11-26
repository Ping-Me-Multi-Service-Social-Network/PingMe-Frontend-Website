import axiosClient from "@/lib/axiosClient.ts";
import type { ApiResponse } from "@/types/common/apiResponse";
import type {
  CreateTransactionRequest,
  TransactionResponse,
  MonthlyStatisticsResponse,
  StatisticsByCategoryResponse,
  ComparisonResponse,
  DailyStatisticsResponse,
  TopCategoryResponse,
  YearlyStatisticsResponse,
  RangeStatisticsResponse,
  AIResponseData,
  AIHistoryPageResponse,
  SetBudgetTargetRequest,
  ChatAIRequest,
} from "@/types/transaction/index";

export const createTransaction = (data: CreateTransactionRequest) => {
  return axiosClient.post<ApiResponse<TransactionResponse>>(
    "/expense/transactions",
    data
  );
};

export const getTransactionsByMonth = (month: number, year: number) => {
  return axiosClient.get<ApiResponse<TransactionResponse[]>>(
    `/expense/transactions?month=${month}&year=${year}`
  );
};

export const getTransactionDetail = (id: number) => {
  return axiosClient.get<ApiResponse<TransactionResponse>>(
    `/expense/transactions/${id}`
  );
};

export const updateTransaction = (
  id: number,
  data: CreateTransactionRequest
) => {
  return axiosClient.put<ApiResponse<TransactionResponse>>(
    `/expense/transactions/${id}`,
    data
  );
};

export const deleteTransaction = (id: number) => {
  return axiosClient.delete<ApiResponse<void>>(`/expense/transactions/${id}`);
};

export const setBudgetTarget = (data: SetBudgetTargetRequest) => {
  return axiosClient.post<ApiResponse<void>>(
    "/expense/statistics/target",
    data
  );
};

export const deleteBudgetTarget = (month: number, year: number) => {
  return axiosClient.delete<ApiResponse<void>>(
    `/expense/statistics/target?month=${month}&year=${year}`
  );
};

export const getMonthlyStatistics = (month: number, year: number) => {
  return axiosClient.get<ApiResponse<MonthlyStatisticsResponse>>(
    `/expense/statistics/target?month=${month}&year=${year}`
  );
};

export const getStatisticsByCategory = (month: number, year: number) => {
  return axiosClient.get<ApiResponse<StatisticsByCategoryResponse>>(
    `/expense/statistics/by-category?month=${month}&year=${year}`
  );
};

export const compareMonths = (month: number, year: number) => {
  return axiosClient.get<ApiResponse<ComparisonResponse>>(
    `/expense/statistics/compare?month=${month}&year=${year}`
  );
};

export const getDailyStatisticsByRange = (from: string, to: string) => {
  return axiosClient.get<ApiResponse<DailyStatisticsResponse[]>>(
    `/expense/statistics/daily-range?from=${from}&to=${to}`
  );
};

export const getDailyStatistics = (month: number, year: number) => {
  return axiosClient.get<ApiResponse<DailyStatisticsResponse[]>>(
    `/expense/statistics/daily?month=${month}&year=${year}`
  );
};

export const getTopCategories = (month: number, year: number) => {
  return axiosClient.get<ApiResponse<TopCategoryResponse[]>>(
    `/expense/statistics/top-categories?month=${month}&year=${year}`
  );
};

export const getYearlyStatistics = (year: number) => {
  return axiosClient.get<ApiResponse<YearlyStatisticsResponse>>(
    `/expense/statistics/yearly?year=${year}`
  );
};

export const getRangeStatistics = (from: string, to: string) => {
  return axiosClient.get<ApiResponse<RangeStatisticsResponse>>(
    `/expense/statistics/range?from=${from}&to=${to}`
  );
};

export const chatWithAI = (data: ChatAIRequest) => {
  return axiosClient.post<ApiResponse<AIResponseData>>(
    "/expense/ai/chat",
    data
  );
};

export const getAIChatHistory = (page = 0, size = 20) => {
  return axiosClient.get<ApiResponse<AIHistoryPageResponse>>(
    `/expense/ai/history?page=${page}&size=${size}`
  );
};
