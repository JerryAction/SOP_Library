import React, { useState } from "react";
import { sopManager } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, FileText, CheckCircle, XCircle, PauseCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const typeLabels = { question: "提问", suggestion: "建议", issue: "问题", praise: "赞扬" };
const statusLabels = { open: "待处理", resolved: "已解决", closed: "已关闭", paused: "暂停" };

export default function FeedbackManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("open");
  const [replyingId, setReplyingId] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ["all-feedbacks"],
    queryFn: () => sopManager.entities.SOPFeedback.list(),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["feedback-docs"],
    queryFn: () => sopManager.entities.SOPDocument.list(),
  });

  const docMap = {};
  documents.forEach((d) => (docMap[d.id] = d.title));

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => sopManager.entities.SOPFeedback.update(id, data),
    onSuccess: () => {
      toast({ title: "反馈已更新" });
      queryClient.invalidateQueries({ queryKey: ["all-feedbacks"] });
      setReplyingId(null);
      setReplyContent("");
    },
  });

  const handleReply = (fb) => {
    if (!replyContent.trim()) return;
    updateMutation.mutate({
      id: fb.id,
      data: { reply: replyContent.trim(), status: "resolved" },
    });
  };

  const filtered = feedbacks.filter((fb) => {
    if (statusFilter === "all") return true;
    return fb.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">反馈管理</h1>
        <p className="text-sm text-muted-foreground mt-1">管理用户对 SOP 文档的反馈</p>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">全部 ({feedbacks.length})</TabsTrigger>
          <TabsTrigger value="open">
            待处理 ({feedbacks.filter((f) => f.status === "open").length})
          </TabsTrigger>
          <TabsTrigger value="resolved">已解决</TabsTrigger>
          <TabsTrigger value="closed">已关闭</TabsTrigger>
          <TabsTrigger value="paused">暂停</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">暂无反馈</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((fb) => (
            <Card key={fb.id} className="border-none shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{typeLabels[fb.type]}</Badge>
                    <div className="w-24">
                      <Select value={fb.status} onValueChange={(value) => updateMutation.mutate({ id: fb.id, data: { status: value } })}>
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder="状态" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">待处理</SelectItem>
                          <SelectItem value="resolved">已解决</SelectItem>
                          <SelectItem value="closed">已关闭</SelectItem>
                          <SelectItem value="paused">暂停</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Link
                      to={`/documents/${fb.sop_id}`}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      {docMap[fb.sop_id] || "未知文档"}
                    </Link>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {fb.created_by} · {fb.created_date ? format(new Date(fb.created_date), "yyyy-MM-dd") : ""}
                  </span>
                </div>

                <p className="text-sm mb-3">{fb.content}</p>

                {fb.reply && (
                  <div className="p-3 bg-muted rounded-lg mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">管理员回复</p>
                    <p className="text-sm">{fb.reply}</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {fb.status === "open" && (
                    <>
                      {replyingId === fb.id ? (
                        <div className="flex-1 space-y-2">
                          <Textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="输入回复内容..."
                            className="min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700">
                              <Send className="w-3 h-3" /> 回复并解决
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setReplyingId(null); setReplyContent(""); }}
                            >
                              取消
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Link to={`/documents/${fb.sop_id}#feedback`} className="flex items-center gap-1">
                              <Send className="w-3 h-3" /> 回复
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => updateMutation.mutate({ id: fb.id, data: { status: "resolved" } })}
                          >
                            <CheckCircle className="w-3 h-3" /> 标记已解决
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-muted-foreground"
                            onClick={() => updateMutation.mutate({ id: fb.id, data: { status: "closed" } })}
                          >
                            <XCircle className="w-3 h-3" /> 关闭
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}