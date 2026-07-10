import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import menusRouter from './routes/menus.js';
import ordersRouter from './routes/orders.js';
import { ensureSchema } from './ensureSchema.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

// 프런트엔드 정적 파일 서빙 (배포 시). frontend 빌드 결과(dist)가 있을 때만 활성화.
const clientDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // API 이외의 경로는 SPA 진입점(index.html)으로 폴백
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log('🖥️  프런트엔드 정적 서빙 활성화:', clientDist);
}

// 404 처리 (주로 알 수 없는 /api 경로)
app.use((req, res) => {
  res.status(404).json({ error: '요청한 경로를 찾을 수 없습니다.' });
});

// 공통 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || '서버 오류가 발생했습니다.' });
});

// 시작 시 스키마 초기화 후 서버 기동
async function start() {
  try {
    await ensureSchema();
  } catch (err) {
    console.error('⚠️  스키마 초기화 실패 (서버는 계속 기동):', err.message);
  }
  app.listen(PORT, () => {
    console.log(`☕ 서버 실행 중: http://localhost:${PORT}`);
  });
}

start();
