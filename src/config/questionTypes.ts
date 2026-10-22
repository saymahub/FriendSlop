import type { CutoutSet } from '@/assets/registry';
import type { SwatchId } from './swatches';

export type QuestionType = 'text' | 'single' | 'multi' | 'slider' | 'swatch' | 'song' | 'date' | 'cutout';

export type SectionId = 'basics' | 'food' | 'colour' | 'media' | 'hangouts' | 'gifting';

export type Section = {
  readonly id: SectionId;
  readonly title: string;
  /** Shown under the section heading to set expectations before the questions. */
  readonly blurb: string;
};

type BaseQuestion = {
  readonly id: string;
  readonly section: SectionId;
  readonly label: string;
  /** Hidden from guests, which means it is stored in the private subdocument. */
  readonly isPrivate?: boolean;
  readonly isOptional?: boolean;
  readonly help?: string;
};

export type TextQuestion = BaseQuestion & {
  readonly type: 'text';
  /** A real example answer. Never starts with "e.g.". */
  readonly placeholder: string;
  readonly multiline?: boolean;
};

export type ChoiceOption = { readonly value: string; readonly label: string };

export type SingleQuestion = BaseQuestion & {
  readonly type: 'single';
  readonly options: readonly ChoiceOption[];
};

export type MultiQuestion = BaseQuestion & {
  readonly type: 'multi';
  readonly options: readonly ChoiceOption[];
  readonly max?: number;
  /** Every multi-select offers a free-text "other". */
  readonly allowOther: true;
};

export type SliderQuestion = BaseQuestion & {
  readonly type: 'slider';
  /** Labelled ends rather than numbers, so nobody has to guess what 7 means. */
  readonly ends: readonly [string, string];
  /**
   * How many positions the handle snaps to. Five by default: enough to say
   * "mostly sweet" without asking anyone to agonise over 61 versus 64.
   */
  readonly stops?: number;
};

export type SwatchQuestion = BaseQuestion & {
  readonly type: 'swatch';
  readonly max: number;
  /** Chooses how the shared swatch grid renders: numbered picks, crossed-out
   *  dislikes, or hand-drawn flower art in place of a flat fill. */
  readonly variant: 'favourite' | 'hate' | 'flower';
};

export type SongQuestion = BaseQuestion & { readonly type: 'song' };
export type DateQuestion = BaseQuestion & { readonly type: 'date' };
/** Pick one picture from a set in the asset registry; stores its file name. */
export type CutoutQuestion = BaseQuestion & { readonly type: 'cutout'; readonly set: CutoutSet };

export type Question =
  | TextQuestion
  | SingleQuestion
  | MultiQuestion
  | SliderQuestion
  | SwatchQuestion
  | SongQuestion
  | DateQuestion
  | CutoutQuestion;

/** A slider stores 0-100; a swatch question stores swatch ids in pick order. */
export type AnswerValue = string | string[] | number | SwatchId[] | SongAnswer | null;

/**
 * Artwork and links are absent when someone types a track in by hand rather than
 * picking it from search results, so the profile page must cope without them.
 */
export type SongAnswer = {
  readonly title: string;
  readonly artist: string;
  readonly artwork?: string;
  readonly previewUrl?: string;
  readonly itunesUrl?: string;
};
