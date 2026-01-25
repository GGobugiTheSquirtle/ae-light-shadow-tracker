import { useState } from 'react';
import type { ChecklistEntry } from '../types';
import { CheckItem } from './CheckItem';
import { useChecklistStore } from '../store/checklistStore';
import { translateText } from '../i18n';
import './BossGroup.css';

interface BossGroupProps {
  bossName: string;
  entries: ChecklistEntry[];
  weaponId: string;
  sourceId: string;
}

export function BossGroup({ bossName, entries, weaponId, sourceId }: BossGroupProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { currentType, isChecked } = useChecklistStore();

  // 진행도 계산
  const completed = entries.filter((entry) =>
    isChecked(currentType, weaponId, sourceId, entry.id)
  ).reduce((sum, entry) => sum + entry.quantity, 0);

  const total = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total && total > 0;

  // 클리어 미션과 서약 항목 분리
  const clearMissions = entries.filter(entry => 
    entry.label.includes('Defeat the Seal Monster') || 
    entry.label.includes('Defeat Ω') ||
    entry.label.includes('Trial by Combat')
  );
  const pledges = entries.filter(entry => 
    entry.label.startsWith('Pledge:')
  );
  const otherEntries = entries.filter(entry => 
    !clearMissions.includes(entry) && !pledges.includes(entry)
  );

  return (
    <div className={`boss-group ${isComplete ? 'complete' : ''}`}>
      <button
        className="boss-header"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className={`chevron ${collapsed ? '' : 'expanded'}`}>▶</span>
        <span className="boss-name">{translateText(bossName)}</span>
        <span className="boss-progress">
          {completed}/{total}
          <span className="boss-percentage">({percentage}%)</span>
        </span>
      </button>

      {!collapsed && (
        <div className="boss-entries">
          {/* 클리어 미션 */}
          {clearMissions.length > 0 && (
            <div className="boss-category">
              {clearMissions.map((entry) => (
                <CheckItem
                  key={entry.id}
                  entry={entry}
                  weaponId={weaponId}
                  sourceId={sourceId}
                />
              ))}
            </div>
          )}
          
          {/* 서약 항목 */}
          {pledges.length > 0 && (
            <div className="boss-category pledges">
              <div className="pledges-header">서약 (Pledges)</div>
              {pledges.map((entry) => (
                <CheckItem
                  key={entry.id}
                  entry={entry}
                  weaponId={weaponId}
                  sourceId={sourceId}
                />
              ))}
            </div>
          )}
          
          {/* 기타 항목 */}
          {otherEntries.length > 0 && (
            <div className="boss-category">
              {otherEntries.map((entry) => (
                <CheckItem
                  key={entry.id}
                  entry={entry}
                  weaponId={weaponId}
                  sourceId={sourceId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
