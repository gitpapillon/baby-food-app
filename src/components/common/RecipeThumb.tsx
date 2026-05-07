import { useState } from 'react';
import type { Recipe } from '../../types';

function emojiFor(subType: Recipe['subType']): string {
  switch (subType) {
    case '미음': return '🥣';
    case '죽': return '🍚';
    case '핑거푸드': return '🖐️';
    case '반찬': return '🥗';
    default: return '🍱';
  }
}

export function RecipeThumb({ recipe }: { recipe: Recipe }) {
  const [failed, setFailed] = useState(false);
  if (recipe.imageUrl && !failed) {
    return (
      <img
        src={recipe.imageUrl}
        alt={recipe.nameKo}
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100"
      />
    );
  }
  return <div className="text-2xl flex-shrink-0">{emojiFor(recipe.subType)}</div>;
}
