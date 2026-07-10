// DB 초기화 스크립트: schema.sql 실행 후 seed.sql 로 샘플 데이터 삽입
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, '..', '..', 'db');

async function run() {
  const schema = fs.readFileSync(path.join(dbDir, 'schema.sql'), 'utf-8');
  const seed = fs.readFileSync(path.join(dbDir, 'seed.sql'), 'utf-8');

  try {
    console.log('스키마 생성 중...');
    await pool.query(schema);
    console.log('샘플 데이터 삽입 중...');
    await pool.query(seed);
    console.log('✅ DB 초기화 완료');
  } catch (err) {
    console.error('❌ DB 초기화 실패:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
