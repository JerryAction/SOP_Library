import React, { useState } from "react";
import { sopManager } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, FolderOpen, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Categories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", sort_order: 0 });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories-manage"],
    queryFn: () => sopManager.entities.SOPCategory.list("sort_order"),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["categories-doc-count"],
    queryFn: () => sopManager.entities.SOPDocument.list(),
  });

  const countByCategory = {};
  documents.forEach((d) => {
    if (d.category_id) {
      countByCategory[d.category_id] = (countByCategory[d.category_id] || 0) + 1;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => sopManager.entities.SOPCategory.create(data),
    onSuccess: () => {
      toast({ title: "分类已创建" });
      // 失效相关缓存
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-manage"] });
      queryClient.invalidateQueries({ queryKey: ["categories-doc-count"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-categories"] });
      queryClient.invalidateQueries({ queryKey: ["editor-categories"] });
      queryClient.invalidateQueries({ queryKey: ["search-categories"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => sopManager.entities.SOPCategory.update(id, data),
    onSuccess: () => {
      toast({ title: "分类已更新" });
      // 失效相关缓存
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-manage"] });
      queryClient.invalidateQueries({ queryKey: ["categories-doc-count"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-categories"] });
      queryClient.invalidateQueries({ queryKey: ["editor-categories"] });
      queryClient.invalidateQueries({ queryKey: ["search-categories"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => sopManager.entities.SOPCategory.delete(id),
    onSuccess: () => {
      toast({ title: "分类已删除" });
      // 失效相关缓存
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-manage"] });
      queryClient.invalidateQueries({ queryKey: ["categories-doc-count"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-categories"] });
      queryClient.invalidateQueries({ queryKey: ["editor-categories"] });
      queryClient.invalidateQueries({ queryKey: ["search-categories"] });
    },
  });

  const resetForm = () => {
    setForm({ name: "", description: "", sort_order: 0 });
    setEditing(null);
    setDialogOpen(false);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: "请输入分类名称", variant: "destructive" });
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "", sort_order: cat.sort_order || 0 });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">分类管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理 SOP 文档分类</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" /> 新建分类
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "编辑分类" : "新建分类"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>名称 *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="分类名称"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>描述</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="分类描述"
                  className="mt-1 h-20"
                />
              </div>
              <div>
                <Label>排序（数字越小越靠前）</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-24"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={resetForm}>取消</Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" /> 保存
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">暂无分类，点击上方按钮创建</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Card key={cat.id} className="overflow-hidden border-none shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(cat)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(cat.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{cat.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {cat.description || "无描述"}
                </p>
                <span className="text-xs text-muted-foreground">
                  {countByCategory[cat.id] || 0} 篇文档
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}