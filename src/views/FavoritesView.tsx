import { useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { StageBadge } from '../components/common/StageBadge';
import type { Recipe } from '../types';
import recipesData from '../data/recipes.json';

const recipes = recipesData as Recipe[];
const recipeMap = Object.fromEntries(recipes.map(r => [r.id, r]));

interface Props {
  onSelectRecipe: (id: string) => void;
}

type View = 'favorites' | 'history';

export function FavoritesView({ onSelectRecipe }: Props) {
  const { favorites, history, toggleFavorite } = useUserStore();
  const [view, setView] = useState<View>('favorites');

  return (
    <div className="pb-4">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-4 space-y-3">
        <h1 className="text-lg font-bold text-gray-900">즐겨찾기 & 히스토리</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('favorites')}
            className={`flex-1 py-2 text-sm rounded-xl border transition-colors ${
              view === 'favorites' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            ⭐ 즐겨찾기 ({favorites.length})
          </button>
          <button
            onClick={() => setView('history')}
            className={`flex-1 py-2 text-sm rounded-xl border transition-colors ${
              view === 'history' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            📋 히스토리 ({history.length})
          </button>
        </div>
      </div>

      <div className="px-4 pt-3">
        {view === 'favorites' ? (
          favorites.length === 0 ? (
            <EmptyState text="즐겨찾기한 레시피가 없습니다." sub="레시피 상세에서 ☆를 탭하면 추가됩니다." />
          ) : (
            <div className="space-y-2">
              {favorites.map(fav => {
                const recipe = recipeMap[fav.recipeId];
                if (!recipe) return null;
                return (
                  <div key={fav.recipeId} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                    <button
                      onClick={() => onSelectRecipe(recipe.id)}
                      className="flex-1 text-left flex items-center gap-3"
                    >
                      <span className="text-2xl">
                        {recipe.subType === '미음' ? '🥣' : recipe.subType === '죽' ? '🍚' : recipe.subType === '핑거푸드' ? '🖐️' : '🍱'}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{recipe.nameKo}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <StageBadge stage={recipe.stage} />
                          <span className="text-xs text-gray-400">{recipe.prepTimeMin}분</span>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => toggleFavorite(recipe.id)}
                      className="text-yellow-400 text-xl"
                    >
                      ⭐
                    </button>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          history.length === 0 ? (
            <EmptyState text="조리 기록이 없습니다." sub="레시피 상세에서 '조리 완료 기록' 버튼을 누르면 추가됩니다." />
          ) : (
            <div className="space-y-2">
              {history.map((entry, idx) => {
                const recipe = recipeMap[entry.recipeId];
                if (!recipe) return null;
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectRecipe(recipe.id)}
                    className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm text-left hover:bg-green-50 transition-colors"
                  >
                    <span className="text-2xl">
                      {recipe.subType === '미음' ? '🥣' : recipe.subType === '죽' ? '🍚' : recipe.subType === '핑거푸드' ? '🖐️' : '🍱'}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{recipe.nameKo}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(entry.cookedAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                      </div>
                    </div>
                    <StageBadge stage={recipe.stage} />
                  </button>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function EmptyState({ text, sub }: { text: string; sub: string }) {
  return (
    <div className="text-center py-12 space-y-2">
      <p className="text-gray-500 text-sm">{text}</p>
      <p className="text-gray-400 text-xs">{sub}</p>
    </div>
  );
}
