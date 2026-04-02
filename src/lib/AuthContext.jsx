import { createContext, useContext, useState, useEffect } from 'react';
import { sopManager } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setIsLoadingAuth(true);
      setAuthError(null);
      
      // 模拟应用状态检查
      // 在实际应用中，这里会检查应用的公共设置
      // 但在我们的模拟实现中，我们直接设置应用状态为已加载
      
      // 模拟应用公共设置
      const publicSettings = {
        id: appParams.appId,
        public_settings: {
          app_name: 'SOP Library',
          auth_required: true
        }
      };
      setAppPublicSettings(publicSettings);
      
      // 检查用户认证状态
      await checkUserAuth();
      
      setIsLoadingPublicSettings(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      // Now check if the user is authenticated
      setIsLoadingAuth(true);
      const currentUser = await sopManager.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setUser(null);
      
      // If user auth fails, it might be an expired token
      setAuthError({
        type: 'auth_required',
        message: 'Authentication required'
      });
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      sopManager.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      sopManager.auth.logout();
    }
  };

  const navigateToLogin = () => {
    // Use the SDK's redirectToLogin method
    sopManager.auth.redirectToLogin(window.location.href);
  };

  const login = async (userData) => {
    try {
      // 保存用户信息到 localStorage
      localStorage.setItem('sopUser', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      // 检查是否有保存的重定向URL
      const redirectUrl = localStorage.getItem('redirectUrl');
      if (redirectUrl) {
        // 清除保存的重定向URL
        localStorage.removeItem('redirectUrl');
        // 跳转到保存的URL
        window.location.href = redirectUrl;
      } else {
        // 登录成功后重定向到仪表盘页面
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      login,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
