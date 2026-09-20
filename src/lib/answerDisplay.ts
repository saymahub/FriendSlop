import { questionsById } from '@/config/questions';
import { flowers } from '@/config/flowers';
import { swatches, type SwatchId } from '@/config/swatches';
import type { Answers } from '@/state/useAnswers';
import type { SwatchTriple } from '@/config/swatches';

const OTHER_PREFIX = 'other:';

/** Free text, or an empty string when the question was skipped or never answered. */
export function textAnswer(answers: Answers, questionId: string): string {
  const value = answers[questionId];
  return typeof value === 'string' ? value : '';
}

/** Chosen options as the labels people actually picked, "other" text included. */
export function labelledAnswers(answers: Answers, questionId: string): string[] {
  const question = questionsById.get(questionId);
  const value = answers[questionId];

  if (!question || value === null || value === undefined) {
    return [];
  }

  const chosen = Array.isArray(value) ? (value as string[]) : [String(value)];
  const options = 'options' in question ? question.options : [];

  return chosen.map((entry) => {
    if (entry.startsWith(OTHER_PREFIX)) {
      return entry.slice(OTHER_PREFIX.length);
    }
    return options.find((option) => option.value === entry)?.label ?? entry;
  });
}

export function chosenSwatches(answers: Answers, questionId: string): SwatchTriple[] {
  const value = answers[questionId];

  if (!Array.isArray(value)) {
    return [];
  }

  return (value as SwatchId[]).filter((id) => id in swatches).map((id) => swatches[id]);
}

export function chosenFlowerNames(answers: Answers, questionId: string): string[] {
  const value = answers[questionId];

  if (!Array.isArray(value)) {
    return [];
  }

  return (value as string[])
    .map((id) => flowers.find((flower) => flower.id === id)?.name)
    .filter((name): name is string => name !== undefined);
}

/** A slider's stored 0-100, or undefined when it was never moved. */
export function sliderAnswer(answers: Answers, questionId: string): number | undefined {
  const value = answers[questionId];
  return typeof value === 'number' ? value : undefined;
}
