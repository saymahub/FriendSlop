/**
 * Finds the things two free-text answers have in common, such as two lists of
 * hated foods. Answers are split into items, filler is dropped, and items match
 * when one's words all appear in the other's: "raisin" matches "raisins in
 * cookies". There is deliberately no synonym list, so "coriander" and "cilantro"
 * stay different, as do spelling variants.
 */

/** Phrases around a food that say nothing about which food it is. Longest first, so they strip whole. */
const FILLER_PHRASES = ['anything with', "can't stand", 'cant stand', 'too much', 'i hate', 'i dont like', "i don't like"];

/** Single words that carry no meaning on their own in these answers. */
const FILLER_WORDS = new Set([
  'a', 'an', 'the', 'any', 'anything', 'some', 'really', 'honestly', 'especially', 'just', 'very', 'so', 'too',
  'like', 'with', 'on', 'in', 'of', 'my', 'hate', 'stuff', 'things', 'food', 'foods', 'all', 'kinds', 'kind',
]);

/** Answers that mean "nothing", which must never count as something shared. */
const NOTHING = new Set(['nothing', 'none', 'na', 'n/a', 'nope', 'idk', 'no', 'not', 'nah']);

/** How many items of one answer also appear in the other. Each item is matched at most once. */
export function sharedItems(left: string, right: string): number {
  const remaining = itemsOf(right);
  let shared = 0;

  for (const item of itemsOf(left)) {
    const match = remaining.findIndex((other) => sameItem(item, other));
    if (match >= 0) {
      remaining.splice(match, 1);
      shared++;
    }
  }

  return shared;
}

function itemsOf(answer: string): string[][] {
  return answer
    .toLowerCase()
    .split(/,|;|\/|\n|&|\+|\band\b|\bor\b/)
    .map(wordsOf)
    .filter((words) => words.length > 0 && !words.every((word) => NOTHING.has(word)));
}

function wordsOf(item: string): string[] {
  const stripped = FILLER_PHRASES.reduce((text, phrase) => text.replaceAll(phrase, ' '), item);
  const words = stripped.match(/[\p{L}\p{N}']+/gu) ?? [];
  return words.filter((word) => !FILLER_WORDS.has(word)).map(singular);
}

/** Simple English plurals only: "cherries" to "cherry", "tomatoes" to "tomato", "olives" to "olive". */
function singular(word: string): string {
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && word.endsWith('oes')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !/(ss|us|is)$/.test(word)) return word.slice(0, -1);
  return word;
}

/** One item's words all appear in the other's, allowing a shortened word ("thai si" for "thai siam"). */
function sameItem(left: string[], right: string[]): boolean {
  return wordsAllIn(left, right) || wordsAllIn(right, left);
}

function wordsAllIn(inner: string[], outer: string[]): boolean {
  return inner.every((word) => outer.some((other) => sameWord(word, other, inner.length)));
}

/**
 * The same word, or a shortened one: "si" for "siam", "ice" for "iced". A short
 * stub only counts beside another word, so "pi" alone never matches "pizza".
 */
function sameWord(word: string, other: string, wordsInItem: number): boolean {
  if (word === other) {
    return true;
  }

  const shortest = wordsInItem > 1 ? 2 : 3;
  return word.length >= shortest && other.startsWith(word);
}
