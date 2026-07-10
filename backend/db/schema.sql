-- 커피 주문 앱 데이터베이스 스키마

-- 기존 테이블 정리 (개발/재초기화 편의를 위해)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menus CASCADE;

-- 커피 메뉴
CREATE TABLE menus (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT DEFAULT '',
  price       INTEGER NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url   TEXT DEFAULT '',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 주문
CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  status      VARCHAR(20) NOT NULL DEFAULT '대기중'
                CHECK (status IN ('대기중', '제조중', '완료', '취소')),
  total_price INTEGER NOT NULL DEFAULT 0 CHECK (total_price >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 주문 항목 (주문 1건에 여러 메뉴)
CREATE TABLE order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id    INTEGER REFERENCES menus(id) ON DELETE SET NULL,
  menu_name  VARCHAR(100) NOT NULL,          -- 주문 시점 메뉴명 보존
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  quantity   INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_orders_status ON orders(status);
