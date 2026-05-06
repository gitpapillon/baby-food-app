import type { Stage } from '../../types';
import { STAGE_SHORT } from '../../lib/stageUtils';

const colors: Record<Stage, string> = {
  early:     'bg-yellow-100 text-yellow-800 border border-yellow-300',
  middle:    'bg-green-100 text-green-800 border border-green-300',
  late:      'bg-blue-100 text-blue-800 border border-blue-300',
  finishing: 'bg-purple-100 text-purple-800 border border-purple-300',
};

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[stage]}`}>
      {STAGE_SHORT[stage]}
    </span>
  );
}
