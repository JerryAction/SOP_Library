import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { sopManager } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

// 简单的解密函数（与base44Client.js中的一致）
const decryptData = (encryptedData) => {
  try {
    // 使用 atob 进行简单的解码
    const jsonString = decodeURIComponent(escape(atob(encryptedData)));
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error decrypting data:', error);
    try {
      // 如果解密失败，尝试直接解析（兼容旧数据）
      return JSON.parse(encryptedData);
    } catch (parseError) {
      return [];
    }
  }
};

// 登录失败锁定管理类
class LoginLockoutManager {
  constructor() {
    this.storageKey = 'loginFailures';
  }

  // 获取登录失败记录
  getFailures() {
    try {
      const failures = localStorage.getItem(this.storageKey);
      console.log('获取失败记录:', failures);
      return failures ? JSON.parse(failures) : {};
    } catch (error) {
      console.error('Error getting login failures:', error);
      return {};
    }
  }

  // 保存登录失败记录
  saveFailures(failures) {
    try {
      const failuresString = JSON.stringify(failures);
      console.log('保存失败记录字符串:', failuresString);
      localStorage.setItem(this.storageKey, failuresString);
      console.log('保存失败记录:', failures);
      // 验证保存是否成功
      const savedFailures = localStorage.getItem(this.storageKey);
      console.log('验证保存结果:', savedFailures);
      return true;
    } catch (error) {
      console.error('Error saving login failures:', error);
      return false;
    }
  }

  // 计算锁定时间（分钟）
  calculateLockoutTime(failureCount) {
    if (failureCount < 5) return 0;
    if (failureCount === 5) return 30;
    return 60 * (failureCount - 5); // 每增加一次失败，增加60分钟
  }

  // 检查用户是否被锁定
  isLocked(username) {
    const failures = this.getFailures();
    const userFailures = failures[username];
    
    if (!userFailures) return { locked: false, remainingTime: 0 };
    
    const { lockedUntil } = userFailures;
    const now = Date.now();
    
    if (now < lockedUntil) {
      const remainingTime = Math.ceil((lockedUntil - now) / 1000 / 60);
      return { locked: true, remainingTime };
    }
    
    // 锁定时间已过，重置失败次数
    delete failures[username];
    this.saveFailures(failures);
    
    return { locked: false, remainingTime: 0 };
  }

  // 记录登录失败
  recordFailure(username) {
    const failures = this.getFailures();
    const userFailures = failures[username] || { count: 0, lockedUntil: 0 };
    const newCount = userFailures.count + 1;
    
    console.log('用户:', username, '失败次数:', newCount);
    
    // 计算锁定时间
    const lockoutMinutes = this.calculateLockoutTime(newCount);
    let lockedUntil = 0;
    
    if (lockoutMinutes > 0) {
      lockedUntil = Date.now() + (lockoutMinutes * 60 * 1000);
      console.log('用户:', username, '被锁定，时间:', lockoutMinutes, '分钟');
    }
    
    // 更新失败记录
    failures[username] = {
      count: newCount,
      lockedUntil
    };
    
    this.saveFailures(failures);
    
    return { count: newCount, lockoutMinutes, lockedUntil };
  }

  // 重置用户失败记录
  resetFailures(username) {
    const failures = this.getFailures();
    if (failures[username]) {
      delete failures[username];
      this.saveFailures(failures);
      console.log('用户:', username, '失败记录已重置');
    }
  }
}

// 创建登录锁定管理器实例
const lockoutManager = new LoginLockoutManager();

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  
  const [form, setForm] = useState({
    name: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lockedInfo, setLockedInfo] = useState({ locked: false, remainingTime: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 测试模式：使用固定用户名进行测试
      const testMode = false; // 设置为false以使用用户输入的用户名
      const username = testMode ? 'testuser' : form.name;
      console.log('开始登录处理，用户名:', username);
      console.log('测试模式:', testMode);
      
      // 检查用户是否被锁定
      const lockStatus = lockoutManager.isLocked(username);
      console.log('锁定状态:', lockStatus);
      
      if (lockStatus.locked) {
        toast({ 
          title: "账户已被锁定", 
          description: `请在 ${lockStatus.remainingTime} 分钟后重试`, 
          variant: "destructive" 
        });
        setIsLoading(false);
        return;
      }
      
      // 模拟登录验证
      let user = null;
      
      // 直接验证admin用户
      if (username === 'admin' && form.password === 'admin') {
        user = {
          id: 1,
          name: "admin",
          role: "admin",
          email: "admin",
          status: "owner",
          created_at: "2024-01-01",
          last_login: "2024-03-20",
          password: "admin",
          first_login: false
        };
        console.log('使用硬编码的admin用户');
      } else {
        // 尝试从localStorage获取用户数据
        const encryptedUsers = localStorage.getItem('sopUsers');
        const users = encryptedUsers ? decryptData(encryptedUsers) : [];
        user = users.find(u => u.name === username && u.password === form.password);
        console.log('找到的用户:', user);
      }
      
      if (user) {
        // 登录成功，重置失败次数
        console.log('登录成功，重置失败次数');
        lockoutManager.resetFailures(username);
        
        await login(user);
        toast({ title: "登录成功" });
        navigate("/");
      } else {
        // 登录失败，记录失败次数
        console.log('登录失败，记录失败次数');
        const result = lockoutManager.recordFailure(username);
        console.log('记录失败结果:', result);
        
        // 检查是否需要锁定
        if (result.lockoutMinutes > 0) {
          console.log('用户被锁定，时间:', result.lockoutMinutes);
          toast({ 
            title: "账户已被锁定", 
            description: `请在 ${result.lockoutMinutes} 分钟后重试`, 
            variant: "destructive" 
          });
        } else {
          toast({ title: "用户名或密码错误", variant: "destructive" });
        }
      }
    } catch (error) {
      console.error("登录失败:", error);
      toast({ title: "登录失败", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl">登录</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">用户名</Label>
              <Input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="请输入用户名"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="请输入密码"
                className="mt-1"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
