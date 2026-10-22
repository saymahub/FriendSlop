import { questions } from '@/config/questions';
import type { AnswerValue, Question } from '@/config/questionTypes';
import type { GroupMember } from '@/data/people';
import { isChoiceQuestion, picksOf } from './picks';

/**
 * Below this many questions in common a score is mostly noise, so the pair is
 * left unscored rather than called twins on the strength of two answers.
 */
const MINIMUM_SHARED_QUESTIONS = 5;

/** `score` runs from 0 (nothing alike) to 1 (identical on everything shared). */
export type Twin = { member: GroupMember; score: number };

/** Everyone else, closest match first. People with too little in common are left out. */
export function rankTwins(me: GroupMember, group: readonly GroupMember[]): Twin[] {
  return group
    .filter((other) => other.person.id !== me.person.id)
    .map((other) => ({ member: other, score: similarity(me, other) }))
    .filter((twin): twin is Twin => twin.score !== undefined)
    .sort((left, right) => right.score - left.score);
}

function similarity(left: GroupMember, right: GroupMember): number | undefined {
  const scores = questions
    .map((question) => agreement(question, left.answers[question.id], right.answers[question.id]))
    .filter((score): score is number => score !== undefined);

  if (scores.length < MINIMUM_SHARED_QUESTIONS) {
    return undefined;
  }

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

/**
 * How far two people agree on one question, or undefined when either skipped it.
 * Sliders score by distance; choices by overlap, so sharing two of three snacks
 * counts for more than sharing one.
 */
function agreement(question: Question, left: AnswerValue | undefined, right: AnswerValue | undefined): number | undefined {
  if (typeof left === 'number' && typeof right === 'number') {
    return 1 - Math.abs(left - right) / 100;
  }

  if (!isChoiceQuestion(question)) {
    return undefined;
  }

  return overlap(
    picksOf(question, left).map((pick) => pick.key),
    picksOf(question, right).map((pick) => pick.key),
  );
}

/** Shared picks over all picks between them: 1 for the same set, 0 for none in common. */
function overlap(left: string[], right: string[]): number | undefined {
  if (left.length === 0 || right.length === 0) {
    return undefined;
  }

  const shared = left.filter((key) => right.includes(key)).length;
  return shared / new Set([...left, ...right]).size;
}
