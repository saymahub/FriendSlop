/**
 * The 24 curated swatches people choose from.
 *
 * Curated rather than a free colour picker for two reasons: free picking makes
 * "the group's most popular colour" uncomputable across 20 people, and it lets
 * someone choose a near-white that renders their profile theme unreadable.
 *
 * Laid out as 7 hue families x 3 values, then 3 neutrals, and declared in hue
 * order so the picker grid can render this array as-is.
 */

export type SwatchTriple = {
  /** Label shown under the chip. Always visible, never hover-only. */
  readonly name: string;
  /** The accent colour itself. */
  readonly base: string;
  /** Text drawn on top of `base`. Contrast against `base` is at least 4.5:1. */
  readonly ink: string;
  /** Pale tint of `base`, used for large background fills. */
  readonly wash: string;
  /** Groups the three values of one hue together. */
  readonly family: SwatchFamily;
};

export type SwatchFamily =
  | 'clay'
  | 'marigold'
  | 'sage'
  | 'lagoon'
  | 'cornflower'
  | 'plum'
  | 'rose'
  | 'neutral';

export const swatches = {
  apricot: { name: 'Apricot', base: '#F0A882', ink: '#4A2113', wash: '#FBEBE2', family: 'clay' },
  clay: { name: 'Clay', base: '#D2694A', ink: '#2E0F06', wash: '#F7E3DA', family: 'clay' },
  brick: { name: 'Brick', base: '#92402C', ink: '#FBEFE9', wash: '#F1DDD6', family: 'clay' },

  butter: { name: 'Butter', base: '#F2CE72', ink: '#46320A', wash: '#FCF3DC', family: 'marigold' },
  marigold: { name: 'Marigold', base: '#E09A2B', ink: '#3E2505', wash: '#FAEEDA', family: 'marigold' },
  amber: { name: 'Amber', base: '#955F10', ink: '#FDF3E2', wash: '#F2E4CC', family: 'marigold' },

  sage: { name: 'Sage', base: '#A8C47A', ink: '#26350D', wash: '#EDF3E0', family: 'sage' },
  moss: { name: 'Moss', base: '#7A9B4A', ink: '#1B2A07', wash: '#E4EDD6', family: 'sage' },
  fern: { name: 'Fern', base: '#4C6B2C', ink: '#F0F5E6', wash: '#DDE7CE', family: 'sage' },

  seafoam: { name: 'Seafoam', base: '#8FCBC0', ink: '#103832', wash: '#E4F2EF', family: 'lagoon' },
  lagoon: { name: 'Lagoon', base: '#4FA396', ink: '#0A2C27', wash: '#DCEDE9', family: 'lagoon' },
  pine: { name: 'Pine', base: '#2A6A61', ink: '#E8F4F1', wash: '#D3E6E2', family: 'lagoon' },

  powder: { name: 'Powder', base: '#A3BEDD', ink: '#14293F', wash: '#E8EEF7', family: 'cornflower' },
  cornflower: { name: 'Cornflower', base: '#648EC3', ink: '#0E1F33', wash: '#DEE7F2', family: 'cornflower' },
  navy: { name: 'Navy', base: '#2E4A73', ink: '#E9F0F8', wash: '#D6E0EC', family: 'cornflower' },

  lilac: { name: 'Lilac', base: '#BDA8D4', ink: '#2B1B3D', wash: '#EFE9F5', family: 'plum' },
  orchid: { name: 'Orchid', base: '#765A95', ink: '#F2ECF8', wash: '#E6DCF0', family: 'plum' },
  plum: { name: 'Plum', base: '#5A3D77', ink: '#EFE7F6', wash: '#DED2EB', family: 'plum' },

  blush: { name: 'Blush', base: '#EFB3C0', ink: '#4A1626', wash: '#FBE8EC', family: 'rose' },
  rose: { name: 'Rose', base: '#D4708B', ink: '#3D0E1E', wash: '#F7E0E6', family: 'rose' },
  wine: { name: 'Wine', base: '#8E3050', ink: '#FBE9EE', wash: '#EFD8DF', family: 'rose' },

  cream: { name: 'Cream', base: '#EDE3CD', ink: '#3A3223', wash: '#F9F4E8', family: 'neutral' },
  stone: { name: 'Stone', base: '#A8A093', ink: '#201D17', wash: '#EDEAE3', family: 'neutral' },
  charcoal: { name: 'Charcoal', base: '#3E3A33', ink: '#F6F2E8', wash: '#DFDBD2', family: 'neutral' },
} as const satisfies Record<string, SwatchTriple>;

export type SwatchId = keyof typeof swatches;

export const swatchIds = Object.keys(swatches) as SwatchId[];

export function getSwatch(id: SwatchId): SwatchTriple {
  return swatches[id];
}

/** The three CSS variables a profile root sets so its children inherit the theme. */
export function swatchVariables(id: SwatchId): Record<string, string> {
  const { base, ink, wash } = swatches[id];
  return { '--person-base': base, '--person-ink': ink, '--person-wash': wash };
}
