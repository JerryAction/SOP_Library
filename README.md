# SOP Manager

## 项目简介

SOP Manager 是一个专业的标准操作程序（Standard Operating Procedure）管理系统，用于创建、存储、管理和检索企业的SOP文档。该系统提供了直观的用户界面，支持文档分类、标签管理、版本控制和反馈收集等功能。

## 功能特性

- **用户认证**：支持用户登录和权限管理
- **文档管理**：创建、编辑、删除和查看SOP文档
- **分类系统**：支持文档分类管理
- **标签系统**：支持为文档添加标签，便于搜索和过滤
- **版本控制**：记录文档的版本历史
- **反馈管理**：收集和处理用户对文档的反馈
- **搜索功能**：快速查找文档
- **响应式设计**：适配不同设备的屏幕尺寸

## 技术栈

- **前端**：React 18, Vite, Tailwind CSS
- **状态管理**：React Context API
- **路由**：React Router
- **数据获取**：React Query
- **UI组件**：Radix UI
- **后端**：Express.js
- **数据存储**：LocalStorage (本地开发) / 可扩展为数据库

## 快速开始

### 本地开发

1. **克隆项目**
   ```bash
   git clone <项目Git URL>
   cd SOP_Library
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   创建 `.env.local` 文件，设置以下环境变量：
   ```
   VITE_SOP_APP_ID=your_app_id
   VITE_SOP_APP_BASE_URL=your_backend_url
   
   e.g.
   VITE_SOP_APP_ID=cbef744a8545c389ef439ea6
   VITE_SOP_APP_BASE_URL=http://localhost:5173
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   打开浏览器，访问 http://localhost:5173

### Docker部署

使用Docker Compose进行一键启动：

```bash
# 启动服务
docker compose -f docker-compose-linux.yaml up

# 停止服务
docker compose -f docker-compose-linux.yaml down
```

当后端服务启动时，会输出 "SOP Library后端服务已准备好！"，表示服务启动完成。

## 项目结构

```
SOP_Library/
├── src/
│   ├── api/            # API客户端
│   ├── components/     # 组件
│   │   ├── layout/     # 布局组件
│   │   ├── sop/        # SOP相关组件
│   │   └── ui/         # UI组件
│   ├── lib/            # 工具库
│   ├── pages/          # 页面组件
│   │   └── admin/      # 管理员页面
│   ├── utils/          # 工具函数
│   ├── App.jsx         # 应用主组件
│   ├── index.css       # 全局样式
│   └── main.jsx        # 应用入口
├── entities/           # 实体定义
├── public/             # 静态文件
├── docker-compose-linux.yaml  # Docker Compose配置
├── Dockerfile.frontend        # 前端Dockerfile
├── Dockerfile.backend         # 后端Dockerfile
├── server.js                  # 后端服务入口
├── package.json               # 项目配置
└── vite.config.js             # Vite配置
```

## 开发指南

### 添加新页面

1. 在 `src/pages/` 目录下创建新的页面组件
2. 在 `src/App.jsx` 中添加路由配置

### 添加新组件

1. 在 `src/components/` 目录下创建新的组件
2. 在需要使用的页面中导入并使用

### 添加新API

1. 在 `src/api/base44Client.js` 中添加新的API方法
2. 在需要使用的组件中导入并使用

## 默认登录凭证

- **管理员账号**：admin / admin
- **普通用户**：lisi / lisi

## 许可证

MIT License