import { cutouts } from '@/assets/registry';
import { flowers } from '@/config/flowers';
import { swatches, type SwatchId } from '@/config/swatches';
import { cutoutLabel, OTHER_PREFIX } from '@/lib/answerDisplay';
import type { AnswerValue, Question, QuestionType } from '@/config/questionTypes';

/**
 * One thing a person chose, in a form that can be counted and compared. `key`
 * is what makes two picks the same; `fill` is set for colours, so a chart can
 * show the swatch beside its name.
 */
export type Pick = { key: string; label: string; fill?: string };

type PickReaders = {
  [Type in QuestionType]?: (question: Extract<Question, { type: Type }>, value: AnswerValue) => Pick[];
};

/**
 * Question types whose answers are choices from a list. Free text is left out:
 * "Japan" and "japan!" are the same answer to a person and different to code.
 */
const readers: PickReaders = {
  single: (question, value) => optionPicks(question.options, [value]),
  multi: (question, value) => optionPicks(question.options, asList(value)),
  swatch: (question, value) => (question.variant === 'flower' ? flowerPicks(asList(value)) : swatchPicks(asList(value))),
  cutout: (question, value) =>
    typeof value === 'string' && Object.hasOwn(cutouts[question.set], value) ? [{ key: value, label: cutoutLabel(value) }] : [],
};

export function isChoiceQuestion(question: Question): boolean {
  return question.type in readers;
}

/** Each distinct pick once, or none when the question was skipped or declined. */
export function picksOf(question: Question, value: AnswerValue | undefined): Pick[] {
  const read = readers[question.type] as ((question: Question, value: AnswerValue) => Pick[]) | undefined;

  if (!read || value === undefined || value === null) {
    return [];
  }

  const unique = new Map(read(question, value).map((pick) => [pick.key, pick]));
  return [...unique.values()];
}

function asList(value: AnswerValue): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function optionPicks(options: readonly { value: string; label: string }[], chosen: unknown[]): Pick[] {
  return chosen
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '')
    .map((entry) => (entry.startsWith(OTHER_PREFIX) ? otherPick(entry) : optionPick(options, entry)));
}

function optionPick(options: readonly { value: string; label: string }[], entry: string): Pick {
  return { key: entry, label: options.find((option) => option.value === entry)?.label ?? entry };
}

/** Typed-in answers that differ only in case or spacing count as one. */
function otherPick(entry: string): Pick {
  const text = entry.slice(OTHER_PREFIX.length).trim();
  return { key: OTHER_PREFIX + text.toLowerCase(), label: text };
}

function swatchPicks(ids: string[]): Pick[] {
  return ids
    .filter((id): id is SwatchId => Object.hasOwn(swatches, id))
    .map((id) => ({ key: id, label: swatches[id].name, fill: swatches[id].base }));
}

function flowerPicks(ids: string[]): Pick[] {
  return flowers.filter((flower) => ids.includes(flower.id)).map((flower) => ({ key: flower.id, label: flower.name }));
}
