import { useChecklistStore } from '../store/checklistStore';
import type { ChecklistEntry } from '../types';
import './CheckItem.css';

interface CheckItemProps {
  entry: ChecklistEntry;
  weaponId: string;
  sourceId: string;
}

export function CheckItem({ entry, weaponId, sourceId }: CheckItemProps) {
  const { currentType, toggleCheck, isChecked } = useChecklistStore();
  const checked = isChecked(currentType, weaponId, sourceId, entry.id);

  const handleToggle = () => {
    toggleCheck(currentType, weaponId, sourceId, entry.id);
  };

  const iconPath = entry.icon ? `/icons/${entry.icon}` : null;

  return (
    <label className={`check-item ${checked ? 'checked' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleToggle}
      />
      <span className="checkbox-custom" />

      {iconPath && (
        <img
          src={iconPath}
          alt=""
          className="item-icon"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      <span className="item-label">{entry.label}</span>

      {entry.quantity > 1 && (
        <span className="item-quantity">×{entry.quantity}</span>
      )}
    </label>
  );
}
