-- 초기 커피 메뉴 샘플 데이터

INSERT INTO menus (name, description, price, stock, image_url, is_available) VALUES
  ('아메리카노',   '진한 에스프레소에 물을 더한 기본 커피', 3000, 100,
    'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=500&q=80', TRUE),
  ('카페라떼',     '에스프레소에 스팀 밀크를 더한 부드러운 커피', 3500, 80,
    'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=500&q=80', TRUE),
  ('카푸치노',     '풍성한 우유 거품이 올라간 커피', 3500, 60,
    'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80', TRUE),
  ('바닐라라떼',   '바닐라 시럽을 더한 달콤한 라떼', 4000, 50,
    'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500&q=80', TRUE),
  ('카라멜마키아또', '카라멜의 달콤함이 가득한 커피', 4500, 40,
    'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&q=80', TRUE),
  ('에스프레소',   '진하게 추출한 커피의 원액', 2500, 30,
    'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=500&q=80', TRUE),
  ('콜드브루',     '차갑게 장시간 추출한 부드러운 커피', 4000, 20,
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=80', TRUE);
