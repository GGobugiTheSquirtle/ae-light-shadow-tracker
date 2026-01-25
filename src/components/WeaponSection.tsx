import { useState } from 'react';
import type { WeaponChecklist } from '../types';
import { SourceSection } from './SourceSection';
import { useChecklistStore } from '../store/checklistStore';
import { translateWeapon } from '../i18n';
import './WeaponSection.css';

const WEAPON_ICONS: Record<string, string> = {
  Ax: '🪓',
  Bow: '🏹',
  Fists: '👊',
  Hammer: '🔨',
  Katana: '⚔️',
  Lance: '🔱',
  Staff: '🪄',
  Sword: '🗡️'
};

interface WeaponSectionProps {
  weapon: WeaponChecklist;
}

export function WeaponSection({ weapon }: WeaponSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { currentType, getProgress } = useChecklistStore();

  const progress = getProgress(currentType, weapon.id);
  const percentage = progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;
  const isComplete = progress.completed === progress.total && progress.total > 0;

  return (
    <section className={`weapon-section ${isComplete ? 'complete' : ''}`} id={weapon.id}>
      <button
        className="weapon-header"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className={`chevron ${collapsed ? '' : 'expanded'}`}>▶</span>
        <span className="weapon-icon-large">{WEAPON_ICONS[weapon.weapon] || '⚔️'}</span>
        <h2 className="weapon-title">{translateWeapon(weapon.weapon)}</h2>
        <div className="weapon-progress-info">
          <span className="weapon-count">{progress.completed}/{progress.total}</span>
          <div className="weapon-progress-bar">
            <div
              className="weapon-progress-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="weapon-percentage">{percentage}%</span>
        </div>
      </button>

      {!collapsed && (
        <div className="weapon-content">
          {weapon.sources.map((source) => (
            <SourceSection
              key={source.id}
              source={source}
              weaponId={weapon.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
