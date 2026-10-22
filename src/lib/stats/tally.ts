import type { Question } from '@/config/questionTypes';
import type { GroupMember } from '@/data/people';
import { picksOf, type Pick } from './picks';

export type Tally = { pick: Pick; count: number };

/** How many people chose each answer, most popular first, ties alphabetical. */
export function tallyOf(question: Question, group: readonly GroupMember[]): Tally[] {
  const tallies = new Map<string, Tally>();

  for (const member of group) {
    for (const pick of picksOf(question, member.answers[question.id])) {
      const tally = tallies.get(pick.key) ?? { pick, count: 0 };
      tallies.set(pick.key, { ...tally, count: tally.count + 1 });
    }
  }

  return [...tallies.values()].sort(
    (left, right) => right.count - left.count || left.pick.label.localeCompare(right.pick.label),
  );
}

/** How many people gave any answer at all, which is what each count is out of. */
export function respondentsTo(question: Question, group: readonly GroupMember[]): number {
  return group.filter((member) => picksOf(question, member.answers[question.id]).length > 0).length;
}
