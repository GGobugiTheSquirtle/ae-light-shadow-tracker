import { useState } from 'react';
import type { ChecklistSource } from '../types';
import { CheckItem } from './CheckItem';
import { useChecklistStore } from '../store/checklistStore';
import './SourceSection.css';

interface SourceSectionProps {
  source: ChecklistSource;
  weaponId: string;
}

export function SourceSection({ source, weaponId }: SourceSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { currentType, isChecked } = useChecklistStore();

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
        <span className="source-name">{source.name}</span>
        <span className="source-progress">
          {completed}/{total}
          <span className="source-percentage">({percentage}%)</span>
        </span>
      </button>

      {!collapsed && (
        <div className="source-entries">
          {source.entries.map((entry) => (
            <CheckItem
              key={entry.id}
              entry={entry}
              weaponId={weaponId}
              sourceId={source.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
