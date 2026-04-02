import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, X, Clock, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { sopManager } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const popularSearches = ["安全规范", "操作流程", "质量检查", "应急处理", "培训指南"];

// 模拟最近浏览的文档
const getRecentDocs = () => {
  const recent = localStorage.getItem('recentDocs');
  return recent ? JSON.parse(recent) : [];
};

const addRecentDoc = (doc) => {
  const recent = getRecentDocs();
  const filtered = recent.filter(d => d.id !== doc.id);
  filtered.unshift(doc);
  const limited = filtered.slice(0, 5);
  localStorage.setItem('recentDocs', JSON.stringify(limited));
};

export default function SearchBar({ className = "", autofocus = false, initialValue = "" }) {
  const [query, setQuery] = useState(initialValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["search-categories"],
    queryFn: () => sopManager.entities.SOPCategory.list("sort_order"),
  });

  const recentDocs = getRecentDocs();

  useEffect(() => {
    if (autofocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autofocus]);

  const handleSearch = (searchQuery) => {
    const q = searchQuery || query;
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") setShowSuggestions(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="搜索 SOP 文档..."
          className="pl-9 pr-9 h-11 bg-card"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg border border-border shadow-lg p-3 z-50 max-h-80 overflow-y-auto">
          {/* 最近浏览 */}
          {recentDocs.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                <Clock className="w-3 h-3" />
                最近浏览
              </div>
              <div className="space-y-1">
                {recentDocs.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/documents/${doc.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md"
                    onClick={() => setShowSuggestions(false)}
                  >
                    <span className="text-xs text-muted-foreground">{doc.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 按分类筛选 */}
          {categories.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                <FolderOpen className="w-3 h-3" />
                按分类筛选
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/documents?category=${category.id}`}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => setShowSuggestions(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 热门搜索 */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">热门搜索</p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onMouseDown={() => {
                    setQuery(term);
                    handleSearch(term);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}