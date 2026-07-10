import { useEffect, useState } from 'react';
import { DEFAULT_MENU_IMAGE } from './constants.js';

// 메뉴 이미지를 표시하되, 다음 경우 기본 커피 사진으로 대체한다.
// - 이미지 로드 에러(onError)
// - 일정 시간 안에 로드되지 않음(느린/응답없는 외부 이미지, hang 대비)
// 기본 이미지마저 실패하면 ☕ 아이콘을 보여준다.
const LOAD_TIMEOUT_MS = 6000;

export default function MenuImage({ src, alt }) {
  const initial = src || DEFAULT_MENU_IMAGE;
  const [current, setCurrent] = useState(initial);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // src(메뉴)가 바뀌면 상태 초기화
  useEffect(() => {
    setCurrent(src || DEFAULT_MENU_IMAGE);
    setLoaded(false);
    setFailed(false);
  }, [src]);

  // 제한 시간 내 로드되지 않으면 기본 이미지로 교체
  useEffect(() => {
    if (loaded || current === DEFAULT_MENU_IMAGE) return;
    const timer = setTimeout(() => {
      if (!loaded) setCurrent(DEFAULT_MENU_IMAGE);
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [current, loaded]);

  if (failed) {
    return <div className="menu-thumb-fallback">☕</div>;
  }

  return (
    <img
      src={current}
      alt={alt}
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (current !== DEFAULT_MENU_IMAGE) {
          setCurrent(DEFAULT_MENU_IMAGE);
          setLoaded(false);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
