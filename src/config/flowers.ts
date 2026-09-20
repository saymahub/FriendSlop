import type { SwatchId } from './swatches';

/**
 * The flower picker reuses the swatch grid, but flowers are not colours, so they
 * need their own list. `tint` colours the placeholder drawing until real
 * hand-drawn art replaces it in the asset registry.
 */
export type Flower = { readonly id: string; readonly name: string; readonly tint: SwatchId };

export const flowers: readonly Flower[] = [
  { id: 'rose', name: 'Rose', tint: 'rose' },
  { id: 'peony', name: 'Peony', tint: 'blush' },
  { id: 'tulip', name: 'Tulip', tint: 'clay' },
  { id: 'sunflower', name: 'Sunflower', tint: 'marigold' },
  { id: 'daisy', name: 'Daisy', tint: 'butter' },
  { id: 'lavender', name: 'Lavender', tint: 'lilac' },
  { id: 'hydrangea', name: 'Hydrangea', tint: 'cornflower' },
  { id: 'orchid', name: 'Orchid', tint: 'orchid' },
  { id: 'lily', name: 'Lily', tint: 'cream' },
  { id: 'carnation', name: 'Carnation', tint: 'wine' },
  { id: 'freesia', name: 'Freesia', tint: 'apricot' },
  { id: 'eucalyptus', name: 'Eucalyptus', tint: 'sage' },
];
