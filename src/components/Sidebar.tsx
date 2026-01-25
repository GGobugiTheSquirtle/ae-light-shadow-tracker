import { useChecklistStore } from '../store/checklistStore';
import type { ChecklistType } from '../types';
import './Sidebar.css';

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

export function Sidebar() {
  const {
    currentType,
    setCurrentType,
    currentWeapon,
    setCurrentWeapon,
    guidingLight,
    luringShadow,
    getProgress
  } = useChecklistStore();

  const data = currentType === 'guiding-light' ? guidingLight : luringShadow;
  const overallProgress = getProgress(currentType);

  const handleTypeChange = (type: ChecklistType) => {
    setCurrentType(type);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Another Eden</h1>
        <p className="subtitle">Light & Shadow Tracker</p>
      </div>

      <div className="type-tabs">
        <button
          className={`type-tab ${currentType === 'guiding-light' ? 'active' : ''}`}
          onClick={() => handleTypeChange('guiding-light')}
        >
          ✨ Guiding Light
        </button>
        <button
          className={`type-tab ${currentType === 'luring-shadow' ? 'active' : ''}`}
          onClick={() => handleTypeChange('luring-shadow')}
        >
          🌑 Luring Shadow
        </button>
      </div>

      <div className="overall-progress">
        <div className="progress-label">
          <span>Overall Progress</span>
          <span>{overallProgress.completed} / {overallProgress.total}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${overallProgress.total > 0
                ? (overallProgress.completed / overallProgress.total) * 100
                : 0}%`
            }}
          />
        </div>
      </div>

      <nav className="weapon-nav">
        <button
          className={`weapon-item ${currentWeapon === null ? 'active' : ''}`}
          onClick={() => setCurrentWeapon(null)}
        >
          <span className="weapon-icon">📋</span>
          <span className="weapon-name">All Weapons</span>
        </button>

        {data?.weapons.map((weapon) => {
          const progress = getProgress(currentType, weapon.id);
          const percentage = progress.total > 0
            ? Math.round((progress.completed / progress.total) * 100)
            : 0;

          return (
            <button
              key={weapon.id}
              className={`weapon-item ${currentWeapon === weapon.id ? 'active' : ''}`}
              onClick={() => setCurrentWeapon(weapon.id)}
            >
              <span className="weapon-icon">{WEAPON_ICONS[weapon.weapon] || '⚔️'}</span>
              <span className="weapon-name">{weapon.weapon}</span>
              <span className="weapon-progress">{percentage}%</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
