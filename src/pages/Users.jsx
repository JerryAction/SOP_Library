import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, Edit, Trash2, Check, X, Mail, Eye, EyeOff } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    role: "user",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    role: "user",
    password: ""
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Mock user data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "admin",
      role: "admin",
      email: "admin@example.com",
      status: "owner",
      created_at: "2024-01-01",
      last_login: "2024-03-20",
      password: "admin",
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

  const handleEditUser = () => {
    if (!editForm.name || !editForm.password) {
      toast({ title: "请填写所有必填字段", variant: "destructive" });
      return;
    }
    
    // 模拟编辑用户
    const updatedUsers = users.map(user => {
      if (user.id === selectedUser.id) {
        return { ...user, name: editForm.name, role: editForm.role, password: editForm.password };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    
    // 保存到localStorage
    try {
      // 使用与base44Client.js相同的加密方式
      const encryptData = (data) => {
        try {
          const jsonString = JSON.stringify(data);
          return btoa(unescape(encodeURIComponent(jsonString)));
        } catch (error) {
          console.error('Error encrypting data:', error);
          return JSON.stringify(data);
        }
      };
      const encryptedUsers = encryptData(updatedUsers);
      localStorage.setItem('sopUsers', encryptedUsers);
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
    
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
    
    // 保存到localStorage
    try {
      // 使用与base44Client.js相同的加密方式
      const encryptData = (data) => {
        try {
          const jsonString = JSON.stringify(data);
          return btoa(unescape(encodeURIComponent(jsonString)));
        } catch (error) {
          console.error('Error encrypting data:', error);
          return JSON.stringify(data);
        }
      };
      const encryptedUsers = encryptData(updatedUsers);
      localStorage.setItem('sopUsers', encryptedUsers);
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
    
    toast({ title: "用户已删除" });
  };

  const handleCreateUser = () => {
    if (!createForm.name || !createForm.password) {
      toast({ title: "请填写所有必填字段", variant: "destructive" });
      return;
    }
    
    // 模拟创建新用户
    const newUser = {
      id: Date.now(),
      name: createForm.name,
      email: `${createForm.name}@example.com`,
      role: createForm.role,
      status: "active",
      created_at: new Date().toISOString().split('T')[0],
      last_login: "从未登录",
      password: createForm.password,
      first_login: true
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // 保存到localStorage
    try {
      // 使用与base44Client.js相同的加密方式
      const encryptData = (data) => {
        try {
          const jsonString = JSON.stringify(data);
          return btoa(unescape(encodeURIComponent(jsonString)));
        } catch (error) {
          console.error('Error encrypting data:', error);
          return JSON.stringify(data);
        }
      };
      const encryptedUsers = encryptData(updatedUsers);
      localStorage.setItem('sopUsers', encryptedUsers);
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
    
    setCreateDialogOpen(false);
    setCreateForm({ name: "", role: "user", password: "" });
    toast({ title: "用户创建成功" });
  };

  const handleStartEdit = (user) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, role: user.role, password: user.password });
    setEditDialogOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          新建用户
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">管理应用用户及其角色</p>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="按姓名搜索"
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
                        <Badge variant={user.role === "admin" ? "default" : "outline"}>
                          {user.role === "admin" ? "管理员" : "用户"}
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
                    <SelectItem value="user">用户</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">密码</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="输入密码"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>取消</Button>
              <Button onClick={handleEditUser}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新建用户</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium mb-1">姓名</label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="输入用户名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">角色</label>
              <Select value={createForm.role} onValueChange={(v) => setCreateForm({ ...createForm, role: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">管理员</SelectItem>
                    <SelectItem value="user">用户</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">密码</label>
              <div className="relative">
                <Input
                  type={showCreatePassword ? "text" : "password"}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="输入密码"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword(!showCreatePassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>取消</Button>
              <Button onClick={handleCreateUser}>创建</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
