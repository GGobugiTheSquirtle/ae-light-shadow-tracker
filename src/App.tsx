import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { WeaponSection } from './components/WeaponSection';
import { useChecklistStore, loadChecklistData } from './store/checklistStore';
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
          loadChecklistData('luring-shadow')
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

  const title = currentType === 'guiding-light' ? 'Guiding Light' : 'Luring Shadow';

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <header className="main-header">
          <h1>✨ {title}</h1>
          <p className="description">
            Track your weapon light/shadow collection progress
          </p>
        </header>

        {loading ? (
          <div className="loading">Loading checklist data...</div>
        ) : weapons && weapons.length > 0 ? (
          weapons.map((weapon) => (
            <WeaponSection key={weapon.id} weapon={weapon} />
          ))
        ) : (
          <div className="empty-state">
            <p>No data available</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
