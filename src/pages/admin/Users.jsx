import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, Edit, Trash2, Check, X, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function Users() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "user"
  });
  const [editForm, setEditForm] = useState({
    name: "",
    role: "user"
  });

  // Mock user data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Su Lei",
      role: "admin",
      email: "923360688@qq.com",
      status: "owner",
      created_at: "2024-01-01",
      last_login: "2024-03-20",
      password: "Su",
      first_login: false
    },
    {
      id: 2,
      name: "张三",
      role: "contributor",
      email: "zhangsan@example.com",
      status: "active",
      created_at: "2024-02-15",
      last_login: "2024-03-18",
      password: "zhangsan",
      first_login: false
    },
    {
      id: 3,
      name: "李四",
      role: "user",
      email: "lisi@example.com",
      status: "active",
      created_at: "2024-03-01",
      last_login: "2024-03-15",
      password: "lisi",
      first_login: false
    }
  ]);

  // Mock pending requests
  const pendingRequests = [
    {
      id: 1,
      email: "wangwu@example.com",
      requested_at: "2024-03-22"
    }
  ];

  const handleInviteUser = () => {
    if (!inviteForm.email) {
      toast({ title: "请输入邮箱地址", variant: "destructive" });
      return;
    }
    
    // 模拟邀请用户
    const username = inviteForm.email.split('@')[0];
    const newUser = {
      id: users.length + 1,
      name: username,
      role: inviteForm.role,
      email: inviteForm.email,
      status: "active",
      created_at: new Date().toISOString().split('T')[0],
      last_login: "从未登录",
      password: username, // 默认密码与用户名相同
      first_login: true // 首次登录标记
    };
    
    setUsers([...users, newUser]);
    setInviteForm({ email: "", role: "user" });
    setInviteDialogOpen(false);
    toast({ title: "用户邀请成功", description: `默认密码与用户名相同: ${username}` });
  };

  const handleEditUser = () => {
    if (!editForm.name) {
      toast({ title: "请输入用户名", variant: "destructive" });
      return;
    }
    
    // 模拟编辑用户
    const updatedUsers = users.map(user => {
      if (user.id === selectedUser.id) {
        return { ...user, name: editForm.name, role: editForm.role };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    setEditDialogOpen(false);
    setSelectedUser(null);
    toast({ title: "用户信息已更新" });
  };

  const handleDeleteUser = (userId) => {
    // 不允许删除所有者
    const user = users.find(u => u.id === userId);
    if (user.status === "owner") {
      toast({ title: "无法删除所有者", variant: "destructive" });
      return;
    }
    
    // 模拟删除用户
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    toast({ title: "用户已删除" });
  };

  const handleStartEdit = (user) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, role: user.role });
    setEditDialogOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              邀请用户
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>邀请新用户</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium mb-1">邮箱地址</label>
                <Input
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="输入用户邮箱"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">角色</label>
                <Select value={inviteForm.role} onValueChange={(v) => setInviteForm({ ...inviteForm, role: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">管理员</SelectItem>
                    <SelectItem value="contributor">贡献者</SelectItem>
                    <SelectItem value="user">用户</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>取消</Button>
                <Button onClick={handleInviteUser}>发送邀请</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <p className="text-sm text-muted-foreground">管理应用用户及其角色</p>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-border">
        <button
          onClick={() => setActiveTab("users")}
          className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "users" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          用户 ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "pending" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          待处理请求 ({pendingRequests.length})
        </button>
      </div>

      {activeTab === "users" && (
        <>
          {/* Filters */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="按邮箱或姓名搜索"
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="所有角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有角色</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
                <SelectItem value="contributor">贡献者</SelectItem>
                <SelectItem value="user">用户</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        姓名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        角色
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        邮箱
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        最后登录
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{user.name}</div>
                            {user.status === "owner" && (
                              <Badge variant="secondary" className="mt-1">所有者</Badge>
                            )}
                            {user.first_login && (
                              <Badge variant="destructive" className="mt-1">首次登录</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={user.role === "admin" ? "default" : user.role === "contributor" ? "secondary" : "outline"}>
                              {user.role === "admin" ? "管理员" : user.role === "contributor" ? "贡献者" : "用户"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={user.status === "active" ? "default" : "outline"}>
                              {user.status === "active" ? "活跃" : "非活跃"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{user.last_login}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleStartEdit(user)}
                              disabled={user.status === "owner"}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              编辑
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.status === "owner"}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              删除
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <p className="text-muted-foreground">未找到匹配的用户</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "pending" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      邮箱
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      请求时间
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">{request.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">{request.requested_at}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                            <Check className="w-4 h-4 mr-1" />
                            批准
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <X className="w-4 h-4 mr-1" />
                            拒绝
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <p className="text-muted-foreground">暂无待处理请求</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium mb-1">姓名</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="输入用户名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">角色</label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="contributor">贡献者</SelectItem>
                  <SelectItem value="user">用户</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>取消</Button>
              <Button onClick={handleEditUser}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}