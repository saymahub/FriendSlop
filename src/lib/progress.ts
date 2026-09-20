import { questions, questionsInSection } from '@/config/questions';
import type { Question, SectionId } from '@/config/questionTypes';
import type { Answers } from '@/state/useAnswers';

export type Progress = { answered: number; total: number };

/**
 * A deliberate "prefer not to say" is stored as null and counts as answered.
 * Only a question never touched counts as outstanding.
 */
export function isAnswered(question: Question, answers: Answers): boolean {
  if (!(question.id in answers)) {
    return false;
  }

  const value = answers[question.id];

  if (value === null) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

export function overallProgress(answers: Answers): Progress {
  const required = questions.filter((question) => !question.isOptional);
  return {
    answered: required.filter((question) => isAnswered(question, answers)).length,
    total: required.length,
  };
}

export function sectionProgress(sectionId: SectionId, answers: Answers): Progress {
  const sectionQuestions = questionsInSection(sectionId);
  return {
    answered: sectionQuestions.filter((question) => isAnswered(question, answers)).length,
    total: sectionQuestions.length,
  };
}

export function isComplete(answers: Answers): boolean {
  const { answered, total } = overallProgress(answers);
  return answered === total;
}
