import { useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import type { Ingredient, IngredientCategory } from '../types';
import ingredientsData from '../data/ingredients.json';

const ingredients = ingredientsData as Ingredient[];

const CATEGORIES: { id: IngredientCategory; label: string; icon: string }[] = [
  { id: 'grain',     label: '곡류',     icon: '🌾' },
  { id: 'vegetable', label: '채소',     icon: '🥦' },
  { id: 'fruit',     label: '과일',     icon: '🍎' },
  { id: 'protein',   label: '단백질',   icon: '🥩' },
  { id: 'dairy',     label: '유제품',   icon: '🥛' },
  { id: 'seasoning', label: '조미료',   icon: '🫒' },
  { id: 'other',     label: '기타',     icon: '📦' },
];

export function PantryView() {
  const { pantry, togglePantry, setPantry } = useUserStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<IngredientCategory | 'all'>('all');

  const pantrySet = new Set(pantry);

  const filtered = ingredients.filter(i => {
    const matchCat = activeCategory === 'all' || i.category === activeCategory;
    const matchSearch = !search || i.nameKo.includes(search);
    return matchCat && matchSearch;
  });

  const handleSelectAll = () => {
    const filteredIds = filtered.map(i => i.id);
    const allSelected = filteredIds.every(id => pantrySet.has(id));
    if (allSelected) {
      setPantry(pantry.filter(id => !filteredIds.includes(id)));
    } else {
      const newSet = new Set([...pantry, ...filteredIds]);
      setPantry(Array.from(newSet));
    }
  };

  return (
    <div className="pb-4">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">재료 관리</h1>
          <span className="text-sm text-gray-500">{pantry.length}개 보유</span>
        </div>

        <input
          type="search"
          placeholder="재료 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeCategory === 'all' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            전체
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === c.id ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={handleSelectAll}
            className="text-sm text-green-600"
          >
            {filtered.every(i => pantrySet.has(i.id)) ? '전체 해제' : '전체 선택'}
          </button>
          {pantry.length > 0 && (
            <>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => setPantry([])}
                className="text-sm text-red-400"
              >
                전체 취소
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {filtered.map(item => {
            const owned = pantrySet.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => togglePantry(item.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                  owned
                    ? 'bg-green-50 border-green-300 text-green-800'
                    : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  owned ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {owned && <span className="text-white text-xs">✓</span>}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{item.nameKo}</div>
                  {item.isCommonAllergen && (
                    <div className="text-xs text-orange-500">알레르겐</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
