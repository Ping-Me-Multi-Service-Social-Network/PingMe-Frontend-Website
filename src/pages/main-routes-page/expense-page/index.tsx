import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, TrendingUp, Bot } from "lucide-react";
import TransactionTable from "./components/TransactionTable";
import StatisticsOverview from "./components/StatisticsOverview";
import BudgetManager from "./components/BudgetManager";
import AIAssistant from "./components/AIAssistant";

export default function ExpensePage() {
  const [activeTab, setActiveTab] = useState("transactions");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 dark:from-purple-950 dark:via-pink-950 dark:to-fuchsia-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-1">
              Quản lý Chi Tiêu
            </h1>
            <p className="text-muted-foreground">
              Theo dõi, quản lý và phân tích chi tiêu của bạn
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-1 h-auto">
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3 gap-2"
            >
              <Wallet className="h-4 w-4" />
              Giao Dịch
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3 gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Thống Kê
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3 gap-2"
            >
              <Bot className="h-4 w-4" />
              AI Trợ Lý
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <BudgetManager />
            <TransactionTable />
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <StatisticsOverview />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AIAssistant />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
