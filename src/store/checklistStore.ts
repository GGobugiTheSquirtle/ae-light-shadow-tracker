import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChecklistData, ChecklistType } from '../types';
import { parseMarkdown } from '../utils/parseMarkdown';

interface CheckedState {
  [key: string]: boolean; // "type:weaponId:sourceId:entryId" -> checked
}

interface ChecklistStore {
  // 데이터
  guidingLight: ChecklistData | null;
  luringShadow: ChecklistData | null;

  // 체크 상태
  checked: CheckedState;

  // 현재 선택된 타입
  currentType: ChecklistType;

  // 현재 선택된 무기
  currentWeapon: string | null;

  // 액션
  setData: (type: ChecklistType, data: ChecklistData) => void;
  toggleCheck: (type: ChecklistType, weaponId: string, sourceId: string, entryId: string) => void;
  isChecked: (type: ChecklistType, weaponId: string, sourceId: string, entryId: string) => boolean;
  setCurrentType: (type: ChecklistType) => void;
  setCurrentWeapon: (weaponId: string | null) => void;
  getProgress: (type: ChecklistType, weaponId?: string) => { completed: number; total: number };
  resetAll: (type: ChecklistType) => void;
}

const getCheckKey = (type: ChecklistType, weaponId: string, sourceId: string, entryId: string) =>
  `${type}:${weaponId}:${sourceId}:${entryId}`;

export const useChecklistStore = create<ChecklistStore>()(
  persist(
    (set, get) => ({
      guidingLight: null,
      luringShadow: null,
      checked: {},
      currentType: 'guiding-light',
      currentWeapon: null,

      setData: (type, data) => {
        if (type === 'guiding-light') {
          set({ guidingLight: data });
        } else {
          set({ luringShadow: data });
        }
      },

      toggleCheck: (type, weaponId, sourceId, entryId) => {
        const key = getCheckKey(type, weaponId, sourceId, entryId);
        set((state) => ({
          checked: {
            ...state.checked,
            [key]: !state.checked[key]
          }
        }));
      },

      isChecked: (type, weaponId, sourceId, entryId) => {
        const key = getCheckKey(type, weaponId, sourceId, entryId);
        return get().checked[key] || false;
      },

      setCurrentType: (type) => set({ currentType: type, currentWeapon: null }),

      setCurrentWeapon: (weaponId) => set({ currentWeapon: weaponId }),

      getProgress: (type, weaponId) => {
        const state = get();
        const data = type === 'guiding-light' ? state.guidingLight : state.luringShadow;

        if (!data) return { completed: 0, total: 0 };

        let completed = 0;
        let total = 0;

        const weapons = weaponId
          ? data.weapons.filter((w) => w.id === weaponId)
          : data.weapons;

        for (const weapon of weapons) {
          for (const source of weapon.sources) {
            for (const entry of source.entries) {
              total += entry.quantity;
              if (state.isChecked(type, weapon.id, source.id, entry.id)) {
                completed += entry.quantity;
              }
            }
          }
        }

        return { completed, total };
      },

      resetAll: (type) => {
        set((state) => {
          const newChecked = { ...state.checked };
          Object.keys(newChecked).forEach((key) => {
            if (key.startsWith(type)) {
              delete newChecked[key];
            }
          });
          return { checked: newChecked };
        });
      }
    }),
    {
      name: 'another-eden-checklist',
      partialize: (state) => ({ checked: state.checked })
    }
  )
);

// 데이터 로드 함수
export async function loadChecklistData(type: ChecklistType): Promise<ChecklistData> {
  const fileName = type === 'guiding-light' ? 'guiding-light.md' : 'luring-shadow.md';
  const response = await fetch(`${import.meta.env.BASE_URL}data/${fileName}`);
  const markdown = await response.text();
  return parseMarkdown(markdown);
}
