import React, { useState } from "react";
import { sopManager } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Tag, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Tags() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", sort_order: 0 });

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["tags-manage"],
    queryFn: () => sopManager.entities.SOPTag.list("sort_order"),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["tags-doc-count"],
    queryFn: () => sopManager.entities.SOPDocument.list(),
  });

  // 计算每个标签的使用次数
  const countByTag = {};
  documents.forEach((d) => {
    d.tags?.forEach((tag) => {
      countByTag[tag] = (countByTag[tag] || 0) + 1;
    });
  });

  const createMutation = useMutation({
    mutationFn: (data) => sopManager.entities.SOPTag.create(data),
    onSuccess: () => {
      toast({ title: "标签已创建" });
      // 失效相关缓存
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["tags-manage"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => sopManager.entities.SOPTag.update(id, data),
    onSuccess: () => {
      toast({ title: "标签已更新" });
      // 失效相关缓存
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["tags-manage"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => sopManager.entities.SOPTag.delete(id),
    onSuccess: () => {
      toast({ title: "标签已删除" });
      // 失效相关缓存
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["tags-manage"] });
    },
  });

  const resetForm = () => {
    setForm({ name: "", description: "", sort_order: 0 });
    setEditing(null);
    setDialogOpen(false);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: "请输入标签名称", variant: "destructive" });
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (tag) => {
    setEditing(tag);
    setForm({ name: tag.name, description: tag.description || "", sort_order: tag.sort_order || 0 });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">标签管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理 SOP 文档标签</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" /> 新建标签
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "编辑标签" : "新建标签"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>名称 *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="标签名称"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>描述</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="标签描述"
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
      ) : tags.length === 0 ? (
        <div className="text-center py-20">
          <Tag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">暂无标签，点击上方按钮创建</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {tags.map((tag) => (
            <Card key={tag.id} className="overflow-hidden border-none shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(tag)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(tag.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{tag.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {tag.description || "无描述"}
                </p>
                <span className="text-xs text-muted-foreground">
                  {countByTag[tag.name] || 0} 篇文档使用
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
