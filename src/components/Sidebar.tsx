import { useChecklistStore } from '../store/checklistStore';
import { translateWeapon, t } from '../i18n';
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
        <h1>{t('title')}</h1>
        <p className="subtitle">{t('subtitle')}</p>
      </div>

      <div className="type-tabs">
        <button
          className={`type-tab ${currentType === 'guiding-light' ? 'active' : ''}`}
          onClick={() => handleTypeChange('guiding-light')}
        >
          ✨ {t('guidingLight')}
        </button>
        <button
          className={`type-tab ${currentType === 'luring-shadow' ? 'active' : ''}`}
          onClick={() => handleTypeChange('luring-shadow')}
        >
          🌑 {t('luringShadow')}
        </button>
      </div>

      <div className="overall-progress">
        <div className="progress-label">
          <span>{t('overallProgress')}</span>
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
          <span className="weapon-name">{t('allWeapons')}</span>
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
              <span className="weapon-name">{translateWeapon(weapon.weapon)}</span>
              <span className="weapon-progress">{percentage}%</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
