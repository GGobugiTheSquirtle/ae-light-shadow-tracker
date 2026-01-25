import { useState, useMemo } from 'react';
import type { ChecklistSource, ChecklistEntry } from '../types';
import { CheckItem } from './CheckItem';
import { BossGroup } from './BossGroup';
import { useChecklistStore } from '../store/checklistStore';
import { translateSource } from '../i18n';
import './SourceSection.css';

interface SourceSectionProps {
  source: ChecklistSource;
  weaponId: string;
}

export function SourceSection({ source, weaponId }: SourceSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { currentType, isChecked } = useChecklistStore();

  // 성영의 서가 (Astral Archive)인지 확인
  const isAstralArchive = source.name === 'Astral Archive';

  // 보스별로 그룹화 (성영의 서가인 경우)
  const bossGroups = useMemo(() => {
    if (!isAstralArchive) return null;

    const groups = new Map<string, ChecklistEntry[]>();
    
    source.entries.forEach(entry => {
      const bossName = entry.bossName;
      if (bossName) {
        if (!groups.has(bossName)) {
          groups.set(bossName, []);
        }
        groups.get(bossName)!.push(entry);
      } else {
        // 보스명이 없는 항목들은 별도 그룹으로
        if (!groups.has('_other')) {
          groups.set('_other', []);
        }
        groups.get('_other')!.push(entry);
      }
    });

    return groups;
  }, [source, isAstralArchive]);

  // 진행도 계산
  const completed = source.entries.filter((entry) =>
    isChecked(currentType, weaponId, source.id, entry.id)
  ).reduce((sum, entry) => sum + entry.quantity, 0);

  const total = source.entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total && total > 0;

  return (
    <div className={`source-section ${isComplete ? 'complete' : ''}`}>
      <button
        className="source-header"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className={`chevron ${collapsed ? '' : 'expanded'}`}>▶</span>
        <span className="source-name">{translateSource(source.name)}</span>
        <span className="source-progress">
          {completed}/{total}
          <span className="source-percentage">({percentage}%)</span>
        </span>
      </button>

      {!collapsed && (
        <div className="source-entries">
          {isAstralArchive && bossGroups ? (
            // 성영의 서가: 보스별 그룹화 표시
            <>
              {Array.from(bossGroups.entries()).map(([bossName, entries]) => {
                if (bossName === '_other') {
                  // 보스명이 없는 항목들
                  return entries.map((entry) => (
                    <CheckItem
                      key={entry.id}
                      entry={entry}
                      weaponId={weaponId}
                      sourceId={source.id}
                    />
                  ));
                }
                return (
                  <BossGroup
                    key={bossName}
                    bossName={bossName}
                    entries={entries}
                    weaponId={weaponId}
                    sourceId={source.id}
                  />
                );
              })}
            </>
          ) : (
            // 일반 소스: 기존 방식
            source.entries.map((entry) => (
              <CheckItem
                key={entry.id}
                entry={entry}
                weaponId={weaponId}
                sourceId={source.id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
