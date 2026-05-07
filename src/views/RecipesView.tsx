import { useEffect, useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { matchAndFilterRecipes } from '../lib/matcher';
import { stageFromBirthDate, STAGE_ORDER, STAGE_SHORT } from '../lib/stageUtils';
import { StageBadge } from '../components/common/StageBadge';
import { RecipeThumb } from '../components/common/RecipeThumb';
import type { Recipe, Ingredient, MatchCategory, Stage } from '../types';
import recipesData from '../data/recipes.json';
import ingredientsData from '../data/ingredients.json';

const recipes = recipesData as Recipe[];
const ingredients = ingredientsData as Ingredient[];

const MATCH_LABELS: Record<MatchCategory, string> = {
  perfect: '완벽',
  partial: '부분',
  lacking: '재료부족',
  blocked: '알레르기경고',
};
const MATCH_COLORS: Record<MatchCategory, string> = {
  perfect: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  lacking: 'bg-gray-100 text-gray-600',
  blocked: 'bg-red-100 text-red-700',
};

interface Props {
  initialRecipeId?: string | null;
  onClearSelected?: () => void;
}

export function RecipesView({ initialRecipeId, onClearSelected }: Props) {
  const { babyBirthDate, stageOverride, pantry, allergies, favorites, toggleFavorite, addHistory } = useUserStore();
  const autoStage = babyBirthDate ? stageFromBirthDate(babyBirthDate) : 'early';
  const currentStage: Stage = stageOverride ?? autoStage;

  const [showPrev, setShowPrev] = useState(false);
  const [filterMatch, setFilterMatch] = useState<MatchCategory | 'all'>('all');
  const [filterStage, setFilterStage] = useState<Stage | 'current'>('current');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(initialRecipeId ?? null);

  useEffect(() => {
    if (initialRecipeId) {
      setSelectedId(initialRecipeId);
      onClearSelected?.();
    }
  }, [initialRecipeId]);

  const effectiveStage = filterStage === 'current' ? currentStage : filterStage;
  const showPrevStages = filterStage === 'current' ? showPrev : true;

  const results = matchAndFilterRecipes(recipes, ingredients, {
    pantry,
    allergies,
    currentStage: effectiveStage,
    showPreviousStages: showPrevStages,
  }).filter(r => {
    if (filterMatch !== 'all' && r.matchCategory !== filterMatch) return false;
    if (filterStage !== 'current' && r.recipe.stage !== filterStage) return false;
    if (search && !r.recipe.nameKo.includes(search)) return false;
    return true;
  });

  const selectedResult = selectedId ? results.find(r => r.recipe.id === selectedId) : null;

  if (selectedResult) {
    const { recipe, missingIngredients, reactedAllergens, untestedAllergens } = selectedResult;
    const isFav = favorites.some(f => f.recipeId === recipe.id);
    const ingMap = Object.fromEntries(ingredients.map(i => [i.id, i]));

    return (
      <div className="p-4 space-y-4">
        <button
          onClick={() => setSelectedId(null)}
          className="flex items-center gap-1 text-green-600 text-sm"
        >
          ← 목록으로
        </button>

        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-gray-900">{recipe.nameKo}</h1>
            <button
              onClick={() => toggleFavorite(recipe.id)}
              className="text-2xl flex-shrink-0"
            >
              {isFav ? '⭐' : '☆'}
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StageBadge stage={recipe.stage} />
            <span className="text-xs text-gray-500">{recipe.subType}</span>
            <span className="text-xs text-gray-400">⏱ {recipe.prepTimeMin}분</span>
            {recipe.ricePortionRatio && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{recipe.ricePortionRatio}</span>
            )}
          </div>
        </div>

        {/* 알레르기 경고 */}
        {reactedAllergens.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-700 font-medium">⚠️ 알레르기 반응 기록된 재료 포함</p>
            <p className="text-xs text-red-600 mt-1">
              {reactedAllergens.map(id => ingMap[id]?.nameKo ?? id).join(', ')}
            </p>
          </div>
        )}
        {untestedAllergens.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="text-sm text-yellow-700 font-medium">⚡ 처음 시도하는 알레르겐 재료</p>
            <p className="text-xs text-yellow-600 mt-1">
              {untestedAllergens.map(id => ingMap[id]?.nameKo ?? id).join(', ')}
            </p>
          </div>
        )}
        {missingIngredients.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p className="text-sm text-gray-600 font-medium">📦 부족한 재료</p>
            <p className="text-xs text-gray-500 mt-1">{missingIngredients.join(', ')}</p>
          </div>
        )}

        {/* 재료 */}
        <div>
          <h2 className="font-semibold text-gray-800 mb-2">재료</h2>
          <div className="space-y-1.5">
            {recipe.ingredients.map(ri => {
              const ing = ingMap[ri.ingredientId];
              const owned = pantry.includes(ri.ingredientId);
              return (
                <div key={ri.ingredientId} className={`flex items-center justify-between text-sm px-3 py-2 rounded-lg ${
                  owned ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <span className={owned ? 'text-gray-800' : 'text-gray-400 line-through'}>
                    {ing?.nameKo ?? ri.ingredientId}
                    {ri.optional && <span className="text-gray-400 ml-1">(선택)</span>}
                  </span>
                  <span className="text-gray-500">{ri.amount}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 조리법 */}
        <div>
          <h2 className="font-semibold text-gray-800 mb-2">조리법</h2>
          <div className="space-y-2">
            {recipe.steps.map(step => (
              <div key={step.order} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  {step.order}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{step.instructionKo}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 팁 */}
        {recipe.tipsKo && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-sm text-blue-700">💡 {recipe.tipsKo}</p>
          </div>
        )}

        {recipe.sourceKo && (
          <p className="text-xs text-gray-400">출처: {recipe.sourceKo}</p>
        )}

        <button
          onClick={() => {
            addHistory({ recipeId: recipe.id, rating: 3 });
            alert('조리 완료로 기록했습니다!');
          }}
          className="w-full bg-green-500 text-white rounded-xl py-3 font-semibold text-sm"
        >
          🍳 조리 완료 기록
        </button>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-4 space-y-3">
        <h1 className="text-lg font-bold text-gray-900">레시피</h1>

        <input
          type="search"
          placeholder="레시피 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        {/* 단계 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterStage('current')}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filterStage === 'current' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            현재 단계
          </button>
          {STAGE_ORDER.map(s => (
            <button
              key={s}
              onClick={() => setFilterStage(s)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filterStage === s ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {STAGE_SHORT[s]}
            </button>
          ))}
        </div>

        {/* 매칭 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterMatch('all')}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border ${
              filterMatch === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            전체
          </button>
          {(['perfect','partial','lacking','blocked'] as MatchCategory[]).map(m => (
            <button
              key={m}
              onClick={() => setFilterMatch(m)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border ${
                filterMatch === m ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {MATCH_LABELS[m]}
            </button>
          ))}
        </div>

        {filterStage === 'current' && (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showPrev}
              onChange={e => setShowPrev(e.target.checked)}
              className="accent-green-500"
            />
            이전 단계 레시피도 보기
          </label>
        )}
      </div>

      <div className="px-4 pt-3">
        <p className="text-sm text-gray-500 mb-3">{results.length}개</p>
        <div className="space-y-2">
          {results.map(r => (
            <button
              key={r.recipe.id}
              onClick={() => setSelectedId(r.recipe.id)}
              className="w-full bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 shadow-sm text-left hover:bg-green-50 transition-colors"
            >
              <RecipeThumb recipe={r.recipe} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{r.recipe.nameKo}</div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <StageBadge stage={r.recipe.stage} />
                  <span className="text-xs text-gray-400">{r.recipe.prepTimeMin}분</span>
                  {r.missingIngredients.length > 0 && (
                    <span className="text-xs text-gray-400 truncate max-w-[120px]">
                      필요: {r.missingIngredients.slice(0,2).join(', ')}{r.missingIngredients.length > 2 ? '...' : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${MATCH_COLORS[r.matchCategory]}`}>
                {r.matchCategory === 'perfect' ? '✓ 완벽'
                  : r.matchCategory === 'blocked' ? '⚠ 경고'
                  : `${Math.round(r.matchRatio * 100)}%`}
              </div>
            </button>
          ))}
          {results.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              조건에 맞는 레시피가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
