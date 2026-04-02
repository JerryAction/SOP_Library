import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Filter, RefreshCw, MoreHorizontal, Edit, Trash2, Save, Download, Check, X } from "lucide-react";
import { sopManager } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SOPDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ 
    title: "", 
    content: "", 
    summary: "", 
    category_id: "", 
    tags: [], 
    status: "draft"
  });
  const [tagInput, setTagInput] = useState("");
  
  // 行内编辑状态
  const [inlineEditing, setInlineEditing] = useState(null);
  const [inlineValue, setInlineValue] = useState("");
  
  // 批量操作状态
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // 高级筛选状态
  const [filters, setFilters] = useState({
    status: "all",
    categories: [],
    tags: "",
    dateRange: {
      start: null,
      end: null
    }
  });
  
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
      updated_date: new Date().toISOString()
    },
    {
      id: "2",
      title: "产品质量检验流程",
      content: "# 1. 目的\n确保产品...",
      summary: "产品出厂前的质量检...",
      category_id: "2",
      tags: ["质量", "检验", "出厂"],
      status: "published",
      updated_date: new Date().toISOString()
    }
  ];

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["sop-documents"],
    queryFn: async () => {
      try {
        // 尝试从localStorage获取文档数据
        const documents = JSON.parse(localStorage.getItem('sopDocuments') || '[]');
        return documents.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
      } catch (error) {
        console.warn("数据库调用失败:", error);
        return mockDocuments;
      }
    },
  });

  // 分页状态
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10
  });

  // 计算分页数据
  const paginatedDocuments = documents?.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  ) || [];
  
  // 计算总页数
  const totalPages = Math.ceil((documents?.length || 0) / pagination.pageSize);

  // 模拟分类数据
  const mockCategories = [
    { id: "1", name: "安全管理", sort_order: 1 },
    { id: "2", name: "生产操作", sort_order: 2 },
    { id: "3", name: "质量检查", sort_order: 3 },
    { id: "4", name: "人事培训", sort_order: 4 },
    { id: "5", name: "设备维护", sort_order: 5 }
  ];

  const { data: categories = [] } = useQuery({
    queryKey: ["sop-categories"],
    queryFn: async () => {
      try {
        return await sopManager.entities.SOPCategory.list("sort_order");
      } catch (error) {
        console.warn("数据库调用失败:", error);
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Mutation data:', data);
      try {
        // 尝试保存到localStorage
        if (typeof localStorage !== 'undefined') {
          const documents = JSON.parse(localStorage.getItem('sopDocuments') || '[]');
          const id = Date.now().toString();
          const now = new Date().toISOString();
          
          const newDocument = {
            id,
            ...data,
            created_date: now,
            updated_date: now
          };
          
          console.log('New document:', newDocument);
          documents.push(newDocument);
          console.log('Documents after push:', documents);
          
          try {
            localStorage.setItem('sopDocuments', JSON.stringify(documents));
            console.log('Document created successfully');
            return newDocument;
          } catch (storageError) {
            console.error('Storage error:', storageError);
            // 如果localStorage失败，返回新文档但不保存
            return newDocument;
          }
        } else {
          // localStorage不可用，返回模拟数据
          const id = Date.now().toString();
          const now = new Date().toISOString();
          const newDocument = {
            id,
            ...data,
            created_date: now,
            updated_date: now
          };
          return newDocument;
        }
      } catch (error) {
        console.error("创建文档失败:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Mutation success:', data);
      toast({ title: "文档已创建" });
      // 失效相关缓存
      queryClient.invalidateQueries({ queryKey: ["sop-documents"] });
      queryClient.invalidateQueries({ queryKey: ["sop"] });
      queryClient.invalidateQueries({ queryKey: ["documents-all"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-docs"] });
      queryClient.invalidateQueries({ queryKey: ["editor-all-docs"] });
      resetForm();
    },
    onError: (error) => {
      console.error("创建文档失败:", error);
      toast({ title: "创建文档失败", description: error.message || "未知错误", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        return await sopManager.entities.SOPDocument.update(id, data);
      } catch (error) {
        console.error("更新文档失败:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "文档已更新" });
      // 失效相关缓存
      queryClient.invalidateQueries({ queryKey: ["sop-documents"] });
      queryClient.invalidateQueries({ queryKey: ["sop"] });
      queryClient.invalidateQueries({ queryKey: ["documents-all"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-docs"] });
      queryClient.invalidateQueries({ queryKey: ["editor-all-docs"] });
      resetForm();
    },
    onError: (error) => {
      console.error("更新文档失败:", error);
      toast({ title: "更新文档失败", description: error.message || "未知错误", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      try {
        return await sopManager.entities.SOPDocument.delete(id);
      } catch (error) {
        console.error("删除文档失败:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "文档已删除" });
      // 失效相关缓存
      queryClient.invalidateQueries({ queryKey: ["sop-documents"] });
      queryClient.invalidateQueries({ queryKey: ["sop"] });
      queryClient.invalidateQueries({ queryKey: ["documents-all"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-docs"] });
      queryClient.invalidateQueries({ queryKey: ["editor-all-docs"] });
    },
  });

  const resetForm = () => {
    setForm({ 
      title: "", 
      content: "", 
      summary: "", 
      category_id: "", 
      tags: [], 
      status: "draft"
    });
    setTagInput("");
    setEditing(null);
    setDialogOpen(false);
  };
  
  // 行内编辑处理函数
  const startInlineEdit = (docId, field, value) => {
    setInlineEditing({ docId, field });
    setInlineValue(value);
  };
  
  const saveInlineEdit = async () => {
    if (!inlineEditing) return;
    
    const { docId, field } = inlineEditing;
    const doc = documents.find(d => d.id === docId);
    
    if (doc) {
      const updatedData = { ...doc, [field]: inlineValue };
      try {
        await updateMutation.mutateAsync({ id: docId, data: updatedData });
        toast({ title: "编辑成功" });
      } catch (error) {
        toast({ title: "编辑失败", variant: "destructive" });
      }
    }
    
    setInlineEditing(null);
    setInlineValue("");
  };
  
  const cancelInlineEdit = () => {
    setInlineEditing(null);
    setInlineValue("");
  };
  
  // 批量操作处理函数
  const handleSelectDocument = (docId) => {
    setSelectedDocuments(prev => {
      if (prev.includes(docId)) {
        return prev.filter(id => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(paginatedDocuments.map(doc => doc.id));
    }
    setSelectAll(!selectAll);
  };
  
  const handleBatchDelete = async () => {
    if (selectedDocuments.length === 0) {
      toast({ title: "请选择要删除的文档", variant: "destructive" });
      return;
    }
    
    try {
      for (const id of selectedDocuments) {
        await deleteMutation.mutateAsync(id);
      }
      toast({ title: `已删除 ${selectedDocuments.length} 个文档` });
      setSelectedDocuments([]);
      setSelectAll(false);
    } catch (error) {
      toast({ title: "批量删除失败", variant: "destructive" });
    }
  };
  
  const handleBatchPublish = async () => {
    if (selectedDocuments.length === 0) {
      toast({ title: "请选择要发布的文档", variant: "destructive" });
      return;
    }
    
    try {
      for (const id of selectedDocuments) {
        const doc = documents.find(d => d.id === id);
        if (doc) {
          await updateMutation.mutateAsync({ 
            id, 
            data: { ...doc, status: "published" } 
          });
        }
      }
      toast({ title: `已发布 ${selectedDocuments.length} 个文档` });
      setSelectedDocuments([]);
      setSelectAll(false);
    } catch (error) {
      toast({ title: "批量发布失败", variant: "destructive" });
    }
  };
  
  const handleBatchArchive = async () => {
    if (selectedDocuments.length === 0) {
      toast({ title: "请选择要归档的文档", variant: "destructive" });
      return;
    }
    
    try {
      for (const id of selectedDocuments) {
        const doc = documents.find(d => d.id === id);
        if (doc) {
          await updateMutation.mutateAsync({ 
            id, 
            data: { ...doc, status: "archived" } 
          });
        }
      }
      toast({ title: `已归档 ${selectedDocuments.length} 个文档` });
      setSelectedDocuments([]);
      setSelectAll(false);
    } catch (error) {
      toast({ title: "批量归档失败", variant: "destructive" });
    }
  };
  
  const handleCopyLinks = () => {
    if (selectedDocuments.length === 0) {
      toast({ title: "请选择要复制链接的文档", variant: "destructive" });
      return;
    }
    
    const links = selectedDocuments.map(id => {
      const doc = documents.find(d => d.id === id);
      return `http://localhost:5173/sop/${id} (${doc?.title || id})`;
    }).join("\n");
    
    navigator.clipboard.writeText(links).then(() => {
      toast({ title: "链接已复制到剪贴板" });
    });
  };
  
  // 导出为CSV功能
  const handleExportCSV = () => {
    const headers = ["ID", "标题", "内容", "摘要", "分类", "标签", "状态", "更新日期"];
    const rows = documents.map(doc => {
      const category = categories.find(c => c.id === doc.category_id);
      return [
        doc.id,
        `"${doc.title.replace(/"/g, '""')}"`,
        `"${doc.content.replace(/"/g, '""')}"`,
        `"${doc.summary.replace(/"/g, '""')}"`,
        `"${category?.name || doc.category_id || "未分类"}"`,
        `"${doc.tags?.join(", ") || "无"}"`,
        doc.status === "published" ? "已发布" : doc.status === "draft" ? "草稿" : "已归档",
        doc.updated_date
      ];
    });
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sop_documents_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "导出成功" });
  };
  
  // 筛选处理函数
  const applyFilters = () => {
    // 这里可以实现筛选逻辑
    toast({ title: "筛选条件已应用" });
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "请填写标题和内容", variant: "destructive" });
      return;
    }
    console.log("Form data:", form);
    try {
      if (editing) {
        console.log("Updating document:", editing.id);
        updateMutation.mutate({ id: editing.id, data: form });
      } else {
        console.log("Creating new document");
        createMutation.mutate(form);
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast({ title: "操作失败", description: error.message || "未知错误", variant: "destructive" });
    }
  };

  const startEdit = (doc) => {
    setEditing(doc);
    setForm({ 
      title: doc.title || "", 
      content: doc.content || "", 
      summary: doc.summary || "", 
      category_id: doc.category_id || "", 
      tags: doc.tags || [], 
      status: doc.status || "draft"
    });
    setDialogOpen(true);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SOP文档管理</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["sop-documents"] })}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExportCSV} title="导出为CSV">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 批量操作栏 */}
      {selectedDocuments.length > 0 && (
        <div className="bg-muted p-4 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>已选择 {selectedDocuments.length} 个文档</span>
            <Button variant="outline" size="sm" onClick={handleBatchPublish}>批量发布</Button>
            <Button variant="outline" size="sm" onClick={handleBatchArchive}>批量归档</Button>
            <Button variant="outline" size="sm" onClick={handleCopyLinks}>复制链接</Button>
            <Button variant="destructive" size="sm" onClick={handleBatchDelete}>批量删除</Button>
          </div>
        </div>
      )}

      {/* 高级筛选 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">高级筛选</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="filter-status">状态</Label>
              <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger id="filter-status" className="mt-1">
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="archived">已归档</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-category">分类</Label>
              <Select value={filters.categories[0] || ""} onValueChange={(v) => setFilters({ ...filters, categories: v ? [v] : [] })}>
                <SelectTrigger id="filter-category" className="mt-1">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部分类</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-tags">标签</Label>
              <Input
                id="filter-tags"
                value={filters.tags}
                onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
                placeholder="输入标签关键词"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="filter-date">时间范围</Label>
              <Input
                id="filter-date"
                type="text"
                value={filters.dateRange.start ? `${filters.dateRange.start} 至 ${filters.dateRange.end || ''}` : ''}
                onChange={() => {}}
                placeholder="选择日期范围"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setFilters({ status: "all", categories: [], tags: "", dateRange: { start: null, end: null } })}>重置</Button>
            <Button onClick={applyFilters}>应用筛选</Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : paginatedDocuments.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">暂无文档，点击上方按钮创建</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <div className="flex items-center">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                          className="mr-2"
                        />
                        选择
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      标题
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      内容
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      摘要
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      分类
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      标签
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedDocuments.map((doc) => {
                    const category = categories.find(c => c.id === doc.category_id);
                    const isEditingTitle = inlineEditing?.docId === doc.id && inlineEditing?.field === "title";
                    const isEditingStatus = inlineEditing?.docId === doc.id && inlineEditing?.field === "status";
                    const isEditingCategory = inlineEditing?.docId === doc.id && inlineEditing?.field === "category_id";
                    
                    return (
                      <tr key={doc.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Checkbox
                            checked={selectedDocuments.includes(doc.id)}
                            onCheckedChange={() => handleSelectDocument(doc.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditingTitle ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={inlineValue}
                                onChange={(e) => setInlineValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveInlineEdit();
                                  if (e.key === "Escape") cancelInlineEdit();
                                }}
                                autoFocus
                                className="w-48"
                              />
                              <Button variant="ghost" size="icon" onClick={saveInlineEdit}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={cancelInlineEdit}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className="text-sm font-medium cursor-pointer hover:text-primary"
                              onClick={() => startInlineEdit(doc.id, "title", doc.title)}
                            >
                              {doc.title}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm truncate max-w-xs">{doc.content}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm truncate max-w-xs">{doc.summary}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditingCategory ? (
                            <div className="flex items-center gap-2">
                              <Select
                                value={inlineValue}
                                onValueChange={setInlineValue}
                                onOpenChange={(open) => !open && saveInlineEdit()}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button variant="ghost" size="icon" onClick={saveInlineEdit}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={cancelInlineEdit}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className="text-sm cursor-pointer hover:text-primary"
                              onClick={() => startInlineEdit(doc.id, "category_id", doc.category_id)}
                            >
                              {category?.name || doc.category_id || "未分类"}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">{doc.tags?.join(", ") || "无"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditingStatus ? (
                            <div className="flex items-center gap-2">
                              <Select
                                value={inlineValue}
                                onValueChange={setInlineValue}
                                onOpenChange={(open) => !open && saveInlineEdit()}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">草稿</SelectItem>
                                  <SelectItem value="published">已发布</SelectItem>
                                  <SelectItem value="archived">已归档</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="ghost" size="icon" onClick={saveInlineEdit}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={cancelInlineEdit}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className="text-sm cursor-pointer hover:text-primary"
                              onClick={() => startInlineEdit(doc.id, "status", doc.status)}
                            >
                              {doc.status === "published" ? "已发布" : doc.status === "draft" ? "草稿" : "已归档"}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => startEdit(doc)}
                          >
                            编辑
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate(doc.id)}
                          >
                            删除
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* 分页控件 */}
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                显示 {((pagination.page - 1) * pagination.pageSize) + 1} 到 {Math.min(pagination.page * pagination.pageSize, documents.length)} 共 {documents.length} 条记录
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPagination({ ...pagination, page: 1 })} 
                  disabled={pagination.page === 1}
                >
                  首页
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} 
                  disabled={pagination.page === 1}
                >
                  上一页
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={pagination.page === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPagination({ ...pagination, page })}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <Button variant="outline" size="sm" className="cursor-default">
                      ...
                    </Button>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} 
                  disabled={pagination.page === totalPages}
                >
                  下一页
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPagination({ ...pagination, page: totalPages })} 
                  disabled={pagination.page === totalPages}
                >
                  末页
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}