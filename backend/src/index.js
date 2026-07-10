import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import menusRouter from './routes/menus.js';
import ordersRouter from './routes/orders.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/menus', menusRouter);
app.use('/api/orders', ordersRouter);

// 404 처리
app.use((req, res) => {
  res.status(404).json({ error: '요청한 경로를 찾을 수 없습니다.' });
});

// 공통 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || '서버 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`☕ 백엔드 서버 실행 중: http://localhost:${PORT}`);
});
