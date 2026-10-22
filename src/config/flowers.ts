/**
 * The flower picker reuses the swatch grid, but flowers are not colours, so they
 * need their own list. Each id matches a picture in `assets/flowers/`.
 */
export type Flower = { readonly id: string; readonly name: string };

export const flowers: readonly Flower[] = [
  { id: 'rose', name: 'Rose' },
  { id: 'tulip', name: 'Tulip' },
  { id: 'sunflower', name: 'Sunflower' },
  { id: 'daisy', name: 'Daisy' },
  { id: 'lavender', name: 'Lavender' },
  { id: 'hydrangea', name: 'Hydrangea' },
  { id: 'orchid', name: 'Orchid' },
  { id: 'lily', name: 'Lily' },
  { id: 'cherryblossom', name: 'Cherry blossom' },
  { id: 'dahlia', name: 'Dahlia' },
  { id: 'anemone', name: 'Anemone' },
  { id: 'iris', name: 'Iris' },
];
