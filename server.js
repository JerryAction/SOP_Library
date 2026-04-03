import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const port = 3000;

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 提供静态文件
app.use(express.static(path.join(process.cwd(), 'dist')));

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 处理所有其他请求，返回前端应用
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

// 启动服务器
app.listen(port, () => {
  console.log('SOP Library后端服务已准备好！');
  console.log(`服务器运行在 http://localhost:${port}`);
});