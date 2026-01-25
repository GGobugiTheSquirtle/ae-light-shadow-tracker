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
      const match = entryText.match(/^(.+?):\s*([^,]+),\s*(\d+)$/);

      if (match) {
        const label = match[1].trim();
        const iconRaw = match[2].trim();
        const icon = iconRaw === 'None' ? null : iconRaw;
        const quantity = parseInt(match[3], 10);

        currentSource.entries.push({
          id: generateId(`${currentSource.name}-${label}-${currentSource.entries.length}`),
          label,
          icon,
          quantity
        });
      } else {
        // 파싱 실패시 전체를 라벨로
        currentSource.entries.push({
          id: generateId(`${currentSource.name}-${entryText}-${currentSource.entries.length}`),
          label: entryText,
          icon: null,
          quantity: 1
        });
      }
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
