import { questions } from '@/config/questions';
import type { AnswerValue, Question } from '@/config/questionTypes';
import type { GroupMember } from '@/data/people';
import { submittedSliderAnswer } from '@/lib/answerDisplay';
import { textAnswer } from '@/lib/answerDisplay';
import { sameFavourite } from './favourites';
import { sharedItems } from './textMatch';
import { isChoiceQuestion, picksOf } from './picks';

/**
 * Below this many questions in common a score is mostly noise, so the pair is
 * left unscored rather than called twins on the strength of two answers.
 */
const MINIMUM_SHARED_QUESTIONS = 5;

/**
 * A shared favourite (the same show, artist, anime, next trip...) counts as this
 * many matching questions. Picking the same one out of thousands says far more
 * than sharing a cake flavour; at one question's worth it would barely register.
 */
const FAVOURITE_WEIGHT = 3;

/**
 * Typed answers compared item by item. Each shared item counts as one matching
 * question, up to a cap, so one long list of hates cannot outweigh everything.
 */
const TEXT_QUESTIONS = ['foodsHated', 'comfortMeal', 'cafeOrder', 'alwaysYesRestaurant'] as const;
const TEXT_MATCH_CAP = 2;

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

/**
 * The average agreement over every question both answered, plus a bonus for each
 * favourite and typed answer they share. A difference there is not held against
 * them: nearly everyone's differs, so it would pull every pair down alike.
 */
function similarity(left: GroupMember, right: GroupMember): number | undefined {
  const scores = questions
    .map((question) => agreement(question, answerOf(left, question), answerOf(right, question)))
    .filter((score): score is number => score !== undefined);

  if (scores.length < MINIMUM_SHARED_QUESTIONS) {
    return undefined;
  }

  const bonus = favouriteBonus(left, right) + textBonus(left, right);

  return (scores.reduce((sum, score) => sum + score, 0) + bonus) / (scores.length + bonus);
}

/** Each favourite they share counts as several matching questions. */
function favouriteBonus(left: GroupMember, right: GroupMember): number {
  const shared = questions.filter(
    (question) =>
      question.type === 'lookup' && sameFavourite(question, left.answers[question.id], right.answers[question.id]),
  ).length;

  return shared * FAVOURITE_WEIGHT;
}

/** Each item their typed answers share counts as one matching question, capped per question. */
function textBonus(left: GroupMember, right: GroupMember): number {
  return TEXT_QUESTIONS.reduce(
    (total, id) =>
      total + Math.min(TEXT_MATCH_CAP, sharedItems(textAnswer(left.answers, id), textAnswer(right.answers, id))),
    0,
  );
}

/** Everyone compared here has submitted, so an untouched slider counts as the middle. */
function answerOf(member: GroupMember, question: Question): AnswerValue | undefined {
  return question.type === 'slider' ? submittedSliderAnswer(member.answers, question.id) : member.answers[question.id];
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
