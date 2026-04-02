import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { sopManager } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  FileText,
  Search,
  FolderOpen,
  MessageSquare,
  BookOpen,
  Plus,
  Users,
  FileText as LogFile,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const mainNav = [
  { icon: LayoutDashboard, label: "仪表盘", path: "/dashboard" },
  { icon: Search, label: "搜索", path: "/search" },
  { icon: FileText, label: "所有文档", path: "/documents" },
  { icon: FolderOpen, label: "分类管理", path: "/categories" },
  { icon: Tag, label: "标签管理", path: "/tags" },
  { icon: MessageSquare, label: "反馈管理", path: "/feedback" },
  { icon: Users, label: "用户管理", path: "/users" },
  { icon: LogFile, label: "日志管理", path: "/logs" },
];

export default function Sidebar({ userRole }) {
  const location = useLocation();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-sidebar"],
    queryFn: () => sopManager.entities.SOPCategory.list("sort_order"),
  });

  const canCreate = userRole === "admin" || userRole === "contributor";

  return (
    <aside className="w-64 bg-white border-r border-border h-screen flex flex-col">
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg tracking-tight">SOP Library</span>
        </div>
      </div>

      <ScrollArea className="flex-1 py-4">
        {/* New SOP Button */}
        {canCreate && (
          <div className="px-4 mb-4">
            <Link to="/documents/new">
              <Button className="w-full justify-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                新建文档
              </Button>
            </Link>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="px-2 space-y-1">
          {mainNav.map((item) => {
            if (item.path === "/feedback" && userRole !== "admin") return null;
            if (item.path === "/categories" && userRole !== "admin") return null;
            if (item.path === "/users" && userRole !== "admin") return null;
            if (item.path === "/logs" && userRole !== "admin") return null;

            const isActive = location.pathname === item.path || 
              (item.path !== "/" && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Categories */}
        {categories.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="px-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                分类
              </p>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/documents?category=${cat.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span className="truncate">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </ScrollArea>
    </aside>
  );
}