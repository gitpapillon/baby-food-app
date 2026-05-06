import { useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import type { Ingredient, AllergyStatus } from '../types';
import ingredientsData from '../data/ingredients.json';

const ingredients = ingredientsData as Ingredient[];

const STATUS_LABELS: Record<AllergyStatus, string> = {
  untested: '미테스트',
  safe:     '안전',
  reacted:  '반응있음',
};
const STATUS_COLORS: Record<AllergyStatus, string> = {
  untested: 'text-gray-500 bg-gray-100',
  safe:     'text-green-700 bg-green-100',
  reacted:  'text-red-700 bg-red-100',
};

export function AllergyView() {
  const { allergies, setAllergyStatus } = useUserStore();
  const [filterStatus, setFilterStatus] = useState<AllergyStatus | 'all'>('all');

  const allergenIngredients = ingredients.filter(i => i.isCommonAllergen);
  const otherIngredients = ingredients.filter(i => !i.isCommonAllergen);

  const getStatus = (id: string): AllergyStatus => allergies[id]?.status ?? 'untested';

  const cycleStatus = (id: string) => {
    const current = getStatus(id);
    const next: AllergyStatus = current === 'untested' ? 'safe' : current === 'safe' ? 'reacted' : 'untested';
    setAllergyStatus({ ingredientId: id, status: next, testedAt: new Date().toISOString() });
  };

  const allItems = [...allergenIngredients, ...otherIngredients].filter(i =>
    filterStatus === 'all' || getStatus(i.id) === filterStatus
  );

  const counts = {
    all: ingredients.length,
    untested: ingredients.filter(i => getStatus(i.id) === 'untested').length,
    safe: ingredients.filter(i => getStatus(i.id) === 'safe').length,
    reacted: ingredients.filter(i => getStatus(i.id) === 'reacted').length,
  };

  return (
    <div className="pb-4">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-4 space-y-3">
        <h1 className="text-lg font-bold text-gray-900">알레르기 관리</h1>
        <p className="text-xs text-gray-500">재료를 탭하면 상태가 변경됩니다: 미테스트 → 안전 → 반응있음</p>

        <div className="flex gap-2">
          {(['all', 'untested', 'safe', 'reacted'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filterStatus === s ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {s === 'all' ? `전체 (${counts.all})` : `${STATUS_LABELS[s]} (${counts[s]})`}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3">
        {filterStatus === 'all' && (
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-orange-600 mb-2">⚠️ 주요 알레르겐</h2>
            <div className="space-y-1">
              {allergenIngredients.map(ing => (
                <AllergyRow key={ing.id} ing={ing} status={getStatus(ing.id)} onCycle={cycleStatus} allergies={allergies} />
              ))}
            </div>
            <h2 className="text-sm font-semibold text-gray-600 mt-4 mb-2">기타 재료</h2>
          </div>
        )}

        <div className="space-y-1">
          {(filterStatus === 'all' ? otherIngredients : allItems).map(ing => (
            <AllergyRow key={ing.id} ing={ing} status={getStatus(ing.id)} onCycle={cycleStatus} allergies={allergies} />
          ))}
        </div>
      </div>

      <div className="mx-4 mt-4 p-3 bg-blue-50 rounded-xl">
        <p className="text-xs text-blue-700">
          ⚕️ 알레르기 반응(두드러기, 구토, 호흡곤란 등)이 나타나면 즉시 소아과 진료를 받으세요. 이 앱의 기록은 의료 진단을 대체하지 않습니다.
        </p>
      </div>
    </div>
  );
}

function AllergyRow({
  ing, status, onCycle, allergies,
}: {
  ing: Ingredient;
  status: AllergyStatus;
  onCycle: (id: string) => void;
  allergies: Record<string, { status: AllergyStatus; testedAt?: string; notes?: string }>;
}) {
  return (
    <button
      onClick={() => onCycle(ing.id)}
      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white text-left hover:bg-gray-50 transition-colors"
    >
      <div className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium min-w-[64px] text-center ${STATUS_COLORS[status]}`}>
        {STATUS_LABELS[status]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800">{ing.nameKo}</div>
        {allergies[ing.id]?.testedAt && (
          <div className="text-xs text-gray-400">
            {new Date(allergies[ing.id].testedAt!).toLocaleDateString('ko-KR')}
          </div>
        )}
      </div>
      {ing.isCommonAllergen && (
        <span className="text-xs text-orange-500 flex-shrink-0">주요알레르겐</span>
      )}
    </button>
  );
}
