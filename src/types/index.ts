export type Stage = 'early' | 'middle' | 'late' | 'finishing';
// early: 4-6m, middle: 7-8m, late: 9-11m, finishing: 12-15m

export type AllergyStatus = 'untested' | 'safe' | 'reacted';

export type IngredientCategory =
  | 'grain'
  | 'vegetable'
  | 'fruit'
  | 'protein'
  | 'dairy'
  | 'seasoning'
  | 'other';

export type RecipeSubType =
  | '미음'
  | '죽'
  | '무른밥'
  | '진밥'
  | '핑거푸드'
  | '반찬';

export type MatchCategory = 'perfect' | 'partial' | 'lacking' | 'blocked';

export interface Ingredient {
  id: string;
  nameKo: string;
  category: IngredientCategory;
  isCommonAllergen: boolean;
  introducedFromStage: Stage;
}

export interface RecipeIngredient {
  ingredientId: string;
  amount: string;
  optional?: boolean;
}

export interface RecipeStep {
  order: number;
  instructionKo: string;
}

export interface Recipe {
  id: string;
  nameKo: string;
  stage: Stage;
  subType: RecipeSubType;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  prepTimeMin: number;
  servings: string;
  ricePortionRatio?: string;
  allergenIngredientIds: string[];
  tipsKo?: string;
  sourceKo?: string;
}

export interface AllergyRecord {
  ingredientId: string;
  status: AllergyStatus;
  testedAt?: string;
  notes?: string;
}

export interface FavoriteRecord {
  recipeId: string;
  addedAt: string;
}

export interface HistoryRecord {
  recipeId: string;
  cookedAt: string;
  rating?: 1 | 2 | 3;
}

export interface UserState {
  babyBirthDate?: string;
  stageOverride?: Stage;
  pantry: string[];
  allergies: Record<string, AllergyRecord>;
  favorites: FavoriteRecord[];
  history: HistoryRecord[];
}

export interface RecipeMatchResult {
  recipe: Recipe;
  matchCategory: MatchCategory;
  matchRatio: number;
  missingIngredients: string[];
  reactedAllergens: string[];
  untestedAllergens: string[];
}
