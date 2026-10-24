import { ccArt } from '@/assets/registry';
import { cutoutLabel } from '@/lib/answerDisplay';

/**
 * One thing a customer can order. \`key\` includes the shelf, so a drink and a food
 * that happen to share a file name are still different orders.
 */
export type MenuItem = { key: string; label: string; image: string };

function itemsFrom(kind: 'drinks' | 'food'): MenuItem[] {
  return Object.keys(ccArt[kind])
    .sort()
    .map((id) => ({ key: `${kind}/${id}`, label: cutoutLabel(id), image: ccArt[kind][id] }));
}

/**
 * Everything orderable, drinks then food, on one shelf so the rows fill out.
 * Customers pick from all of it.
 */
export const menu: readonly MenuItem[] = [...itemsFrom('drinks'), ...itemsFrom('food')];

const byKey = new Map(menu.map((item) => [item.key, item]));

export function menuItem(key: string): MenuItem | undefined {
  return byKey.get(key);
}

/** "an" before "Ube Latte", "a" before "Croissant". Goes by the first letter, which suits menu names. */
export function articleFor(label: string): 'a' | 'an' {
  return /^[aeiou]/i.test(label) ? 'an' : 'a';
}
