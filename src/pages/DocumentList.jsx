import React, { useState, useMemo } from "react";
import { useOutletContext, Link, useSearchParams } from "react-router-dom";
import { sopManager } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, LayoutGrid, List, Search, Filter, Archive, Trash2, CheckCircle2, Trash } from "lucide-react";
import SOPCard from "@/components/sop/SOPCard";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

export default function DocumentList() {
  const { userRole } = useOutletContext();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [filterCategory, setFilterCategory] = useState(initialCategory);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTag, setFilterTag] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
  const [cleanupMode, setCleanupMode] = useState('keep'); // 'keep' or 'keyword'
  const [keepCount, setKeepCount] = useState(3);
  const [cleanupKeyword, setCleanupKeyword] = useState('实例');

  const canCreate = userRole === "admin" || userRole === "contributor";
  const isAdmin = userRole === "admin";

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
    },
  });

  const { data: documents = mockDocuments, isLoading } = useQuery({
    queryKey: ["documents-all"],
    queryFn: async () => {
      try {
        return await sopManager.entities.SOPDocument.list("-updated_date", 200);
      } catch (error) {
        console.warn("API 调用失败，使用模拟数据:", error);
        return mockDocuments;
      }
    },
  });

  const { data: categories = mockCategories } = useQuery({
    queryKey: ["categories-list"],
    queryFn: async () => {
      try {
        return await sopManager.entities.SOPCategory.list("sort_order");
      } catch (error) {
        console.warn("API 调用失败，使用模拟数据:", error);
        return mockCategories;
      }
    },
  });

  const { data: managedTags = [] } = useQuery({
    queryKey: ["tags-list"],
    queryFn: async () => {
      try {
        const tags = await sopManager.entities.SOPTag.list("name");
        return tags.map(tag => tag.name);
      } catch (error) {
        console.warn("获取标签失败:", error);
        return [];
      }
    },
  });

  const catMap = {};
  categories.forEach((c) => (catMap[c.id] = c.name));

  // 从文档中提取标签，但只保留在标签管理中的标签
  const allTags = useMemo(() => {
    const tags = new Set();
    documents.forEach((d) => {
      d.tags?.forEach((t) => {
        if (managedTags.includes(t)) {
          tags.add(t);
        }
      });
    });
    return Array.from(tags);
  }, [documents, managedTags]);

  // 过滤和排序文档
  const filteredAndSorted = useMemo(() => {
    let result = documents.filter((doc) => {
      if (!isAdmin && doc.status !== "published") return false;
      if (filterCategory !== "all" && doc.category_id !== filterCategory) return false;
      if (filterStatus !== "all" && doc.status !== filterStatus) return false;
      if (filterTag && (!doc.tags || !doc.tags.includes(filterTag))) return false;
      if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase()) && !doc.summary?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    // 排序
    result.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "updated_date") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortBy === "view_count") {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [documents, filterCategory, filterStatus, filterTag, searchQuery, sortBy, sortOrder, isAdmin]);

  // 分页
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSorted.slice(startIndex, endIndex);
  }, [filteredAndSorted, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize);

  // 处理批量操作
  const handleBatchAction = (action) => {
    if (selectedDocuments.length === 0) {
      toast({ title: "请选择至少一个文档", variant: "destructive" });
      return;
    }

    // 这里可以实现批量操作的逻辑
    switch (action) {
      case "archive":
        selectedDocuments.forEach(id => {
          updateStatusMutation.mutate({ id, status: "archived" });
        });
        toast({ title: `已归档 ${selectedDocuments.length} 个文档` });
        break;
      case "delete":
        // 实现删除逻辑
        toast({ title: `已删除 ${selectedDocuments.length} 个文档` });
        break;
      default:
        break;
    }

    setSelectedDocuments([]);
    setIsSelectMode(false);
  };

  // 切换文档选择
  const toggleDocumentSelection = (id) => {
    setSelectedDocuments(prev => {
      if (prev.includes(id)) {
        return prev.filter(docId => docId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedDocuments.length === paginatedDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(paginatedDocuments.map(doc => doc.id));
    }
  };

  // 清理文档数据
  const cleanupDocuments = async () => {
    try {
      const documents = await sopManager.entities.SOPDocument.list();
      let keptDocuments = [];
      
      if (cleanupMode === 'keep') {
        // 按更新时间排序，保留最新的文档
        const sortedDocuments = documents.sort((a, b) => {
          const dateA = new Date(a.updated_date || a.created_date || 0).getTime();
          const dateB = new Date(b.updated_date || b.created_date || 0).getTime();
          return dateB - dateA; // 降序排序，最新的在前
        });
        
        // 保留前keepCount个文档
        keptDocuments = sortedDocuments.slice(0, keepCount);
      } else if (cleanupMode === 'keyword') {
        // 过滤掉包含关键词的文档
        keptDocuments = documents.filter(doc => {
          return !doc.title.toLowerCase().includes(cleanupKeyword.toLowerCase());
        });
      }
      
      // 删除多余的文档
      const deletedCount = documents.length - keptDocuments.length;
      
      // 保存清理后的文档
      // 由于sopManager没有批量更新API，我们需要先清空所有文档，然后重新创建保留的文档
      // 首先获取所有文档
      const allDocs = await sopManager.entities.SOPDocument.list();
      // 删除所有文档
      for (const doc of allDocs) {
        try {
          await sopManager.entities.SOPDocument.delete(doc.id);
        } catch (error) {
          console.error(`删除文档 ${doc.id} 失败:`, error);
        }
      }
      // 重新创建保留的文档
      for (const doc of keptDocuments) {
        try {
          // 移除id，让系统重新生成
          const { id, ...docData } = doc;
          await sopManager.entities.SOPDocument.create(docData);
        } catch (error) {
          console.error(`创建文档 ${doc.title} 失败:`, error);
        }
      }
      
      // 刷新文档列表
      queryClient.invalidateQueries({ queryKey: ["documents-all"] });
      
      toast({ 
        title: "文档清理完成", 
        description: `清理前: ${documents.length} 个文档, 清理后: ${keptDocuments.length} 个文档, 删除了: ${deletedCount} 个文档` 
      });
      
      setIsCleanupDialogOpen(false);
    } catch (error) {
      console.error('清理文档时出错:', error);
      toast({ title: "清理文档失败", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">所有文档</h1>
          <p className="text-sm text-muted-foreground mt-1">
            共 {filteredAndSorted.length} 篇文档
          </p>
        </div>
        {canCreate && (
          <Link to="/documents/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              新建文档
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="搜索文档标题或摘要..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-36 h-10">
              <SelectValue placeholder="分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有分类</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAdmin && (
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 h-10">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="published">已发布</SelectItem>
                <SelectItem value="archived">已归档</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 h-10">
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_date">更新时间</SelectItem>
              <SelectItem value="view_count">查看次数</SelectItem>
              <SelectItem value="title">标题</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={sortOrder === "asc" ? "default" : "ghost"}
            size="icon"
            className="h-10 w-10"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-24 h-10">
              <SelectValue placeholder="每页" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6 个</SelectItem>
              <SelectItem value="12">12 个</SelectItem>
              <SelectItem value="24">24 个</SelectItem>
              <SelectItem value="48">48 个</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="rounded-none h-10 w-10"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="rounded-none h-10 w-10"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          {isAdmin && (
            <>
              <Button
                variant={isSelectMode ? "default" : "ghost"}
                size="sm"
                className="gap-2"
                onClick={() => setIsSelectMode(!isSelectMode)}
              >
                <Filter className="w-4 h-4" />
                {isSelectMode ? "取消选择" : "批量操作"}
              </Button>
              <Dialog open={isCleanupDialogOpen} onOpenChange={setIsCleanupDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    <Trash className="w-4 h-4" />
                    清理文档
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>清理文档</DialogTitle>
                    <DialogDescription>
                      清理系统中的实例文档，只保留重要的文档
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>清理模式</Label>
                      <div className="flex gap-4">
                        <Button
                          variant={cleanupMode === 'keep' ? "default" : "ghost"}
                          onClick={() => setCleanupMode('keep')}
                        >
                          保留最新文档
                        </Button>
                        <Button
                          variant={cleanupMode === 'keyword' ? "default" : "ghost"}
                          onClick={() => setCleanupMode('keyword')}
                        >
                          按关键词清理
                        </Button>
                      </div>
                    </div>
                    {cleanupMode === 'keep' && (
                      <div className="space-y-2">
                        <Label>保留文档数量</Label>
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          value={keepCount}
                          onChange={(e) => setKeepCount(Number(e.target.value))}
                        />
                        <p className="text-sm text-muted-foreground">
                          将保留最新的 {keepCount} 个文档，删除其他文档
                        </p>
                      </div>
                    )}
                    {cleanupMode === 'keyword' && (
                      <div className="space-y-2">
                        <Label>关键词</Label>
                        <Input
                          type="text"
                          value={cleanupKeyword}
                          onChange={(e) => setCleanupKeyword(e.target.value)}
                          placeholder="输入要清理的文档标题关键词"
                        />
                        <p className="text-sm text-muted-foreground">
                          将删除标题中包含 "{cleanupKeyword}" 的文档
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsCleanupDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={cleanupDocuments}>
                      确认清理
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {/* Tags filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={filterTag === "" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterTag("")}
            >
              全部标签
            </Badge>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={filterTag === tag ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFilterTag(filterTag === tag ? "" : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Batch Actions */}
      {isSelectMode && isAdmin && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm">已选择 {selectedDocuments.length} 个文档</span>
          <Button
            size="sm"
            className="gap-1"
            onClick={() => handleBatchAction("archive")}
          >
            <Archive className="w-3 h-3" />
            归档
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="gap-1"
            onClick={() => handleBatchAction("delete")}
          >
            <Trash2 className="w-3 h-3" />
            删除
          </Button>
        </div>
      )}

      {/* Document Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">没有找到匹配的文档</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedDocuments.map((sop) => (
            <div key={sop.id} className="relative">
              {isSelectMode && (
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(sop.id)}
                    onChange={() => toggleDocumentSelection(sop.id)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
              )}
              <SOPCard key={sop.id} sop={sop} categoryName={catMap[sop.category_id]} />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {paginatedDocuments.map((sop) => (
            <div key={sop.id} className="relative">
              <Link
                to={`/documents/${sop.id}`}
                className="flex items-center gap-4 p-4 bg-card rounded-lg border hover:border-primary/20 hover:shadow-sm transition-all"
              >
                {isSelectMode && (
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(sop.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleDocumentSelection(sop.id);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                  />
                )}
                <FileText className={`w-5 h-5 text-primary shrink-0 ${isSelectMode ? "ml-2" : ""}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{sop.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{sop.summary || "无摘要"}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{catMap[sop.category_id] || "未分类"}</span>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredAndSorted.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            显示 {paginatedDocuments.length} / {filteredAndSorted.length} 个文档
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNumber)}
                      className={currentPage === pageNumber ? "bg-primary text-primary-foreground" : ""}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}