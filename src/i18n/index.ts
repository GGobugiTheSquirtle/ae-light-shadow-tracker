import { translateText } from './glossary';

export * from './glossary';

export type Language = 'ko' | 'en';

// 항목 라벨 번역 (영문 라벨 → 한국어). public/data/translations.json
let entryTranslations: Record<string, string> = {};

export async function loadEntryTranslations(): Promise<void> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/translations.json`);
    entryTranslations = await response.json();
  } catch (error) {
    // 번역 파일이 없어도 체크리스트는 동작해야 하므로 용어집 치환으로 대체
    console.error('Failed to load translations:', error);
  }
}

export function translateEntry(label: string): string {
  return entryTranslations[label] ?? translateText(label);
}

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
