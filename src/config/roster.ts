import type { SwatchId } from './swatches';

/**
 * Who is on the roster, by anonymous id. Real names are kept out of the repo and
 * the bundle: they live in the gitignored `names.local.json` and are read only
 * when the admin panel seeds Firestore, which is where every screen gets them.
 */
export type RosterEntry = {
  readonly id: string;
  readonly colour: SwatchId;
  readonly emoji: string;
};

export const roster: readonly RosterEntry[] = [
  { id: 'person1', colour: 'rose', emoji: '🌸' },
  { id: 'person2', colour: 'lagoon', emoji: '🌈' },
  { id: 'person3', colour: 'marigold', emoji: '🌻' },
  { id: 'person4', colour: 'moss', emoji: '🌿' },
  { id: 'person5', colour: 'plum', emoji: '🦋' },
  { id: 'person6', colour: 'clay', emoji: '🍓' },
  { id: 'person7', colour: 'seafoam', emoji: '🪻' },
  { id: 'person8', colour: 'stone', emoji: '🎀' },
  { id: 'person9', colour: 'amber', emoji: '🌤️' },
  { id: 'person10', colour: 'cornflower', emoji: '🌙' },
  { id: 'person11', colour: 'brick', emoji: '🪩' },
  { id: 'person12', colour: 'wine', emoji: '🍒' },
  { id: 'person13', colour: 'lilac', emoji: '🔮' },
  { id: 'person14', colour: 'fern', emoji: '🍀' },
  { id: 'person15', colour: 'pine', emoji: '🌲' },
  { id: 'person16', colour: 'navy', emoji: '🐼' },
  { id: 'person17', colour: 'butter', emoji: '🎉' },
  { id: 'person18', colour: 'clay', emoji: '🍟' },
  { id: 'person19', colour: 'amber', emoji: '🎃' },
];
