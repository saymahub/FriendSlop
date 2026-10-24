import type { Viewer } from '@/state/ViewerContext';

export type NavItem = { to: string; label: string };

/** Last on every list: the art licences need the credits reachable from anywhere. */
const CREDITS: NavItem = { to: '/credits', label: 'Credits' };

/**
 * Locked sections are left out entirely rather than shown greyed: a member who
 * has not handed their page in sees only their own, so the nav never lists
 * somewhere they cannot go.
 */
export function navItemsFor(viewer: Viewer): NavItem[] {
  if (viewer.kind === 'guest' || viewer.kind === 'admin') {
    return [
      { to: '/people', label: 'The gang' },
      { to: '/stats', label: 'Group stats' },
      CREDITS,
    ];
  }

  if (viewer.kind !== 'member') {
    return [];
  }

  const own: NavItem[] = [
    { to: '/me', label: 'My page' },
    { to: '/me/edit', label: viewer.submitted ? 'Edit my answers' : 'Fill in my page' },
  ];

  if (!viewer.submitted) {
    return [...own, CREDITS];
  }

  return [
    ...own,
    { to: '/people', label: 'The gang' },
    { to: '/stats', label: 'Group stats' },
    { to: '/cc', label: 'Millie\u2019s CC' },
    CREDITS,
  ];
}
