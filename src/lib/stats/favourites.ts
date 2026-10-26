import type { AnswerValue, LookupQuestion } from '@/config/questionTypes';
import { isPictureAnswer } from '@/config/questionTypes';

/** Little words that say nothing about which place or title it is. */
const FILLER = new Set(['the', 'a', 'an', 'of', 'and']);

/**
 * Whether two people named the same favourite. Titles match ignoring case,
 * punctuation, brackets and a leading "the", so "the office" is "The Office".
 * Places are looser: one name's words all appearing in the other's counts, so
 * "Japan" matches "Empire of Japan" and "Paris" matches "Paris, France". That
 * looseness stays with places, where "The Office" and "Office Space" cannot meet.
 */
export function sameFavourite(question: LookupQuestion, left: AnswerValue | undefined, right: AnswerValue | undefined): boolean {
  const leftWords = wordsOf(titleOf(left));
  const rightWords = wordsOf(titleOf(right));

  if (leftWords.length === 0 || rightWords.length === 0) {
    return false;
  }

  if (question.source === 'place') {
    return containsAll(leftWords, rightWords) || containsAll(rightWords, leftWords);
  }

  return leftWords.join(' ') === rightWords.join(' ');
}

function titleOf(value: AnswerValue | undefined): string {
  if (isPictureAnswer(value)) {
    return value.title;
  }
  return typeof value === 'string' ? value : '';
}

function wordsOf(title: string): string[] {
  const words = title
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, ' ')
    .match(/[\p{L}\p{N}']+/gu) ?? [];
  return words.filter((word, index) => !(index === 0 && word === 'the'));
}

/** Every meaningful word of `inner` appears in `outer`. */
function containsAll(inner: string[], outer: string[]): boolean {
  const meaningful = inner.filter((word) => !FILLER.has(word));
  return meaningful.length > 0 && meaningful.every((word) => outer.includes(word));
}
