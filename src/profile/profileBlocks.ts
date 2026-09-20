import { AllergyTape } from './blocks/AllergyTape';
import { BuyMeBoard } from './blocks/BuyMeBoard';
import { ColourStrip } from './blocks/ColourStrip';
import { EnvelopePocket } from './blocks/EnvelopePocket';
import { Meters } from './blocks/Meters';
import { PolaroidWall } from './blocks/PolaroidWall';
import { ProfileHeader } from './blocks/ProfileHeader';
import type { ProfileBlock } from './blockTypes';

/**
 * The profile page in order, as data. Reordering or hiding a section is an edit
 * to this array, not to any component.
 *
 * The allergy strip sits directly under the header rather than partway down the
 * page, because it is the one thing here that matters before someone stops
 * reading.
 */
export const profileBlocks: readonly ProfileBlock[] = [
  { id: 'header', Component: ProfileHeader },
  { id: 'allergies', Component: AllergyTape },
  { id: 'colour', Component: ColourStrip },
  { id: 'wall', Component: PolaroidWall },
  { id: 'buyMe', Component: BuyMeBoard },
  { id: 'meters', Component: Meters },
  { id: 'envelope', Component: EnvelopePocket, privateOnly: true },
];
