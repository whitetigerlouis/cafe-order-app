// 서버 시작 시 스키마 존재 여부를 확인하고, 없으면 schema.sql + seed.sql 을 1회 실행한다.
// (테이블이 이미 있으면 아무것도 하지 않으므로 재시작 시 데이터가 보존된다.)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, '..', 'db');

export async function ensureSchema() {
  const { rows } = await pool.query("SELECT to_regclass('public.menus') AS t");
  if (rows[0].t) {
    console.log('ℹ️  기존 테이블 확인됨 — 스키마 초기화 건너뜀');
    return;
  }

  console.log('🆕 테이블이 없어 초기 스키마/시드를 생성합니다...');
  const schema = fs.readFileSync(path.join(dbDir, 'schema.sql'), 'utf-8');
  const seed = fs.readFileSync(path.join(dbDir, 'seed.sql'), 'utf-8');
  await pool.query(schema);
  await pool.query(seed);
  console.log('✅ 초기 스키마/시드 생성 완료');
}
