export * from './glossary';

export type Language = 'ko' | 'en';

// 현재 언어 설정 (localStorage에서 관리)
export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'ko';
  return (localStorage.getItem('language') as Language) || 'ko';
}

export function setLanguage(lang: Language): void {
  localStorage.setItem('language', lang);
  window.dispatchEvent(new Event('languagechange'));
}

// UI 텍스트
export const uiText: Record<Language, Record<string, string>> = {
  ko: {
    title: 'Another Eden',
    subtitle: '명/천 트래커',
    guidingLight: '천계의 인도',
    luringShadow: '명계의 부름',
    allWeapons: '전체 무기',
    overallProgress: '전체 진행도',
    loading: '데이터 로딩 중...',
    noData: '데이터가 없습니다',
    trackProgress: '무기 명/천 수집 현황을 추적하세요',
  },
  en: {
    title: 'Another Eden',
    subtitle: 'Light & Shadow Tracker',
    guidingLight: 'Guiding Light',
    luringShadow: 'Luring Shadow',
    allWeapons: 'All Weapons',
    overallProgress: 'Overall Progress',
    loading: 'Loading data...',
    noData: 'No data available',
    trackProgress: 'Track your weapon light/shadow collection progress',
  },
};

export function t(key: string, lang?: Language): string {
  const currentLang = lang || getLanguage();
  return uiText[currentLang][key] || key;
}
