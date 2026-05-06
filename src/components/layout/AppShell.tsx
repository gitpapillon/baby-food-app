import type { ReactNode } from 'react';
import type { Tab } from '../../App';

interface Props {
  tab: Tab;
  onTabChange: (t: Tab) => void;
  children: ReactNode;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home',      label: '홈',       icon: '🏠' },
  { id: 'pantry',    label: '재료',     icon: '🥕' },
  { id: 'recipes',   label: '레시피',   icon: '🍚' },
  { id: 'allergy',   label: '알레르기', icon: '⚠️' },
  { id: 'favorites', label: '즐겨찾기', icon: '⭐' },
];

export function AppShell({ tab, onTabChange, children }: Props) {
  return (
    <div className="flex flex-col min-h-dvh max-w-lg mx-auto bg-white">
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-200 z-10">
        <div className="flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors ${
                tab === t.id
                  ? 'text-green-600 font-semibold'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
