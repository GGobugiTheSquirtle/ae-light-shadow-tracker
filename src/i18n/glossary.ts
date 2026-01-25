/**
 * 영한 용어집 (Glossary)
 * 게임 내 고유명사 및 용어 번역
 */

// 무기 타입
export const weaponTypes: Record<string, string> = {
  'Ax': '도끼',
  'Bow': '활',
  'Fists': '권갑',
  'Hammer': '망치',
  'Katana': '도',
  'Lance': '창',
  'Staff': '지팡이',
  'Sword': '검',
};

// 아이템 타입
export const itemTypes: Record<string, string> = {
  'Guiding Light': '천계의 인도',
  'Luring Shadow': '명계의 부름',
};

// 획득처/콘텐츠
export const sources: Record<string, string> = {
  // 메인 콘텐츠
  'Badge Trading': '배지 교환',
  'Awards/Other': '훈장/기타',
  'Another Dungeon': '어나더 던전',
  'Astral Archive': '성영의 서가',
  'Phantom Crystal Dimension': '환리경',
  'Cradle of Time': '시간의 요람',
  'Toto Theater World': '토토 시어터 월드',

  // 메인 스토리
  'Main Story': '메인 스토리',
  'Into the Hollow': '허시의 층',
  'Chronos Empire Strikes Back': '시간의 제국',
  'Where Light Does Not Fall': '낙일의 폐허와 광휘의 수호자',

  // 외전/에피소드
  'The 1000 Year Ark of the Ocean Palace': '천년의 상자, 해신의 신전',
  'The Time Mine and the Dreamers': '시간의 탄광과 꿈꾸는 마을',
  'Foreign Skies and the Ship to Freedom': '이국의 하늘과 자유를 향한 방주',
  'The Lost Tome and the Silver Unfading Flower': '잃어버린 경전과 시들지 않는 은꽃',
  'IDA School Part 3: Fruit of Guidance and the Lost Digital Child': 'IDA 스쿨 3: 인도의 열매와 잃어버린 전자 소녀',
  'Song of Sword and Wings of Lost Paradise': '검의 노래와 실락의 날개',
  'Shadow of Sin and Steel': '만고의 죄와 불복의 칼날',
  'Wanderer in the Vortex': '방황하는 소녀와 영겁의 소용돌이',
  'Commander and Sheep': '장성의 도끼와 갑주의 양',
  'The Mists of Myth - Wryz Saga': '벌룡 공주 기담',

  // 협주 (Symphony)
  'Complex Dream': 'Complex Dream (크로노 크로스)',
  'Bound Wills and the Hollow Puppeteer': '두 영혼의 인연과 공허의 괴뢰사',
  'Octolight Conductors: The Prisoner\'s Odyssey': '땅끝의 포로와 인도의 팔중주',

  // 외사 (Apocrypha)
  'Astral Ruins': '성영의 폐허',
  'Edax Turialba': '식시영역 투리알바',
};

// 일반 용어
export const terms: Record<string, string> = {
  // 수집/획득
  'Collect': '수집',
  'Gather': '수집',
  'Obtain': '획득',
  'Chest': '상자',
  'Reward': '보상',

  // 난이도
  'Hard': 'Hard',
  'Very Hard': 'Very Hard',
  'VH': 'VH',
  'Expert': 'Expert',
  'Master': 'Master',

  // 전투/퀘스트
  'Defeat': '처치',
  'Clear': '클리어',
  'Pledge': '맹세',
  'Seal Monster': '봉인된 몬스터',

  // 아이템/재화
  'Atlantis Pearls': '용궁 진주',
  'Black Pearl': '칠흑 진주',
  'Seeker Points': '씨커 포인트',
  'Chaos Fragment': '혼돈의 조각',
  'Arboreal Tear': '수목의 눈물',
  'Lazuline Stone': '유리석',
  'Levin Fragment': '뇌정의 조각',
  'Dawn Fragment': '새벽녘의 조각',
  'Dusk Fragment': '황혼의 조각',
  'Paw Stamps': '발바닥 도장',
  'Grow Star': '그로우 스타',
  'Tome': '서',
  'Key Item': '귀중품',
  'Illusory Medal': '환상 메달',
  'Machina Wyrm Heart': '기룡의 심장',
  'Metallic Maiden\'s Bone': '강철소녀의 뼈',

  // 기타
  'Repair Level': '복원 레벨',
  'Friend Rank': '친구 랭크',
  'Chapter': '챕터',
  'Volume': '편',
  'Mine': '탄광',
  'Diving': '잠수',
  'Deep Dive': '심해',
  'Hidden Path': '숨겨진 길',
  'Underground Path': '지하 통로',
  'Ward': '구역',
  'Zone': 'ZONE',
};

// 지역/장소
export const locations: Record<string, string> = {
  'Nilva': '닐바',
  'Elzion': '엘지온',
  'Ocean Palace': '용궁',
  'Dierkuul Island': '디에르쿨 섬',
  'Factory Tower': '기계탑',
  'Dimensional Fortress Chronos': '차원 전함 크로노스',
  'Thundering Fortress': '뇌명의 요새',
  'Lost Sector': '로스트 섹터',
  'Treasure Hunter Association': '트레저 헌터 협회',
};

// NPC/보스
export const characters: Record<string, string> = {
  'Papa Macminal': '맥미널 영감',
  'Gail Carrigo': '게일 카리고',
  'Laika': '라이카',
};

/**
 * 전체 용어집 (모든 카테고리 통합)
 */
export const fullGlossary: Record<string, string> = {
  ...weaponTypes,
  ...itemTypes,
  ...sources,
  ...terms,
  ...locations,
  ...characters,
};

/**
 * 텍스트에서 용어를 번역
 */
export function translateText(text: string): string {
  let result = text;

  // 긴 문자열부터 먼저 매칭 (부분 매칭 방지)
  const sortedKeys = Object.keys(fullGlossary).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, fullGlossary[key]);
  }

  return result;
}

/**
 * 소스(획득처) 이름 번역
 */
export function translateSource(name: string): string {
  return sources[name] || name;
}

/**
 * 무기 타입 번역
 */
export function translateWeapon(weapon: string): string {
  return weaponTypes[weapon] || weapon;
}
