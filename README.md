# ☕ 커피 주문 앱

사용자가 커피를 주문하고 관리자가 주문·재고를 관리하는 풀스택 웹 앱입니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프런트엔드 | React, Vite, React Router, CSS |
| 백엔드 | Node.js, Express |
| 데이터베이스 | PostgreSQL |

## 프로젝트 구조

```
coffee-order-app/
├── PRD.md
├── backend/                  # Express + PostgreSQL API 서버
│   ├── db/
│   │   ├── schema.sql        # 테이블 정의
│   │   └── seed.sql          # 샘플 메뉴 데이터
│   └── src/
│       ├── index.js          # 서버 진입점
│       ├── db.js             # DB 커넥션 풀
│       ├── routes/           # menus, orders API
│       └── scripts/initDb.js # DB 초기화 스크립트
└── frontend/                 # React (Vite) 클라이언트
    └── src/
        ├── api.js            # 백엔드 호출 헬퍼
        ├── App.jsx           # 라우팅
        └── pages/            # 주문 화면 / 관리자 화면
```

## 사전 준비

- Node.js 18+ (권장: 20/22/24)
- PostgreSQL 13+ (실행 중이어야 함)

## 백엔드 실행

```bash
cd backend
npm install

# 환경변수 설정 (본인 DB 계정에 맞게 수정)
cp .env.example .env

# PostgreSQL에 DB 생성 (최초 1회)
#   psql -U postgres -c "CREATE DATABASE coffee_order;"

# 테이블 생성 + 샘플 데이터 삽입
npm run db:init

# 서버 실행 (http://localhost:4000)
npm run dev
```

## 프런트엔드 실행

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

`/api` 요청은 Vite 프록시를 통해 백엔드(4000)로 전달됩니다.

## API 요약

### 메뉴 `/api/menus`
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/menus` | 전체 메뉴 조회 |
| GET | `/api/menus/:id` | 단일 메뉴 조회 |
| POST | `/api/menus` | 메뉴 생성 |
| PUT | `/api/menus/:id` | 메뉴 수정 (재고 포함) |
| DELETE | `/api/menus/:id` | 메뉴 삭제 |

### 주문 `/api/orders`
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/orders` | 전체 주문 조회 |
| GET | `/api/orders/:id` | 단일 주문 조회 |
| POST | `/api/orders` | 주문 생성 (재고 자동 차감) |
| PATCH | `/api/orders/:id/status` | 주문 상태 변경 |
| DELETE | `/api/orders/:id` | 주문 삭제 |

주문 상태: `대기중` → `제조중` → `완료` (`취소` 가능)

## 화면

- **주문하기** (`/order`): 메뉴 목록에서 담기 → 장바구니에서 수량 조정 → 주문
- **관리자** (`/admin`): 메뉴/재고 CRUD, 주문 상태 변경 및 삭제
