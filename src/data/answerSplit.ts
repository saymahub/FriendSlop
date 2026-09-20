import { questionsById } from '@/config/questions';
import type { Answers } from '@/state/useAnswers';

/**
 * Splits a flat answer map along the privacy line drawn in `questions.ts`.
 *
 * This is the whole reason private answers stay private: they are written to a
 * separate document that Firestore rules never serve to a guest. Filtering them
 * out in a component would hide them from the page, not from the network.
 */
export function splitAnswers(answers: Answers): { publicAnswers: Answers; privateAnswers: Answers } {
  const publicAnswers: Answers = {};
  const privateAnswers: Answers = {};

  for (const [questionId, value] of Object.entries(answers)) {
    const target = questionsById.get(questionId)?.isPrivate ? privateAnswers : publicAnswers;
    target[questionId] = value;
  }

  return { publicAnswers, privateAnswers };
}

export function mergeAnswers(publicAnswers: Answers, privateAnswers: Answers): Answers {
  return { ...publicAnswers, ...privateAnswers };
}
