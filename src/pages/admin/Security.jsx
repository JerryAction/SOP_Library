import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2 } from "lucide-react";

export default function Security() {
  // Mock security data
  const entities = [
    {
      name: "SOPDocument",
      visibility: "公开",
      access: "所有用户拥有完全访问权限"
    },
    {
      name: "SOPCategory",
      visibility: "公开",
      access: "所有用户拥有完全访问权限"
    },
    {
      name: "SOPVersion",
      visibility: "公开",
      access: "所有用户拥有完全访问权限"
    },
    {
      name: "SOPFeedback",
      visibility: "公开",
      access: "所有用户拥有完全访问权限"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">应用安全</h1>
      </div>

      <p className="text-sm text-muted-foreground">配置行级安全策略，控制谁可以访问应用数据</p>

      {/* Security Check */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">扫描问题</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm">扫描通常需要几分钟时间完成</p>
            <Button className="gap-2">
              开始安全检查
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Entities */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          数据实体
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entities.map((entity) => (
            <Card key={entity.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{entity.name}</h3>
                  <span className="text-xs text-muted-foreground">{entity.visibility}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">{entity.access}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}