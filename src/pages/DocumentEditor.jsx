import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { sopManager } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, X, Plus } from "lucide-react";
import ReactQuill from "react-quill";
import { useToast } from "@/components/ui/use-toast";
import DynamicForm from "@/components/ui/DynamicForm";


export default function DocumentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useOutletContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isNew = !id || id === "new";
  const isAdmin = userRole === "admin";

  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    category_id: "",
    tags: [],
    status: userRole === "admin" ? "published" : "draft",
    related_sop_ids: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [changeNotes, setChangeNotes] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["editor-categories"],
    queryFn: () => sopManager.entities.SOPCategory.list("sort_order"),
  });

  const { data: allDocs = [] } = useQuery({
    queryKey: ["editor-all-docs"],
    queryFn: () => sopManager.entities.SOPDocument.list("title"),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["editor-tags"],
    queryFn: () => sopManager.entities.SOPTag.list("sort_order"),
  });

  const { data: existing } = useQuery({
    queryKey: ["sop-edit", id],
    queryFn: () => sopManager.entities.SOPDocument.filter({ id }),
    select: (data) => data[0],
    enabled: !isNew,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || "",
        summary: existing.summary || "",
        content: existing.content || "",
        category_id: existing.category_id || "",
        tags: existing.tags || [],
        status: existing.status || "draft",
        related_sop_ids: existing.related_sop_ids || [],
      });
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isNew) {
        const created = await sopManager.entities.SOPDocument.create({
          ...data,
          version: 1,
          view_count: 0,
        });
        // Create initial version
        await sopManager.entities.SOPVersion.create({
          sop_id: created.id,
          version_number: 1,
          title: data.title,
          content: data.content,
          change_notes: "初始版本",
        });
        return created;
      } else {
        const newVersion = (existing?.version || 1) + 1;
        // Save version snapshot
        await sopManager.entities.SOPVersion.create({
          sop_id: id,
          version_number: newVersion,
          title: data.title,
          content: data.content,
          change_notes: changeNotes || `更新至版本 ${newVersion}`,
        });
        return sopManager.entities.SOPDocument.update(id, {
          ...data,
          version: newVersion,
        });
      }
    },
    onSuccess: (result) => {
      toast({ title: isNew ? "文档已创建" : "文档已更新" });
      // 失效相关缓存
      queryClient.invalidateQueries({ queryKey: ["sop"] });
      queryClient.invalidateQueries({ queryKey: ["sop-edit"] });
      queryClient.invalidateQueries({ queryKey: ["documents-all"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-docs"] });
      queryClient.invalidateQueries({ queryKey: ["editor-all-docs"] });
      navigate(`/documents/${result.id || id}`);
    },
  });

  const handleSave = () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "请填写标题和内容", variant: "destructive" });
      return;
    }
    saveMutation.mutate(form);
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

  const toggleRelated = (docId) => {
    const ids = form.related_sop_ids.includes(docId)
      ? form.related_sop_ids.filter((i) => i !== docId)
      : [...form.related_sop_ids, docId];
    setForm({ ...form, related_sop_ids: ids });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> 返回
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>取消</Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2">
            <Save className="w-4 h-4" /> {isNew ? "创建" : "保存"}
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-bold">{isNew ? "新建文档" : "编辑文档"}</h1>

      {/* 分类选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">文档类型</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
            <SelectTrigger>
              <SelectValue placeholder="选择文档类型" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 文档内容 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">文档内容</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">标题 *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="输入文档标题"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="status">状态</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger id="status" className="mt-1">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="archived">已归档</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="summary">摘要</Label>
              <Textarea
                id="summary"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="简要描述文档内容"
                className="mt-1 h-20"
              />
            </div>
            <div>
              <Label htmlFor="content">详细内容 *</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="输入文档详细内容"
                className="mt-1 h-60"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">标签</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="添加标签后按回车"
              className="flex-1"
            />
            <Button variant="outline" size="icon" onClick={addTag}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {form.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                {tag}
                <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          {/* 标签预览和选择 */}
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">选择标签：</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={form.tags.includes(tag.name) ? "default" : "outline"}
                  className={`cursor-pointer ${form.tags.includes(tag.name) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}
                  onClick={() => {
                    if (form.tags.includes(tag.name)) {
                      setForm({ ...form, tags: form.tags.filter((t) => t !== tag.name) });
                    } else {
                      setForm({ ...form, tags: [...form.tags, tag.name] });
                    }
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related SOPs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">关联文档</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {allDocs.filter((d) => d.id !== id).map((d) => (
              <button
                key={d.id}
                onClick={() => toggleRelated(d.id)}
                className={`text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
                  form.related_sop_ids.includes(d.id)
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {d.title}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Version Notes (for edits only) */}
      {!isNew && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">版本说明</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              placeholder="描述本次修改内容（可选）"
            />
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-2 pb-8">
        <Button variant="outline" onClick={() => navigate(-1)}>取消</Button>
        <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2">
          <Save className="w-4 h-4" /> {isNew ? "创建文档" : "保存修改"}
        </Button>
      </div>
    </div>
  );
}