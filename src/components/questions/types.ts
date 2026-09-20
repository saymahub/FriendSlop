import type { AnswerValue, Question } from '@/config/questionTypes';

/**
 * Every renderer takes exactly these props, which is what makes them
 * interchangeable through the registry. A new question type is one component
 * plus one line in `registry.ts`.
 */
export type QuestionProps<Q extends Question = Question> = {
  question: Q;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
};
