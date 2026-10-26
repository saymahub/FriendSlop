import { questionsById } from '@/config/questions';
import type { AnswerValue, QuestionType } from '@/config/questionTypes';
import type { Answers } from '@/state/useAnswers';

/**
 * Answers are read back from Firestore, where a person can write anything to
 * their own document by going around the site. Every answer is checked against
 * the shape its question expects before any screen sees it, so one malformed
 * answer cannot crash a page for everyone who views it. Answers to questions no
 * longer asked are kept as they are: nothing displays them, and dropping them
 * here would delete them on the person's next save.
 */
export function cleanAnswers(raw: unknown): Answers {
  if (!isRecord(raw)) {
    return {};
  }

  const cleaned: Answers = {};

  for (const [id, value] of Object.entries(raw)) {
    const question = questionsById.get(id);

    if (!question) {
      cleaned[id] = value as AnswerValue;
      continue;
    }

    const shaped = value === null ? null : shapers[question.type](value);
    if (shaped !== undefined) {
      cleaned[id] = shaped;
    }
  }

  return cleaned;
}

/** Each type's check: the value in its proper shape, or undefined to drop it. */
const shapers: Record<QuestionType, (value: unknown) => AnswerValue | undefined> = {
  text: asString,
  single: asString,
  date: asString,
  cutout: asString,
  multi: asStrings,
  swatch: asStrings,
  slider: (value) => (typeof value === 'number' && Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : undefined),
  song: asSong,
  lookup: (value) => {
    if (typeof value === 'string') {
      return value;
    }
    if (isRecord(value) && typeof value.title === 'string') {
      // A picture from anywhere but a secure web address is dropped; the title stays.
      return isSecureUrl(value.image) ? { title: value.title, image: value.image } : value.title;
    }
    return undefined;
  },
};

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asStrings(value: unknown): string[] | undefined {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : undefined;
}

function asSong(value: unknown): AnswerValue | undefined {
  if (!isRecord(value) || typeof value.title !== 'string' || typeof value.artist !== 'string') {
    return undefined;
  }

  return {
    title: value.title,
    artist: value.artist,
    ...(isSecureUrl(value.artwork) ? { artwork: value.artwork } : {}),
    ...(isSecureUrl(value.previewUrl) ? { previewUrl: value.previewUrl } : {}),
    ...(isSecureUrl(value.itunesUrl) ? { itunesUrl: value.itunesUrl } : {}),
  };
}

function isSecureUrl(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('https://');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
