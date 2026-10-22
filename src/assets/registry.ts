/**
 * Every piece of art in the project, exported by name.
 *
 * Components ask for a name and never a path or a file extension, so an asset
 * can move between SVG, WebP and a sprite sheet without anything downstream
 * changing. These are placeholder line drawings; real scanned art replaces the
 * values here and nowhere else.
 */

import broLogo from './bro.png';

/** Photographs and drawn art that are not stickers. */
export const logos = {
  bro: broLogo,
} as const;

const placeholder = (paths: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`,
  )}`;

export const stickers = {
  star: placeholder('<path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6.1L12 16.8 6.7 19.7l1.1-6.1L3.4 9.4l6-.8z"/>'),
  heart: placeholder('<path d="M12 20s-7-4.4-7-9a3.8 3.8 0 017-2 3.8 3.8 0 017 2c0 4.6-7 9-7 9z"/>'),
  coffee: placeholder('<path d="M4 9h12v6a4 4 0 01-4 4H8a4 4 0 01-4-4z"/><path d="M16 10h2a2.5 2.5 0 010 5h-2"/>'),
  cat: placeholder('<path d="M5 10l-1-5 4 2.4a8 8 0 018 0L20 5l-1 5a7 7 0 11-14 0z"/><path d="M9.5 12h.01M14.5 12h.01"/>'),
  flower: placeholder('<circle cx="12" cy="12" r="2.4"/><path d="M12 4a3 3 0 010 5M12 20a3 3 0 010-5M4 12a3 3 0 015 0M20 12a3 3 0 01-5 0"/>'),
} as const;

/**
 * Full-colour cutouts, drawn as they are rather than recoloured like a sticker
 * mask. A WebP's file name is its id, so renaming a file orphans anyone who
 * picked it. Dropping a picture into `smiskis/` or `sanrio/` is all it takes to
 * offer it; a flower also needs an entry in `config/flowers.ts` for its name.
 */
const byFileName = (files: Record<string, string>): Readonly<Record<string, string>> =>
  Object.fromEntries(
    Object.entries(files).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1, -'.webp'.length), url]),
  );

export const smiskis = byFileName(import.meta.glob<string>('./smiskis/*.webp', { eager: true, import: 'default' }));
export const sanrio = byFileName(import.meta.glob<string>('./sanrio/*.webp', { eager: true, import: 'default' }));
export const flowerArt = byFileName(import.meta.glob<string>('./flowers/*.webp', { eager: true, import: 'default' }));

export const cutouts = { smiski: smiskis, sanrio, flower: flowerArt } as const;

export const textures = {
  paper: 'var(--texture-paper)',
} as const;

export type StickerName = keyof typeof stickers;
export type LogoName = keyof typeof logos;
export type TextureName = keyof typeof textures;
export type CutoutSet = keyof typeof cutouts;
