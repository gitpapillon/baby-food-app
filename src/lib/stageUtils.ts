import type { Stage } from '../types';

export function getAgeInMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  return Math.max(0, months);
}

export function stageFromMonths(months: number): Stage {
  if (months < 7) return 'early';
  if (months < 9) return 'middle';
  if (months < 12) return 'late';
  return 'finishing';
}

export function stageFromBirthDate(birthDate: string): Stage {
  return stageFromMonths(getAgeInMonths(birthDate));
}

export const STAGE_LABELS: Record<Stage, string> = {
  early: '초기 (4-6개월)',
  middle: '중기 (7-8개월)',
  late: '후기 (9-11개월)',
  finishing: '완료기 (12-15개월)',
};

export const STAGE_SHORT: Record<Stage, string> = {
  early: '초기',
  middle: '중기',
  late: '후기',
  finishing: '완료기',
};

export const STAGE_ORDER: Stage[] = ['early', 'middle', 'late', 'finishing'];

export function isStageAccessible(recipeStage: Stage, currentStage: Stage): boolean {
  return STAGE_ORDER.indexOf(recipeStage) <= STAGE_ORDER.indexOf(currentStage);
}
