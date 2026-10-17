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

  // "Defeat the [보스명] and Clear all Pledges" 패턴 (예: Travelers' Curse, Enduring Echo Feinne)
  const genericMatch = label.match(/Defeat the\s+(.+?)\s+and Clear all Pledges/i);
  if (genericMatch && genericMatch[1]) {
    return genericMatch[1].trim();
  }

  return null;
}

export function parseMarkdown(markdown: string): ChecklistData {
  const lines = markdown.split('\n');
  const weapons: WeaponChecklist[] = [];

  let title = '';
  let currentWeapon: WeaponChecklist | null = null;
  let currentSource: ChecklistSource | null = null;

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
        currentSource = {
          id: generateId(match[1]),
          name: match[1],
          count: parseInt(match[2], 10),
          entries: []
        };
      } else {
        // 개수 없는 소스
        const name = line.slice(2).trim();
        currentSource = {
          id: generateId(name),
          name: name,
          count: 0,
          entries: []
        };
      }
      continue;
    }

    // - Entry: icon, quantity
    if (line.startsWith('  - ') && currentSource) {
      const entryText = line.slice(4).trim();

      // "Label: icon.png, N" 형식 파싱
      // 라벨 안에도 콜론이 있을 수 있으므로 (예: "Diving: Map to ...") 마지막 콜론에서 자름
      const match = entryText.match(/^(.+):\s*([^,:]+),\s*(\d+)$/);

      let label: string;
      let icon: string | null;
      let quantity: number;

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

      // 보스명 추출 ("Defeat the Seal Monster [보스명]" 패턴)
      const bossName = extractBossName(label);

      // 저장된 체크 상태 유지: 기존 id 는 첫 콜론까지 자른 라벨로 만들어졌으므로 id 만 그 방식 그대로
      const legacyLabel = entryText.match(/^(.+?):\s*([^,]+),\s*(\d+)$/)?.[1].trim() ?? entryText;

      const entry = {
        id: generateId(`${currentSource.name}-${legacyLabel}-${currentSource.entries.length}`),
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

  return { title, weapons };
}
