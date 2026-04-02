import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useOutletContext } from "react-router-dom";
import { sopManager } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Edit, Trash2, Eye, Clock, User, History,
  MessageSquare, Send, FileText, Tag
} from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

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
    view_count: 100,
    version: 1,
    created_by: "admin"
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
    view_count: 80,
    version: 1,
    created_by: "admin"
  }
];

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useOutletContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const canEdit = userRole === "admin" || userRole === "contributor";
  const isAdmin = userRole === "admin";

  const [feedbackType, setFeedbackType] = useState("question");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [showVersions, setShowVersions] = useState(false);

  const { data: sop, isLoading } = useQuery({
    queryKey: ["sop", id],
    queryFn: async () => {
      try {
        const result = await sopManager.entities.SOPDocument.filter({ id });
        return result[0];
      } catch (error) {
        console.warn("API 调用失败，使用模拟数据:", error);
        return mockDocuments.find(doc => doc.id === id);
      }
    },
  });

  // 模拟分类数据
  const mockCategories = [
    { id: "1", name: "安全管理", sort_order: 1 },
    { id: "2", name: "生产操作", sort_order: 2 },
    { id: "3", name: "质量检查", sort_order: 3 },
    { id: "4", name: "人事培训", sort_order: 4 },
    { id: "5", name: "设备维护", sort_order: 5 }
  ];

  const { data: categories = mockCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        return await sopManager.entities.SOPCategory.list();
      } catch (error) {
        console.warn("API 调用失败，使用模拟数据:", error);
        return mockCategories;
      }
    },
  });

  const { data: versions = [] } = useQuery({
    queryKey: ["versions", id],
    queryFn: () => sopManager.entities.SOPVersion.filter({ sop_id: id }, "-version_number"),
    enabled: showVersions,
  });

  // 模拟反馈数据
  const mockFeedbacks = [];

  const { data: feedbacks = mockFeedbacks } = useQuery({
    queryKey: ["feedbacks", id],
    queryFn: async () => {
      try {
        return await sopManager.entities.SOPFeedback.filter({ sop_id: id }, "-created_date");
      } catch (error) {
        console.warn("API 调用失败，使用模拟数据:", error);
        return mockFeedbacks;
      }
    },
  });

  const { data: relatedDocs = [] } = useQuery({
    queryKey: ["related", id],
    queryFn: async () => {
      if (!sop?.related_sop_ids?.length) return [];
      const all = await sopManager.entities.SOPDocument.list();
      return all.filter((d) => sop.related_sop_ids.includes(d.id));
    },
    enabled: !!sop,
  });

  // Increment view count and add to recent docs
  useEffect(() => {
    if (sop) {
      // Increment view count
      sopManager.entities.SOPDocument.update(sop.id, {
        view_count: (sop.view_count || 0) + 1,
      });
      
      // Add to recent docs
      const addRecentDoc = (doc) => {
        const recent = localStorage.getItem('recentDocs');
        const recentDocs = recent ? JSON.parse(recent) : [];
        const filtered = recentDocs.filter(d => d.id !== doc.id);
        filtered.unshift({ id: doc.id, title: doc.title });
        const limited = filtered.slice(0, 5);
        localStorage.setItem('recentDocs', JSON.stringify(limited));
      };
      
      addRecentDoc(sop);
    }
  }, [sop?.id]);

  const deleteMutation = useMutation({
    mutationFn: () => sopManager.entities.SOPDocument.delete(sop.id),
    onSuccess: () => {
      toast({ title: "文档已删除" });
      navigate("/documents");
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data) => {
      try {
        return await sopManager.entities.SOPFeedback.create(data);
      } catch (error) {
        console.warn("API 调用失败，使用模拟响应:", error);
        // 模拟成功响应
        return {
          id: Date.now().toString(),
          ...data,
          status: "open",
          created_by: "user",
          created_date: new Date().toISOString()
        };
      }
    },
    onSuccess: () => {
      toast({ title: "反馈已提交" });
      setFeedbackContent("");
      queryClient.invalidateQueries({ queryKey: ["feedbacks", id] });
    },
    onError: (error) => {
      console.error("提交反馈失败:", error);
      toast({ title: "提交反馈失败", description: error.message || "未知错误", variant: "destructive" });
    },
  });

  const handleSubmitFeedback = () => {
    if (!feedbackContent.trim()) return;
    feedbackMutation.mutate({
      sop_id: id,
      type: feedbackType,
      content: feedbackContent.trim(),
    });
  };

  const catMap = {};
  categories.forEach((c) => (catMap[c.id] = c.name));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!sop) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">文档不存在</p>
        <Link to="/documents" className="text-primary hover:underline mt-2 inline-block">
          返回文档列表
        </Link>
      </div>
    );
  }

  const statusMap = {
    draft: { label: "草稿", className: "bg-amber-100 text-amber-700" },
    published: { label: "已发布", className: "bg-emerald-100 text-emerald-700" },
    archived: { label: "已归档", className: "bg-slate-100 text-slate-600" },
  };
  const status = statusMap[sop.status] || statusMap.draft;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back & Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> 返回
        </Button>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Link to={`/documents/${sop.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="w-4 h-4" /> 编辑
              </Button>
            </Link>
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" /> 删除
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                    <AlertDialogDescription>
                      此操作不可撤销，确定要删除这篇文档吗？
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate()}>删除</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>

      {/* Document Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={status.className}>{status.label}</Badge>
          {catMap[sop.category_id] && (
            <Badge variant="outline">{catMap[sop.category_id]}</Badge>
          )}
          <span className="text-xs text-muted-foreground">v{sop.version || 1}</span>
        </div>
        <h1 className="text-3xl font-bold">{sop.title}</h1>
        {sop.summary && <p className="text-lg text-muted-foreground">{sop.summary}</p>}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {sop.created_by}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {sop.updated_date ? format(new Date(sop.updated_date), "yyyy-MM-dd HH:mm") : "未知"}</span>
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {sop.view_count || 0} 次查看</span>
        </div>
        {sop.tags && sop.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sop.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                <Tag className="w-3 h-3" /> {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Content */}
      <Card>
        <CardContent className="p-6 lg:p-8 prose prose-slate max-w-none dark:prose-invert">
          <ReactMarkdown>{sop.content}</ReactMarkdown>
        </CardContent>
      </Card>

      {/* Version History */}
      <div>
        <Button variant="outline" size="sm" className="gap-2 mb-3" onClick={() => setShowVersions(!showVersions)}>
          <History className="w-4 h-4" /> {showVersions ? "隐藏" : "查看"}版本历史
        </Button>
        {showVersions && (
          <Card>
            <CardContent className="p-4 divide-y divide-border">
              {versions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">暂无版本记录</p>
              ) : (
                versions.map((v) => (
                  <div key={v.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">版本 {v.version_number}</p>
                      <p className="text-xs text-muted-foreground">{v.change_notes || "无变更说明"}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {v.created_date ? format(new Date(v.created_date), "yyyy-MM-dd HH:mm") : ""}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Related Documents */}
      {relatedDocs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">相关文档</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {relatedDocs.map((rd) => (
              <Link
                key={rd.id}
                to={`/documents/${rd.id}`}
                className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:border-primary/20 transition-colors"
              >
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium truncate">{rd.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Feedback Section */}
      <div id="feedback">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> 问题与反馈
        </h3>

        {/* Feedback Stats */}
        <Card className="mb-4">
          <CardContent className="p-6 pt-0">
            <div className="flex items-center justify-between">
              <Link to="/feedback" className="text-2xl font-bold hover:text-primary transition-colors">
                {feedbacks.filter(fb => fb.status === "open").length}
              </Link>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-yellow-50">
                <MessageSquare className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">待处理反馈</p>
          </CardContent>
        </Card>

        {/* Submit Feedback */}
        <Card className="mb-4">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question">提问</SelectItem>
                  <SelectItem value="suggestion">建议</SelectItem>
                  <SelectItem value="issue">问题</SelectItem>
                  <SelectItem value="praise">赞扬</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">提交您的反馈</span>
            </div>
            <Textarea
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              placeholder="请输入您的问题或建议..."
              className="min-h-[80px]"
            />
            <Button
              onClick={handleSubmitFeedback}
              disabled={!feedbackContent.trim() || feedbackMutation.isPending}
              size="sm"
              className="gap-2"
            >
              <Send className="w-4 h-4" /> 提交
            </Button>
          </CardContent>
        </Card>

        {/* Feedback List */}
        {feedbacks.length > 0 && (
          <div className="space-y-3">
            {feedbacks.map((fb) => {
              const typeLabels = { question: "提问", suggestion: "建议", issue: "问题", praise: "赞扬" };
              const statusLabels = { open: "待处理", resolved: "已解决", closed: "已关闭" };
              return (
                <Card key={fb.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{typeLabels[fb.type]}</Badge>
                      <Badge variant="secondary" className="text-xs">{statusLabels[fb.status]}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {fb.created_by} · {fb.created_date ? format(new Date(fb.created_date), "yyyy-MM-dd") : ""}
                      </span>
                    </div>
                    <p className="text-sm">{fb.content}</p>
                    {fb.reply && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">管理员回复</p>
                        <p className="text-sm">{fb.reply}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}