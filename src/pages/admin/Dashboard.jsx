import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Database, Shield, FileText, MessageSquare, Eye, Clock } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { sopManager } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const pageSize = 5;

  // 模拟数据
  const mockDocuments = [
    {
      id: "1",
      title: "车间安全操作规范",
      status: "published",
      updated_date: new Date().toISOString(),
      view_count: 100
    },
    {
      id: "2",
      title: "产品质量检验流程",
      status: "published",
      updated_date: new Date().toISOString(),
      view_count: 80
    },
    {
      id: "3",
      title: "设备维护手册",
      status: "draft",
      updated_date: new Date().toISOString(),
      view_count: 0
    },
    {
      id: "4",
      title: "员工培训计划",
      status: "published",
      updated_date: new Date().toISOString(),
      view_count: 50
    },
    {
      id: "5",
      title: "应急预案",
      status: "published",
      updated_date: new Date().toISOString(),
      view_count: 120
    },
    {
      id: "6",
      title: "质量控制流程",
      status: "draft",
      updated_date: new Date().toISOString(),
      view_count: 0
    }
  ];

  const mockFeedbacks = [
    {
      id: "1",
      content: "文档内容需要更新",
      status: "open",
      created_date: new Date().toISOString(),
      sop_id: "1"
    }
  ];

  // 计算文档分页数据
  const totalItems = mockDocuments.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDocuments = mockDocuments.slice(startIndex, endIndex);

  // 计算反馈分页数据
  const totalFeedbackItems = mockFeedbacks.length;
  const totalFeedbackPages = Math.ceil(totalFeedbackItems / pageSize);
  const feedbackStartIndex = (feedbackPage - 1) * pageSize;
  const feedbackEndIndex = feedbackStartIndex + pageSize;
  const paginatedFeedbacks = mockFeedbacks.slice(feedbackStartIndex, feedbackEndIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">仪表盘</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">用户数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">1</div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">文档数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">6</div>
              <Database className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">分类数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">5</div>
              <Database className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">反馈数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">1</div>
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle>最近文档</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedDocuments.length > 0 ? (
              paginatedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">{doc.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{doc.status === "published" ? "已发布" : "草稿"}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {doc.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(doc.updated_date), "yyyy-MM-dd")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/documents/${doc.id}`)}>
                    查看
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-muted-foreground">暂无文档</p>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>最近反馈</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedFeedbacks.length > 0 ? (
              paginatedFeedbacks.map((feedback) => (
                <div key={feedback.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm">{feedback.content}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(feedback.created_date), "yyyy-MM-dd HH:mm")} · 
                      {feedback.status === "open" ? "待处理" : "已处理"}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/admin/data/sopfeedback")}>
                    处理
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-muted-foreground">暂无反馈</p>
            )}
          </div>
          
          {/* Feedback Pagination */}
          {totalFeedbackPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setFeedbackPage(Math.max(1, feedbackPage - 1))}
                      disabled={feedbackPage === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalFeedbackPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        onClick={() => setFeedbackPage(page)}
                        isActive={feedbackPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setFeedbackPage(Math.min(totalFeedbackPages, feedbackPage + 1))}
                      disabled={feedbackPage === totalFeedbackPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}