import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserState, AllergyRecord, HistoryRecord, Stage } from '../types';

interface UserActions {
  setBirthDate: (date: string) => void;
  setStageOverride: (stage: Stage | undefined) => void;
  togglePantry: (ingredientId: string) => void;
  setPantry: (ids: string[]) => void;
  setAllergyStatus: (record: AllergyRecord) => void;
  toggleFavorite: (recipeId: string) => void;
  addHistory: (entry: Omit<HistoryRecord, 'cookedAt'> & { cookedAt?: string }) => void;
  isFavorite: (recipeId: string) => boolean;
}

const initialState: UserState = {
  babyBirthDate: undefined,
  stageOverride: undefined,
  pantry: [],
  allergies: {},
  favorites: [],
  history: [],
};

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setBirthDate: (date) => set({ babyBirthDate: date }),
      setStageOverride: (stage) => set({ stageOverride: stage }),

      togglePantry: (id) =>
        set((s) => ({
          pantry: s.pantry.includes(id)
            ? s.pantry.filter((i) => i !== id)
            : [...s.pantry, id],
        })),

      setPantry: (ids) => set({ pantry: ids }),

      setAllergyStatus: (record) =>
        set((s) => ({
          allergies: { ...s.allergies, [record.ingredientId]: record },
        })),

      toggleFavorite: (recipeId) =>
        set((s) => ({
          favorites: s.favorites.some((f) => f.recipeId === recipeId)
            ? s.favorites.filter((f) => f.recipeId !== recipeId)
            : [...s.favorites, { recipeId, addedAt: new Date().toISOString() }],
        })),

      addHistory: (entry) =>
        set((s) => ({
          history: [
            { ...entry, cookedAt: entry.cookedAt ?? new Date().toISOString() } as HistoryRecord,
            ...s.history.slice(0, 99),
          ],
        })),

      isFavorite: (recipeId) => get().favorites.some((f) => f.recipeId === recipeId),
    }),
    {
      name: 'baby-food-app:v1',
    }
  )
);
