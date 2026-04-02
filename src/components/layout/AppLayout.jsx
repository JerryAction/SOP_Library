import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { sopManager } from "@/api/base44Client";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    sopManager.auth.me().then((user) => {
      setUserRole(user?.role || "user");
    });
  }, []);

  return (
    <div className="min-h-screen bg-background font-inter flex">
      <Sidebar userRole={userRole} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet context={{ userRole }} />
        </div>
      </main>
    </div>
  );
}