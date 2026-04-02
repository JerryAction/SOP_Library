import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Clock, FileText, MoreHorizontal, Edit, Link as LinkIcon, History } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sopManager } from "@/api/base44Client";

const statusMap = {
  draft: { label: "草稿", className: "bg-amber-100 text-amber-700 border-amber-200" },
  published: { label: "已发布", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  archived: { label: "已归档", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function SOPCard({ sop, categoryName }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const status = statusMap[sop.status] || statusMap.draft;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(sop.status || "draft");

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await sopManager.entities.SOPDocument.update(id, { status });
    },
    onSuccess: () => {
      // 失效相关缓存
      queryClient.invalidateQueries({ queryKey: ["documents-all"] });
      toast({ title: "文档状态已更新" });
    },
    onError: (error) => {
      console.error("更新状态失败:", error);
      toast({ title: "更新状态失败", variant: "destructive" });
      // 恢复原状态
      setCurrentStatus(sop.status || "draft");
    },
  });

  const handleStatusChange = (newStatus) => {
    setCurrentStatus(newStatus);
    updateStatusMutation.mutate({ id: sop.id, status: newStatus });
  };

  const copyLink = () => {
    const url = `${window.location.origin}/documents/${sop.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "链接已复制到剪贴板" });
    setIsMenuOpen(false);
  };

  return (
    <Card className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden">
      <div className="relative">
        <Link to={`/documents/${sop.id}`} className="block">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="w-24 relative z-10">
                  <Select value={currentStatus} onValueChange={handleStatusChange} onMouseDown={(e) => e.stopPropagation()}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">草稿</SelectItem>
                      <SelectItem value="published">已发布</SelectItem>
                      <SelectItem value="archived">已归档</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            <div className="flex items-center gap-2">
              {categoryName && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  {categoryName}
                </span>
              )}
              <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48">
                  <div className="space-y-1">
                    <Link to={`/documents/${sop.id}/versions`} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md">
                      <History className="w-4 h-4" />
                      查看历史版本
                    </Link>
                    <Link to={`/documents/${sop.id}/edit`} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md">
                      <Edit className="w-4 h-4" />
                      快速编辑
                    </Link>
                    <button onClick={copyLink} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted rounded-md">
                      <LinkIcon className="w-4 h-4" />
                      复制链接
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">
            {sop.title}
          </h3>

          {sop.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {sop.summary}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {sop.view_count || 0} 次查看
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {sop.updated_date ? format(new Date(sop.updated_date), "yyyy-MM-dd") : "未知"}
            </span>
            <span className="text-xs">v{sop.version || 1}</span>
          </div>

          {sop.tags && sop.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {sop.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-primary/5 text-primary/80"
                >
                  {tag}
                </span>
              ))}
              {sop.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">+{sop.tags.length - 3}</span>
              )}
            </div>
          )}
        </CardContent>
        </Link>
      </div>
    </Card>
  );
}