import React, { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { sopManager } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Clock, Eye, Tag } from "lucide-react";
import { format } from "date-fns";
import SearchBar from "@/components/sop/SearchBar";
import ReactMarkdown from "react-markdown";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: documents = [] } = useQuery({
    queryKey: ["search-docs"],
    queryFn: async () => {
      const allDocs = await sopManager.entities.SOPDocument.list("-updated_date");
      return allDocs.filter(doc => doc.status === "published");
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["search-categories"],
    queryFn: () => sopManager.entities.SOPCategory.list(),
  });

  const catMap = {};
  categories.forEach((c) => (catMap[c.id] = c.name));

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return documents
      .filter((doc) => {
        const inTitle = doc.title?.toLowerCase().includes(q);
        const inContent = doc.content?.toLowerCase().includes(q);
        const inSummary = doc.summary?.toLowerCase().includes(q);
        const inTags = doc.tags?.some((t) => t.toLowerCase().includes(q));
        return inTitle || inContent || inSummary || inTags;
      })
      .map((doc) => {
        // Simple relevance: title match > tag match > summary > content
        let score = 0;
        if (doc.title?.toLowerCase().includes(q)) score += 10;
        if (doc.tags?.some((t) => t.toLowerCase().includes(q))) score += 5;
        if (doc.summary?.toLowerCase().includes(q)) score += 3;
        if (doc.content?.toLowerCase().includes(q)) score += 1;
        return { ...doc, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [documents, query]);

  // Extract snippet around match
  const getSnippet = (content, q) => {
    if (!content) return "";
    const plain = content.replace(/<[^>]+>/g, "").replace(/[#*_~`]/g, "");
    const idx = plain.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return plain.slice(0, 150) + "...";
    const start = Math.max(0, idx - 60);
    const end = Math.min(plain.length, idx + q.length + 60);
    return (start > 0 ? "..." : "") + plain.slice(start, end) + (end < plain.length ? "..." : "");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">搜索文档</h1>
      <SearchBar className="w-full" autofocus initialValue={query} />

      {query && (
        <p className="text-sm text-muted-foreground">
          找到 <span className="font-semibold text-foreground">{results.length}</span> 个结果
          {query && <> · 搜索：「{query}」</>}
        </p>
      )}

      {!query && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">输入关键词搜索 SOP 文档</p>
        </div>
      )}

      {query && results.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">没有找到匹配「{query}」的结果</p>
          <p className="text-sm text-muted-foreground mt-1">试试其他关键词</p>
        </div>
      )}

      <div className="space-y-3">
        {results.map((doc) => (
          <Link key={doc.id} to={`/documents/${doc.id}`}>
            <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer mb-3">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{doc.title}</h3>
                      {catMap[doc.category_id] && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {catMap[doc.category_id]}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {getSnippet(doc.content, query)}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {doc.view_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {doc.updated_date ? format(new Date(doc.updated_date), "yyyy-MM-dd") : ""}
                      </span>
                    </div>
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {doc.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/5 text-primary/80">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}