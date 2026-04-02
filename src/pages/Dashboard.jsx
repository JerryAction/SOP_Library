import React from "react";
import { useOutletContext, Link } from "react-router-dom";
import { sopManager } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, MessageSquare, FolderOpen, TrendingUp, ArrowRight, Plus } from "lucide-react";
import SearchBar from "@/components/sop/SearchBar";
import SOPCard from "@/components/sop/SOPCard";

function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <Card className="overflow-hidden border-none shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold">{value}</span>
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

// 模拟文档数据
const mockDocuments = [
  {
    id: "1",
    title: "车间安全操作规范",
    content: "# 1. 目的\n规范车间...",
    summary: "车间日常安全操作的...",
    category_id: "1",
    tags: ["安全", "车间", "操作规范"],
    status: "published",
    updated_date: new Date().toISOString(),
    view_count: 100
  },
  {
    id: "2",
    title: "产品质量检验流程",
    content: "# 1. 目的\n确保产品...",
    summary: "产品出厂前的质量检...",
    category_id: "2",
    tags: ["质量", "检验", "出厂"],
    status: "published",
    updated_date: new Date().toISOString(),
    view_count: 80
  }
];

// 模拟分类数据
const mockCategories = [
  { id: "1", name: "安全管理", sort_order: 1 },
  { id: "2", name: "生产操作", sort_order: 2 },
  { id: "3", name: "质量检查", sort_order: 3 },
  { id: "4", name: "人事培训", sort_order: 4 },
  { id: "5", name: "设备维护", sort_order: 5 }
];

export default function Dashboard() {
  const { userRole } = useOutletContext();

  const { data: allDocs = mockDocuments } = useQuery({
    queryKey: ["dashboard-docs"],
    queryFn: async () => {
      try {
        return await sopManager.entities.SOPDocument.list("-updated_date");
      } catch (error) {
        console.warn("API 调用失败，使用模拟数据:", error);
        return mockDocuments;
      }
    },
  });

  const { data: categories = mockCategories } = useQuery({
    queryKey: ["dashboard-categories"],
    queryFn: async () => {
      try {
        return await sopManager.entities.SOPCategory.list();
      } catch (error) {
        console.warn("API 调用失败，使用模拟数据:", error);
        return mockCategories;
      }
    },
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ["dashboard-feedbacks"],
    queryFn: async () => {
      try {
        const allFeedbacks = await sopManager.entities.SOPFeedback.list();
        return allFeedbacks.filter(f => f.status === "open").slice(0, 5);
      } catch (error) {
        console.warn("API 调用失败:", error);
        return [];
      }
    },
  });

  const published = allDocs.filter((d) => d.status === "published");
  const totalViews = allDocs.reduce((sum, d) => sum + (d.view_count || 0), 0);
  const recentDocs = published.slice(0, 6);
  const popularDocs = [...published].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5);

  const catMap = {};
  categories.forEach((c) => (catMap[c.id] = c.name));

  const canCreate = userRole === "admin" || userRole === "contributor";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SOP 知识库</h1>
      </div>

      {/* Hero */}
      <div className="text-center py-6">
        <h2 className="text-3xl font-bold mb-2">SOP 知识库</h2>
        <p className="text-muted-foreground mb-6">标准操作流程文档管理与搜索</p>
        <div className="max-w-2xl mx-auto">
          <SearchBar className="" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={FileText} 
          label="文档总数" 
          value={published.length} 
          color="text-blue-600" 
          bgColor="bg-blue-50" 
        />
        <StatCard 
          icon={Eye} 
          label="总浏览量" 
          value={totalViews} 
          color="text-green-600" 
          bgColor="bg-green-50" 
        />
        <StatCard 
          icon={FolderOpen} 
          label="分类数" 
          value={categories.length} 
          color="text-purple-600" 
          bgColor="bg-purple-50" 
        />
        <StatCard 
          icon={MessageSquare} 
          label="待处理反馈" 
          value={feedbacks.length} 
          color="text-yellow-600" 
          bgColor="bg-yellow-50" 
        />
      </div>

      {/* Recent Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">最近更新</h2>
          <Link to="/documents" className="text-sm text-primary hover:underline flex items-center gap-1">
            查看全部 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentDocs.map((sop) => (
            <SOPCard key={sop.id} sop={sop} categoryName={catMap[sop.category_id]} />
          ))}
          {recentDocs.length === 0 && (
            <p className="text-muted-foreground col-span-3 text-center py-12">暂无已发布的文档</p>
          )}
        </div>
      </div>

      {/* Popular */}
      {popularDocs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            热门文档
          </h2>
          <Card className="border-none shadow-sm">
            <CardContent className="p-0 divide-y divide-border">
              {popularDocs.map((doc, i) => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg font-bold text-muted-foreground/50 w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{catMap[doc.category_id] || "未分类"}</p>
                  </div>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {doc.view_count || 0}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}