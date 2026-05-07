import { useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { stageFromBirthDate, getAgeInMonths, STAGE_LABELS, STAGE_ORDER } from '../lib/stageUtils';
import { matchAndFilterRecipes } from '../lib/matcher';
import { StageBadge } from '../components/common/StageBadge';
import { RecipeThumb } from '../components/common/RecipeThumb';
import type { Stage, Ingredient, IngredientCategory, Recipe } from '../types';
import recipesData from '../data/recipes.json';
import ingredientsData from '../data/ingredients.json';

const CATEGORIES: { id: IngredientCategory; label: string }[] = [
  { id: 'grain',     label: '곡류' },
  { id: 'vegetable', label: '채소' },
  { id: 'fruit',     label: '과일' },
  { id: 'protein',   label: '단백질' },
  { id: 'dairy',     label: '유제품' },
  { id: 'seasoning', label: '조미료' },
  { id: 'other',     label: '기타' },
];

const recipes = recipesData as Recipe[];
const ingredients = ingredientsData as Ingredient[];

interface Props {
  onGoToRecipes: () => void;
  onGoToPantry: () => void;
  onSelectRecipe: (id: string) => void;
}

export function HomeView({ onGoToRecipes, onGoToPantry, onSelectRecipe }: Props) {
  const { babyBirthDate, stageOverride, pantry, allergies, setBirthDate, setStageOverride, togglePantry } = useUserStore();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState<IngredientCategory | 'all'>('all');

  const pantrySet = new Set(pantry);
  const pickerFiltered = ingredients.filter(i => {
    const matchCat = pickerCategory === 'all' || i.category === pickerCategory;
    const matchSearch = !pickerSearch || i.nameKo.includes(pickerSearch);
    return matchCat && matchSearch;
  });

  const ageMonths = babyBirthDate ? getAgeInMonths(babyBirthDate) : null;
  const autoStage = babyBirthDate ? stageFromBirthDate(babyBirthDate) : null;
  const currentStage: Stage = stageOverride ?? autoStage ?? 'early';

  const topRecipes = babyBirthDate
    ? matchAndFilterRecipes(recipes, ingredients, { pantry, allergies, currentStage, showPreviousStages: false })
        .filter(r => r.matchCategory === 'perfect' || r.matchCategory === 'partial')
        .slice(0, 3)
    : [];

  return (
    <div className="p-4 space-y-5">
      <div className="text-center pt-4">
        <div className="text-3xl mb-1">🍚</div>
        <h1 className="text-xl font-bold text-gray-900">이유식 레시피</h1>
        <p className="text-sm text-gray-500">아기 맞춤 레시피 추천</p>
      </div>

      {/* 아기 정보 카드 */}
      <div className="bg-green-50 rounded-2xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-800">아기 정보</h2>

        <div>
          <label className="text-sm text-gray-600 block mb-1">생년월일</label>
          <input
            type="date"
            value={babyBirthDate ?? ''}
            onChange={e => setBirthDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {babyBirthDate && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">현재 {ageMonths}개월</span>
            <span className="text-sm text-gray-400">·</span>
            <span className="text-sm text-gray-600">자동 단계:</span>
            <StageBadge stage={autoStage!} />
          </div>
        )}

        <div>
          <label className="text-sm text-gray-600 block mb-1">단계 수동 설정 (선택)</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStageOverride(undefined)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                !stageOverride ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              자동
            </button>
            {STAGE_ORDER.map(s => (
              <button
                key={s}
                onClick={() => setStageOverride(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  stageOverride === s ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                {STAGE_LABELS[s].split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 현재 이유식 단계 */}
      {babyBirthDate && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <StageBadge stage={currentStage} />
            <span className="font-semibold text-gray-800">{STAGE_LABELS[currentStage]}</span>
          </div>
          <p className="text-sm text-gray-500">
            {currentStage === 'early' && '10배죽 미음으로 시작. 1~2가지 재료씩 천천히 도입합니다.'}
            {currentStage === 'middle' && '7배죽 죽. 단백질(소고기, 닭, 생선)을 추가하는 단계입니다.'}
            {currentStage === 'late' && '3배죽 무른밥. 다양한 재료 조합과 핑거푸드를 시작합니다.'}
            {currentStage === 'finishing' && '진밥. 씹는 연습과 스스로 먹는 연습이 중요합니다.'}
          </p>
        </div>
      )}

      {/* 재료 빠른 선택 */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => setShowPicker(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">재료 선택</span>
            <span className="text-xs text-gray-400">{pantry.length}개 보유</span>
          </div>
          <span className="text-gray-400 text-sm">{showPicker ? '▲' : '▼'}</span>
        </button>

        {showPicker && (
          <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
            <input
              type="search"
              placeholder="재료 검색..."
              value={pickerSearch}
              onChange={e => setPickerSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setPickerCategory('all')}
                className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  pickerCategory === 'all' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                전체
              </button>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setPickerCategory(c.id)}
                  className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    pickerCategory === c.id ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto">
              {pickerFiltered.map(item => {
                const owned = pantrySet.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => togglePantry(item.id)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-left text-xs transition-all ${
                      owned
                        ? 'bg-green-50 border-green-300 text-green-800'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      owned ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}>
                      {owned && <span className="text-white text-[8px] leading-none">✓</span>}
                    </div>
                    <span className="truncate">{item.nameKo}</span>
                  </button>
                );
              })}
            </div>

            {pickerFiltered.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-3">검색 결과가 없습니다.</p>
            )}

            <button
              onClick={onGoToPantry}
              className="w-full text-xs text-green-600 text-center pt-1"
            >
              전체 재료 관리 →
            </button>
          </div>
        )}
      </div>

      {/* 오늘의 추천 */}
      {babyBirthDate && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-800">오늘의 추천</h2>
            <button onClick={onGoToRecipes} className="text-sm text-green-600">전체 보기</button>
          </div>

          {pantry.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500 mb-2">재료를 먼저 등록하면 맞춤 추천이 됩니다.</p>
              <button
                onClick={onGoToPantry}
                className="text-sm text-green-600 font-medium"
              >
                재료 등록하기 →
              </button>
            </div>
          ) : topRecipes.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">현재 단계에 맞는 레시피가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topRecipes.map(r => (
                <button
                  key={r.recipe.id}
                  onClick={() => onSelectRecipe(r.recipe.id)}
                  className="w-full bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 shadow-sm text-left hover:bg-green-50 transition-colors"
                >
                  <RecipeThumb recipe={r.recipe} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{r.recipe.nameKo}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <StageBadge stage={r.recipe.stage} />
                      <span className="text-xs text-gray-400">{r.recipe.prepTimeMin}분</span>
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded-full ${
                    r.matchCategory === 'perfect' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {r.matchCategory === 'perfect' ? '✓ 완벽' : `${Math.round(r.matchRatio*100)}%`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!babyBirthDate && (
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-gray-600">생년월일을 입력하면 아기 개월수에 맞는 레시피를 추천해드립니다.</p>
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-gray-400">⚠ 이 앱의 레시피는 의료 조언이 아닙니다. 알레르기 반응 시 소아과 상담을 권장합니다.</p>
      </div>
    </div>
  );
}
