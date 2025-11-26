"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionTable from "./components/TransactionTable";
import StatisticsOverview from "./components/StatisticsOverview";
import BudgetManager from "./components/BudgetManager";
import AIAssistant from "./components/AIAssistant";

export default function ExpensePage() {
  const [activeTab, setActiveTab] = useState("transactions");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Quản lý Chi Tiêu
          </h1>
          <p className="text-muted-foreground">
            Theo dõi, quản lý và phân tích chi tiêu của bạn
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="transactions">Giao Dịch</TabsTrigger>
            <TabsTrigger value="statistics">Thống Kê</TabsTrigger>
            <TabsTrigger value="ai">AI Trợ Lý</TabsTrigger>
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
