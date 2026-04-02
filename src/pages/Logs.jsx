import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, RefreshCw, Download, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

// 模拟日志数据
const mockLogs = [
  {
    id: "1",
    user_id: "1",
    user_name: "管理员",
    action: "create",
    resource_type: "sopdocument",
    resource_id: "1",
    resource_name: "车间安全操作规范",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    user_id: "1",
    user_name: "管理员",
    action: "update",
    resource_type: "sopdocument",
    resource_id: "1",
    resource_name: "车间安全操作规范",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "3",
    user_id: "1",
    user_name: "管理员",
    action: "delete",
    resource_type: "sopdocument",
    resource_id: "2",
    resource_name: "产品质量检验流程",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "4",
    user_id: "1",
    user_name: "管理员",
    action: "create",
    resource_type: "sopcategory",
    resource_id: "3",
    resource_name: "设备维护",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    created_at: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: "5",
    user_id: "1",
    user_name: "管理员",
    action: "login",
    resource_type: "user",
    resource_id: "1",
    resource_name: "管理员",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    created_at: new Date(Date.now() - 14400000).toISOString()
  }
];

export default function Logs() {
  const [filters, setFilters] = useState({
    user: "all",
    action: "all",
    resourceType: "all",
    dateRange: {
      start: null,
      end: null
    }
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10
  });

  const { data: logs = mockLogs, isLoading } = useQuery({
    queryKey: ["logs", filters, searchTerm, pagination],
    queryFn: async () => {
      // 模拟 API 调用
      try {
        // 这里可以添加实际的 API 调用逻辑
        return mockLogs;
      } catch (error) {
        console.warn("API 调用失败，使用模拟数据:", error);
        return mockLogs;
      }
    },
  });

  // 计算分页数据
  const totalItems = logs.length;
  const totalPages = Math.ceil(totalItems / pagination.pageSize);
  const startIndex = (pagination.page - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedLogs = logs.slice(startIndex, endIndex);

  // 处理筛选
  const applyFilters = () => {
    // 这里可以添加实际的筛选逻辑
    console.log("应用筛选:", filters);
  };

  // 处理导出
  const handleExportCSV = () => {
    const headers = ["ID", "用户", "操作", "资源类型", "资源名称", "IP地址", "用户代理", "创建时间"];
    const rows = logs.map(log => [
      log.id,
      log.user_name,
      log.action === "create" ? "创建" : log.action === "update" ? "更新" : log.action === "delete" ? "删除" : log.action === "login" ? "登录" : log.action,
      log.resource_type === "sopdocument" ? "SOP文档" : log.resource_type === "sopcategory" ? "SOP分类" : log.resource_type === "user" ? "用户" : log.resource_type,
      log.resource_name,
      log.ip_address,
      log.user_agent,
      log.created_at
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">日志管理</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => console.log("刷新日志")}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExportCSV} title="导出为CSV">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 筛选栏 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">筛选条件</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>用户</Label>
              <Select value={filters.user} onValueChange={(v) => setFilters({ ...filters, user: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择用户" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有用户</SelectItem>
                  <SelectItem value="1">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>操作类型</Label>
              <Select value={filters.action} onValueChange={(v) => setFilters({ ...filters, action: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择操作类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有操作</SelectItem>
                  <SelectItem value="create">创建</SelectItem>
                  <SelectItem value="update">更新</SelectItem>
                  <SelectItem value="delete">删除</SelectItem>
                  <SelectItem value="login">登录</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>资源类型</Label>
              <Select value={filters.resourceType} onValueChange={(v) => setFilters({ ...filters, resourceType: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择资源类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有资源</SelectItem>
                  <SelectItem value="sopdocument">SOP文档</SelectItem>
                  <SelectItem value="sopcategory">SOP分类</SelectItem>
                  <SelectItem value="user">用户</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>搜索</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索资源名称..."
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setFilters({ user: "all", action: "all", resourceType: "all", dateRange: { start: null, end: null } })}>重置</Button>
            <Button onClick={applyFilters} className="gap-2">
              <Filter className="w-4 h-4" /> 应用筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 日志表格 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">暂无日志记录</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      操作时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      用户
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      操作
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      资源类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      资源名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      IP地址
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      用户代理
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.user_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.action === "create" ? "创建" : log.action === "update" ? "更新" : log.action === "delete" ? "删除" : log.action === "login" ? "登录" : log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.resource_type === "sopdocument" ? "SOP文档" : log.resource_type === "sopcategory" ? "SOP分类" : log.resource_type === "user" ? "用户" : log.resource_type}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {log.resource_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="truncate max-w-xs">{log.user_agent}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
              disabled={pagination.page === 1}
            >
              上一页
            </Button>
            <span className="text-sm">
              第 {pagination.page} 页，共 {totalPages} 页
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPagination({ ...pagination, page: Math.min(totalPages, pagination.page + 1) })}
              disabled={pagination.page === totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
