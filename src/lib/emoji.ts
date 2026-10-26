/**
 * Emoji as whole characters. One emoji can be several code points ("👩‍🍳",
 * "👍🏽", a flag), so text is split the way people see it, not character by
 * character.
 */

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/** Pictures and flags; letters, digits and punctuation are not emoji here. */
const EMOJI = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;

function emojiIn(text: string): string[] {
  return [...graphemes.segment(text)].map((part) => part.segment).filter((part) => EMOJI.test(part));
}

/** The first emoji in some text, or an empty string when it has none. */
export function firstEmoji(text: string): string {
  return emojiIn(text)[0] ?? '';
}

/** The last emoji in some text, so typing a new one replaces the old. */
export function lastEmoji(text: string): string {
  return emojiIn(text).at(-1) ?? '';
}
