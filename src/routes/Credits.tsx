import { HandLabel, PaperCard } from '@/components/primitives';

/** Where the pictures and song previews come from, in the order a profile shows them. */
const SOURCES = [
  { name: 'Wikipedia', href: 'https://www.wikipedia.org', use: 'Pictures for shows, films, games and animals' },
  { name: 'Wikivoyage', href: 'https://www.wikivoyage.org', use: 'Destination photos for next trips' },
  { name: 'Apple', href: 'https://www.apple.com/apple-music/', use: 'Song previews, album art and book covers' },
  { name: 'Deezer', href: 'https://www.deezer.com', use: 'Artist photos' },
  { name: 'AniList', href: 'https://anilist.co', use: 'Anime covers' },
] as const;

/**
 * Everyone whose work the site borrows, starting with art used under a licence
 * that requires credit. Open to anyone, guests included, so the credit is
 * always reachable.
 */
export function Credits() {
  return (
    <div className="flex flex-col gap-6">
      <HandLabel as="h1" size="hero" face="title" className="block text-center">
        Credits
      </HandLabel>

      <PaperCard>
        <h2 className="mb-2 font-bold text-ink">Art</h2>
        <ul className="space-y-1 text-ink-soft">
          <li>
            <a href="https://www.vecteezy.com/free-vector/washi-tape" target="_blank" rel="noopener noreferrer" className="underline">
              Washi Tape Vectors by Vecteezy
            </a>
          </li>
        </ul>
      </PaperCard>

      <PaperCard>
        <h2 className="mb-2 font-bold text-ink">Pictures and music</h2>
        <ul className="space-y-2 text-ink-soft">
          {SOURCES.map((source) => (
            <li key={source.name}>
              <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-bold underline">
                {source.name}
              </a>
              <span className="block text-sm">{source.use}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-faded">
          Pictures from Wikipedia and Wikivoyage belong to their photographers and artists, licensed within.
        </p>
      </PaperCard>
    </div>
  );
}
