# SOP Manager

SOP Manager 是一个专业的标准操作程序管理系统，用于创建、存储、管理和检索企业的SOP文档。
<img width="2188" height="997" alt="image" src="https://github.com/user-attachments/assets/3a2ed8e4-05f7-4442-9b79-816c3736d33c" />

## 功能特性

- **用户认证**：支持用户登录和权限管理
- **文档管理**：创建、编辑、删除和查看SOP文档
- **富文本编辑**：支持图片、格式化文本等富文本内容
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
- **富文本编辑器**：React Quill
- **后端**：Express.js
- **数据存储**：LocalStorage (本地开发) / 可扩展为数据库

## 技术架构

### 系统架构

```
┌─────────────────────┐
│    前端应用         │
│  (React + Vite)     │
└───────────┬─────────┘
            │
┌───────────▼─────────┐
│    后端服务         │
│  (Express.js)       │
└───────────┬─────────┘
            │
┌───────────▼─────────┐
│    数据存储         │
│  (LocalStorage)     │
└─────────────────────┘
```

### 核心模块

1. **用户认证模块**：处理用户登录、登出和权限管理
2. **文档管理模块**：处理文档的创建、编辑、删除和查看
3. **分类管理模块**：处理文档分类的管理
4. **标签管理模块**：处理文档标签的管理
5. **版本控制模块**：记录文档的版本历史
6. **反馈管理模块**：收集和处理用户对文档的反馈

### 技术特点

- **响应式设计**：适配不同设备的屏幕尺寸
- **模块化架构**：便于扩展和维护
- **前后端分离**：前端和后端独立开发和部署
- **本地存储**：使用LocalStorage进行本地开发和测试
- **可扩展性**：可轻松扩展为使用数据库存储

### 部署架构

使用Docker Compose进行一键部署，包含后端服务：

- **后端服务**：运行在端口3000，使用Express.js提供API和静态文件服务

## 快速开始

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/JerryAction/SOP_Library.git
   cd SOP_Library
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问应用**
   打开浏览器访问 http://localhost:3000

### Docker 部署

使用 Docker Compose 进行一键启动，开箱即用：

```bash
# Start on Linux 
docker compose -f docker-compose-linux.yaml up
```

当日志输出 "SOP Library后端服务已准备好！" 时，启动完成！

## 项目结构

```
SOP_Library/
├── src/
│   ├── api/            # API 客户端
│   ├── components/     # 通用组件
│   ├── context/        # 上下文管理
│   ├── pages/          # 页面组件
│   ├── App.jsx         # 应用主组件
│   ├── main.jsx        # 应用入口
│   └── index.css       # 全局样式
├── dist/               # 构建产物
├── docker-compose-linux.yaml  # Docker Compose 配置
├── Dockerfile.frontend        # 前端 Dockerfile
├── Dockerfile.backend         # 后端 Dockerfile
├── package.json        # 项目配置
├── server.js           # 后端服务器
├── vite.config.js      # Vite 配置
└── README.md           # 项目文档
```

## 开发指南

### 添加新页面

1. 在 `src/pages` 目录下创建新的页面组件
2. 在 `src/App.jsx` 中添加路由配置

### 添加新组件

1. 在 `src/components` 目录下创建新的组件
2. 在需要使用的页面中导入并使用

### 添加新 API

1. 在 `src/api/base44Client.js` 中添加新的 API 方法
2. 在需要使用的组件中导入并调用

## 默认登录凭证

- **管理员账号**：admin / admin
- **普通用户**：李四 / lisi

## 许可证

本项目使用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件
