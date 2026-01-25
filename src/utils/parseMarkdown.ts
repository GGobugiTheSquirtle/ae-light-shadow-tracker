import type { ChecklistData, WeaponChecklist, ChecklistSource } from '../types';

function generateId(text: string): string {
  // 간단한 해시 생성
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * 보스명 추출 함수
 * "Defeat the Seal Monster [보스명] and Clear all Pledges" 패턴에서 보스명 추출
 */
function extractBossName(label: string): string | null {
  // "Defeat the Seal Monster [보스명] and Clear all Pledges" 패턴
  // VH, Memory 등 접두사 처리
  const match = label.match(/Defeat the Seal Monster(?:s)?\s+(?:VH\s+|Memory\s+)?(.+?)\s+and Clear all Pledges/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // "Defeat Ω [보스명] in Tournament" 패턴
  const omegaMatch = label.match(/Defeat Ω\s+(.+?)\s+in Tournament/i);
  if (omegaMatch && omegaMatch[1]) {
    return omegaMatch[1].trim();
  }
  
  // "Defeat the Memory [보스명] and Clear all Pledges" 패턴
  const memoryMatch = label.match(/Defeat the Memory\s+(.+?)\s+and Clear all Pledges/i);
  if (memoryMatch && memoryMatch[1]) {
    return memoryMatch[1].trim();
  }
  
  return null;
}

/**
 * 소스명에서 보스명 추출
 * "[보스명] (0)" 형식에서 보스명 추출
 */
function extractBossNameFromSource(sourceName: string): string | null {
  const match = sourceName.match(/^(.+?)\s*\(\d+\)$/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

export function parseMarkdown(markdown: string): ChecklistData {
  const lines = markdown.split('\n');
  const weapons: WeaponChecklist[] = [];

  let title = '';
  let currentWeapon: WeaponChecklist | null = null;
  let currentSource: ChecklistSource | null = null;
  
  // 보스별 Pledge 항목들을 추적하기 위한 맵
  // weaponId -> sourceId -> bossName -> entries[]
  const bossPledgeMap = new Map<string, Map<string, Map<string, Array<{ label: string; icon: string | null; quantity: number }>>>>();

  for (const line of lines) {
    // # Title
    if (line.startsWith('# ')) {
      title = line.slice(2).trim();
      continue;
    }

    // ## Weapon = total
    if (line.startsWith('## ')) {
      // 이전 무기 저장
      if (currentWeapon) {
        if (currentSource) {
          currentWeapon.sources.push(currentSource);
          currentSource = null;
        }
        weapons.push(currentWeapon);
      }

      const match = line.match(/## (.+?) \((\w+)\) = (\d+)/);
      if (match) {
        currentWeapon = {
          id: `weapon-${match[2].toLowerCase()}`,
          weapon: match[2],
          total: parseInt(match[3], 10),
          sources: []
        };
      }
      continue;
    }

    // - Source (count)
    if (line.startsWith('- ') && currentWeapon) {
      // 이전 소스 저장
      if (currentSource) {
        currentWeapon.sources.push(currentSource);
      }

      const match = line.match(/- (.+?) \((\d+)\)/);
      if (match) {
        const sourceName = match[1];
        const sourceId = generateId(sourceName);
        currentSource = {
          id: sourceId,
          name: sourceName,
          count: parseInt(match[2], 10),
          entries: []
        };
        
        // 보스명이 있는 소스인지 확인 (예: "Papa Macminal (0)")
        const bossName = extractBossNameFromSource(sourceName);
        if (bossName && currentWeapon) {
          // 보스 Pledge 맵 초기화
          if (!bossPledgeMap.has(currentWeapon.id)) {
            bossPledgeMap.set(currentWeapon.id, new Map());
          }
          const weaponMap = bossPledgeMap.get(currentWeapon.id)!;
          if (!weaponMap.has(sourceId)) {
            weaponMap.set(sourceId, new Map());
          }
        }
      } else {
        // 개수 없는 소스
        const name = line.slice(2).trim();
        const sourceId = generateId(name);
        currentSource = {
          id: sourceId,
          name: name,
          count: 0,
          entries: []
        };
        
        // 보스명이 있는 소스인지 확인
        const bossName = extractBossNameFromSource(name);
        if (bossName && currentWeapon) {
          if (!bossPledgeMap.has(currentWeapon.id)) {
            bossPledgeMap.set(currentWeapon.id, new Map());
          }
          const weaponMap = bossPledgeMap.get(currentWeapon.id)!;
          if (!weaponMap.has(sourceId)) {
            weaponMap.set(sourceId, new Map());
          }
        }
      }
      continue;
    }

    // - Entry: icon, quantity
    if (line.startsWith('  - ') && currentSource) {
      const entryText = line.slice(4).trim();

      // "Label: icon.png, N" 형식 파싱
      const match = entryText.match(/^(.+?):\s*([^,]+),\s*(\d+)$/);

      let label: string;
      let icon: string | null;
      let quantity: number;
      let bossName: string | null = null;

      if (match) {
        label = match[1].trim();
        const iconRaw = match[2].trim();
        icon = iconRaw === 'None' ? null : iconRaw;
        quantity = parseInt(match[3], 10);
      } else {
        // 파싱 실패시 전체를 라벨로
        label = entryText;
        icon = null;
        quantity = 1;
      }

      // 보스명 추출
      // 1. "Defeat the Seal Monster [보스명]" 패턴에서 추출
      bossName = extractBossName(label);
      
      // 2. "Pledge:" 항목이고 현재 소스가 보스명 소스인 경우
      if (!bossName && label.startsWith('Pledge:') && currentSource && currentWeapon) {
        const bossNameFromSource = extractBossNameFromSource(currentSource.name);
        if (bossNameFromSource) {
          bossName = bossNameFromSource;
        }
      }

      const entry = {
        id: generateId(`${currentSource.name}-${label}-${currentSource.entries.length}`),
        label,
        icon,
        quantity,
        ...(bossName ? { bossName } : {})
      };

      currentSource.entries.push(entry);
      continue;
    }
  }

  // 마지막 무기/소스 저장
  if (currentWeapon) {
    if (currentSource) {
      currentWeapon.sources.push(currentSource);
    }
    weapons.push(currentWeapon);
  }

  // 별도 보스 소스의 Pledge 항목들을 Astral Archive 소스로 병합
  for (const weapon of weapons) {
    const astralArchiveSource = weapon.sources.find(s => s.name === 'Astral Archive');
    if (!astralArchiveSource) continue;

    // 보스 소스들 찾기 (예: "Papa Macminal (0)")
    const bossSources = weapon.sources.filter(s => {
      const bossName = extractBossNameFromSource(s.name);
      return bossName !== null && s.name !== 'Astral Archive';
    });

    // 각 보스 소스의 항목들을 Astral Archive의 해당 보스 항목들과 병합
    for (const bossSource of bossSources) {
      const bossName = extractBossNameFromSource(bossSource.name);
      if (!bossName) continue;
      
      // 보스 소스의 Pledge 항목들을 Astral Archive에 추가 (중복 방지)
      for (const pledgeEntry of bossSource.entries) {
        // 이미 같은 라벨이 있는지 확인
        const exists = astralArchiveSource.entries.some(
          e => e.label === pledgeEntry.label && e.bossName === bossName
        );
        
        if (!exists) {
          astralArchiveSource.entries.push({
            ...pledgeEntry,
            bossName: bossName
          });
        }
      }
    }

    // 보스 소스 제거 (이미 Astral Archive에 병합됨)
    weapon.sources = weapon.sources.filter(s => {
      const bossName = extractBossNameFromSource(s.name);
      return bossName === null || s.name === 'Astral Archive';
    });
  }

  return { title, weapons };
}
