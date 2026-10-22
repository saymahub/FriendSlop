import { roster } from './roster';

type RosterNames = Record<string, string>;

/**
 * A glob rather than a plain import, so the build still succeeds where the file
 * does not exist — which is everywhere except the machine that seeds the roster.
 * The file is loaded lazily, so its names never land in the main bundle.
 */
const namesFile = import.meta.glob<RosterNames>('./names.local.json', { import: 'default' });

/** Fails before anything is written, rather than seeding a card with no name. */
export async function loadRosterNames(): Promise<RosterNames> {
  const load = namesFile['./names.local.json'];

  if (!load) {
    throw new Error('No src/config/names.local.json. Add it on this machine to seed the roster.');
  }

  const names = await load();
  const unnamed = roster.filter((person) => !names[person.id]).map((person) => person.id);

  if (unnamed.length > 0) {
    throw new Error(`names.local.json has no name for: ${unnamed.join(', ')}.`);
  }

  return names;
}
