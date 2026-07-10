# 🚀 Render 배포 가이드 (올인원)

이 앱은 **백엔드(Express)가 프런트엔드 빌드(dist)까지 함께 서빙**하도록 구성되어,
Render에서 **웹서비스 1개 + PostgreSQL 1개**만으로 배포됩니다.

## 사전 준비
- 코드가 GitHub 저장소(`whitetigerlouis/cafe-order-app`)에 push 되어 있어야 합니다.
- [Render](https://render.com) 회원가입 (GitHub 계정으로 로그인 권장)

## 배포 방법 A — Blueprint 자동 배포 (권장)

저장소 루트의 [`render.yaml`](render.yaml)이 웹서비스와 DB를 자동 정의합니다.

1. Render 대시보드 → **New +** → **Blueprint**
2. GitHub 계정 연결 후 `cafe-order-app` 저장소 선택
3. `render.yaml`이 인식되면 **Apply** → 웹서비스 + PostgreSQL이 함께 생성됨
4. 첫 배포 완료까지 몇 분 대기 (빌드: 프런트 빌드 → 백엔드 기동)
5. 생성된 웹서비스 URL(`https://coffee-order-app-xxxx.onrender.com`) 접속

> DB는 서버가 처음 켜질 때 테이블이 없으면 자동으로 스키마 + 샘플 메뉴를 생성합니다
> (`ensureSchema`). 별도 초기화 작업이 필요 없습니다.

## 배포 방법 B — 수동 설정

Blueprint 없이 직접 만들 경우:

### 1) PostgreSQL 생성
- New + → **PostgreSQL** → 이름 지정 → Free 플랜 → Create
- 생성 후 **Internal Database URL** 복사

### 2) 웹서비스 생성
- New + → **Web Service** → `cafe-order-app` 저장소 선택
- 설정:
  | 항목 | 값 |
  |------|-----|
  | Runtime | Node |
  | Build Command | `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend` |
  | Start Command | `node backend/src/index.js` |
- **Environment** 탭에서 환경변수 추가:
  | Key | Value |
  |-----|-------|
  | `DATABASE_URL` | (위에서 복사한 Internal Database URL) |
  | `NODE_ENV` | `production` |
- Create Web Service → 배포 완료 후 URL 접속

## 주의 사항 (무료 플랜)
- 웹서비스는 **15분간 요청이 없으면 잠들며**, 다음 첫 요청이 느립니다(콜드스타트, 약 30~50초).
- 무료 PostgreSQL은 **보관 기간 제한**이 있어(계정/시점에 따라 다름) 만료 시 데이터가 사라질 수 있습니다.
  학습용으로는 충분하며, 오래 유지하려면 유료 플랜 또는 Neon 등 외부 무료 DB로 전환하세요.

## 로컬 개발과의 차이
| | 로컬 | Render |
|--|------|--------|
| DB 연결 | 개별 `PG*` 변수 (`.env`) | `DATABASE_URL` + SSL |
| 프런트 | Vite dev 서버(5173) + 프록시 | 백엔드가 `dist` 직접 서빙 |
| 포트 | 4000/5173 분리 | Render 지정 `PORT` 단일 |

코드는 환경변수(`DATABASE_URL` 유무)로 두 경우를 자동 분기하므로, 로컬 개발 방식은 그대로 유지됩니다.
