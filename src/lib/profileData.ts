import { fetchAnswers, fetchPerson, type PersonDoc } from '@/data/people';
import { textAnswer } from '@/lib/answerDisplay';
import { isComplete } from '@/lib/progress';
import type { Answers } from '@/state/useAnswers';
import type { Viewer } from '@/state/ViewerContext';

export type Profile = {
  readonly person: PersonDoc;
  readonly answers: Answers;
  /** They have saved at least one answer, so there is a page worth drawing. */
  readonly hasAnswers: boolean;
  /** Every required question is answered. Drives the stamp, not the vault. */
  readonly complete: boolean;
  /** Whether they have handed the page in. */
  readonly submitted: boolean;
};

/**
 * Reads a profile from Firestore.
 *
 * The private half comes back empty for anyone the rules will not serve it to,
 * which is the gate working rather than a failure to report.
 */
export async function loadProfile(personId: string): Promise<Profile | undefined> {
  const person = await fetchPerson(personId);

  if (!person) {
    return undefined;
  }

  const answers = await fetchAnswers(personId);

  return {
    person,
    answers,
    hasAnswers: Object.keys(answers).length > 0,
    complete: isComplete(answers),
    submitted: person.submittedAt !== null,
  };
}

/**
 * What to call someone and which emoji to show: their own answers when they have
 * given them, otherwise whatever the roster was seeded with.
 */
export function identityOf(person: PersonDoc): { name: string; emoji: string } {
  return {
    name: textAnswer(person.answers, 'displayName') || person.name,
    emoji: textAnswer(person.answers, 'favouriteEmoji') || person.emoji,
  };
}

/**
 * Private answers are for the group, never for guests. Firestore rules enforce
 * that by keeping them in a separate document; this only decides whether to
 * draw the block at all.
 */
export function canSeePrivate(viewer: Viewer): boolean {
  return viewer.kind === 'admin' || (viewer.kind === 'member' && viewer.submitted);
}
