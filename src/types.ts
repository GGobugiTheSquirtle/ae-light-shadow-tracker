export interface ChecklistEntry {
  id: string;
  label: string;
  icon: string | null;
  quantity: number;
  bossName?: string; // 보스명 (성영의 서가 항목 그룹화용)
}

export interface ChecklistSource {
  id: string;
  name: string;
  count: number;
  entries: ChecklistEntry[];
}

export interface WeaponChecklist {
  id: string;
  weapon: string;
  total: number;
  sources: ChecklistSource[];
}

export interface ChecklistData {
  title: string;
  weapons: WeaponChecklist[];
}

export type ChecklistType = 'guiding-light' | 'luring-shadow';
