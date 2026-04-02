import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Database,
  FileText,
  ChevronRight
} from "lucide-react";

const navItems = [
  { icon: Home, label: "仪表盘", path: "/admin" },
  { icon: Users, label: "用户管理", path: "/admin/users" },
  {
    icon: Database,
    label: "数据管理",
    path: "/admin/data",
    subItems: [
      { label: "SOP文档", path: "/admin/data/sopdocument" },
      { label: "SOP分类", path: "/admin/data/sopcategory" },
      { label: "SOP反馈", path: "/admin/data/sopfeedback" }
    ]
  },


  { icon: FileText, label: "日志管理", path: "/admin/logs" },

];

export default function AdminLayout() {
  const [expandedItems, setExpandedItems] = useState({ data: true });
  const location = useLocation();

  const toggleSubMenu = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className="flex min-h-screen bg-background font-inter">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <h1 className="font-bold text-lg">Dashboard</h1>
        </div>



        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <div key={item.label} className="px-3 mb-1">
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleSubMenu(item.label.toLowerCase())}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(item.path) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${expandedItems[item.label.toLowerCase()] ? "rotate-90" : ""}`} />
                  </button>
                  {expandedItems[item.label.toLowerCase()] && (
                    <div className="mt-1 ml-6 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.label}
                          to={subItem.path}
                          className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(subItem.path) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`block flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(item.path) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}