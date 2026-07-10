// 저작권 없는(CC0 / 퍼블릭도메인) 이미지를 Openverse에서 검색해
// 메뉴명에 가장 적합한 이미지를 자동으로 찾아 반환한다.
// Openverse: 위키미디어재단이 운영하는 오픈 라이선스 이미지 검색 (API 키 불필요)

// 검색 실패 시 사용할 기본 커피 이미지 (동작 확인된 URL)
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=500&q=80';

// 특정 검색어가 결과 없을 때 쓰는 일반 커피 검색어 (CC0 결과 풍부)
const GENERIC_QUERY = 'coffee cup';

// 원본 이미지가 초고해상도(수 MB)라 브라우저 로딩이 느린 소스는 제외
const SLOW_SOURCES = new Set(['wikimedia']);

// 한국어 커피 메뉴명 → 영어 검색 키워드 (CC0 검색 결과가 잘 나오는 형태)
const KEYWORD_MAP = {
  아메리카노: 'americano coffee',
  카페라떼: 'cafe latte coffee',
  라떼: 'cafe latte coffee',
  카푸치노: 'cappuccino coffee',
  바닐라라떼: 'vanilla latte coffee',
  카라멜마키아또: 'caramel macchiato coffee',
  마키아또: 'macchiato coffee',
  에스프레소: 'espresso coffee',
  콜드브루: 'cold brew coffee',
  카페모카: 'mocha coffee',
  모카: 'mocha coffee',
  플랫화이트: 'flat white coffee',
  아포가토: 'affogato coffee',
};

function toQuery(name) {
  const trimmed = (name || '').trim();
  if (KEYWORD_MAP[trimmed]) return KEYWORD_MAP[trimmed];
  for (const [ko, en] of Object.entries(KEYWORD_MAP)) {
    if (trimmed.includes(ko)) return en;
  }
  return `${trimmed} coffee`;
}

// CC0/퍼블릭도메인 이미지의 "직접 소스 URL" 목록을 검색
// (느린 원본 소스 제외, 프록시 썸네일 대신 원본 CDN URL 사용 → 브라우저에서 빠르게 로드)
async function searchCandidates(query, size = 8) {
  const url =
    'https://api.openverse.org/v1/images/?q=' +
    encodeURIComponent(query) +
    `&license=cc0,pdm&page_size=${size}&mature=false`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'coffee-order-app/1.0 (learning project)' },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Openverse 응답 ${res.status}`);
  const data = await res.json();
  return (data.results || [])
    .filter((h) => h.url && !SLOW_SOURCES.has(h.source))
    .map((h) => h.url);
}

export async function findFreeImage(name) {
  const primary = toQuery(name);
  const queries = primary === GENERIC_QUERY ? [primary] : [primary, GENERIC_QUERY];
  try {
    for (const q of queries) {
      let candidates = [];
      try {
        candidates = await searchCandidates(q);
      } catch (e) {
        console.warn(`🖼️  검색 실패("${q}"): ${e.message}`);
        continue;
      }
      if (candidates.length) {
        console.log(`🖼️  '${name}'("${q}") 자동 이미지 적용: ${candidates[0]}`);
        return candidates[0];
      }
      console.log(`🖼️  '${name}'("${q}") 결과 없음`);
    }
    console.log(`🖼️  '${name}' 최종 실패 — 기본 이미지 사용`);
    return FALLBACK_IMAGE;
  } catch (err) {
    console.warn(`🖼️  이미지 자동검색 오류('${name}'): ${err.message} — 기본 이미지 사용`);
    return FALLBACK_IMAGE;
  }
}
