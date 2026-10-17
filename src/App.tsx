import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { WeaponSection } from './components/WeaponSection';
import { useChecklistStore, loadChecklistData } from './store/checklistStore';
import { loadEntryTranslations, t } from './i18n';
import './index.css';

function App() {
  const [loading, setLoading] = useState(true);
  const {
    currentType,
    currentWeapon,
    guidingLight,
    luringShadow,
    setData
  } = useChecklistStore();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [gl, ls] = await Promise.all([
          loadChecklistData('guiding-light'),
          loadChecklistData('luring-shadow'),
          loadEntryTranslations()
        ]);
        setData('guiding-light', gl);
        setData('luring-shadow', ls);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
      setLoading(false);
    }
    loadData();
  }, [setData]);

  const data = currentType === 'guiding-light' ? guidingLight : luringShadow;
  const weapons = currentWeapon
    ? data?.weapons.filter((w) => w.id === currentWeapon)
    : data?.weapons;

  const title = currentType === 'guiding-light' ? t('guidingLight') : t('luringShadow');

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <header className="main-header">
          <h1>✨ {title}</h1>
          <p className="description">
            {t('trackProgress')}
          </p>
        </header>

        {loading ? (
          <div className="loading">{t('loading')}</div>
        ) : weapons && weapons.length > 0 ? (
          weapons.map((weapon) => (
            <WeaponSection key={weapon.id} weapon={weapon} />
          ))
        ) : (
          <div className="empty-state">
            <p>{t('noData')}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
