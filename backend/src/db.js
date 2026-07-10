import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL 커넥션 풀. 환경변수(PGHOST, PGUSER 등)를 자동으로 읽는다.
const pool = new pg.Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'coffee_order',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
});

pool.on('error', (err) => {
  console.error('예상치 못한 DB 커넥션 오류:', err);
});

export const query = (text, params) => pool.query(text, params);

// 트랜잭션이 필요한 경우 사용
export const getClient = () => pool.connect();

export default pool;
