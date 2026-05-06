import type {
  Recipe,
  Ingredient,
  AllergyRecord,
  RecipeMatchResult,
  MatchCategory,
  Stage,
} from '../types';
import { isStageAccessible } from './stageUtils';

export interface MatchOptions {
  pantry: string[];
  allergies: Record<string, AllergyRecord>;
  currentStage: Stage;
  showPreviousStages?: boolean;
}

export function matchRecipe(
  recipe: Recipe,
  ingredients: Ingredient[],
  options: MatchOptions
): RecipeMatchResult {
  const { pantry, allergies } = options;

  const pantrySet = new Set(pantry);

  const required = recipe.ingredients
    .filter((ri) => !ri.optional)
    .map((ri) => ri.ingredientId);

  const ownedRequired = required.filter((id) => pantrySet.has(id));
  const missingRequired = required.filter((id) => !pantrySet.has(id));
  const matchRatio = required.length === 0 ? 1 : ownedRequired.length / required.length;

  const reactedAllergens = recipe.allergenIngredientIds.filter(
    (id) => allergies[id]?.status === 'reacted'
  );
  const untestedAllergens = recipe.allergenIngredientIds.filter(
    (id) => !allergies[id] || allergies[id].status === 'untested'
  );

  const missingNames = missingRequired.map(
    (id) => ingredients.find((i) => i.id === id)?.nameKo ?? id
  );

  let matchCategory: MatchCategory;
  if (reactedAllergens.length > 0) {
    matchCategory = 'blocked';
  } else if (matchRatio === 1) {
    matchCategory = 'perfect';
  } else if (matchRatio >= 0.5) {
    matchCategory = 'partial';
  } else {
    matchCategory = 'lacking';
  }

  return {
    recipe,
    matchCategory,
    matchRatio,
    missingIngredients: missingNames,
    reactedAllergens,
    untestedAllergens,
  };
}

export function matchAndFilterRecipes(
  recipes: Recipe[],
  ingredients: Ingredient[],
  options: MatchOptions
): RecipeMatchResult[] {
  const { currentStage, showPreviousStages = true } = options;

  const filtered = recipes.filter((r) =>
    showPreviousStages
      ? isStageAccessible(r.stage, currentStage)
      : r.stage === currentStage
  );

  return filtered
    .map((r) => matchRecipe(r, ingredients, options))
    .sort((a, b) => {
      const order: Record<MatchCategory, number> = {
        perfect: 0,
        partial: 1,
        lacking: 2,
        blocked: 3,
      };
      return order[a.matchCategory] - order[b.matchCategory] || b.matchRatio - a.matchRatio;
    });
}
