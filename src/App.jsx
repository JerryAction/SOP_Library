import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import DocumentList from './pages/DocumentList';
import DocumentDetail from './pages/DocumentDetail';
import DocumentEditor from './pages/DocumentEditor';
import SearchPage from './pages/SearchPage';
import Categories from './pages/Categories';
import FeedbackManagement from './pages/FeedbackManagement';
import Users from './pages/Users';
import Logs from './pages/Logs';
import Tags from './pages/Tags';
import Login from './pages/Login';
import SOPDocument from './pages/admin/SOPDocument';
import SOPCategory from './pages/admin/SOPCategory';
import SOPFeedback from './pages/admin/SOPFeedback';
import Security from './pages/admin/Security';


// PrivateRoute 组件，用于保护需要认证的路由
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// AdminRoute 组件，用于保护需要管理员权限的路由
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, isLoadingAuth } = useAuth();
  
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
  }

  // Render the main app
  return (
    <Routes>
        {/* 登录路由 */}
        <Route path="/login" element={<Login />} />
        
        {/* 根路径重定向到登录页 */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* 受保护的路由 */}
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<DocumentList />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route path="/search" element={<SearchPage />} />
          
          {/* 需要管理员权限的路由 */}
          <Route path="/documents/new" element={<AdminRoute><DocumentEditor /></AdminRoute>} />
          <Route path="/documents/:id/edit" element={<AdminRoute><DocumentEditor /></AdminRoute>} />
          <Route path="/categories" element={<AdminRoute><Categories /></AdminRoute>} />
          <Route path="/feedback" element={<AdminRoute><FeedbackManagement /></AdminRoute>} />
          <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
          <Route path="/logs" element={<AdminRoute><Logs /></AdminRoute>} />
          <Route path="/tags" element={<AdminRoute><Tags /></AdminRoute>} />
        </Route>
        
        {/* 管理员后台路由 */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin/data/sopdocument" element={<SOPDocument />} />
          <Route path="/admin/data/sopcategory" element={<SOPCategory />} />
          <Route path="/admin/data/sopfeedback" element={<SOPFeedback />} />
          <Route path="/admin/security" element={<Security />} />
        </Route>
        
        <Route path="*" element={<PageNotFound />} />
      </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App