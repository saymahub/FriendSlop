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

/**
 * The "X of Y answered" under a section heading. The song is left out: it is a
 * bonus, not part of the page. Once the page is handed in, a slider counts as
 * answered even if it was never moved, because its handle starts in the middle and
 * an untouched slider is read as the middle everywhere else.
 */
export function sectionProgress(sectionId: SectionId, answers: Answers, submitted: boolean): Progress {
  const counted = questionsInSection(sectionId).filter((question) => question.type !== 'song');
  const answered = counted.filter(
    (question) => isAnswered(question, answers) || (submitted && question.type === 'slider'),
  );

  return { answered: answered.length, total: counted.length };
}

export function isComplete(answers: Answers): boolean {
  const { answered, total } = overallProgress(answers);
  return answered === total;
}
