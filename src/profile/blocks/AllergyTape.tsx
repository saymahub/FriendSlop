import { labelledAnswers } from '@/lib/answerDisplay';
import type { BlockProps } from '../blockTypes';

const NOTHING_TO_DECLARE = 'None';

/**
 * Stays visible to everyone, guests included. It is safety information and there
 * is no version of this site where hiding it helps.
 */
export function AllergyTape({ profile }: BlockProps) {
  const allergies = labelledAnswers(profile.answers, 'allergies').filter(
    (entry) => entry !== NOTHING_TO_DECLARE,
  );

  if (allergies.length === 0) {
    return null;
  }

  return (
    <div className="border-y-2 border-allergy/40 bg-allergy/15 px-4 py-2 text-center">
      <p className="text-sm font-bold text-allergy">Allergies and dietary needs</p>
      <p className="text-sm text-ink">{allergies.join(' · ')}</p>
    </div>
  );
}
