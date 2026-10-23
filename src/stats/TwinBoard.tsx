import { Link } from 'react-router-dom';
import { PaperCard } from '@/components/primitives';
import { BlockHeading } from '@/profile/BlockHeading';
import { identityOf } from '@/lib/profileData';
import type { Twin } from '@/lib/stats/twins';

const TWINS_SHOWN = 3;

/** The smallest of the four card tilts; the steeper ones read as crooked on a card this wide. */
const GENTLEST_TILT = 2;

/** Their closest matches, then the one person they have least in common with. */
export function TwinBoard({ twins }: { twins: Twin[] }) {
  if (twins.length === 0) {
    return null;
  }

  const closest = twins.slice(0, TWINS_SHOWN);
  const furthest = twins.length > TWINS_SHOWN ? twins[twins.length - 1] : undefined;

  return (
    <PaperCard tiltSeed={GENTLEST_TILT}>
      <BlockHeading>Your twins</BlockHeading>
      <ol className="space-y-2">
        {closest.map((twin) => (
          <TwinRow key={twin.member.person.id} twin={twin} />
        ))}
      </ol>

      {furthest && (
        <>
          <p className="mt-4 mb-2 text-sm font-bold text-ink-soft">Least alike</p>
          <TwinRow twin={furthest} />
        </>
      )}
    </PaperCard>
  );
}

function TwinRow({ twin }: { twin: Twin }) {
  const { name, emoji } = identityOf(twin.member.person);
  const percent = Math.round(twin.score * 100);

  return (
    <li className="list-none">
      <Link
        to={`/people/${twin.member.person.id}`}
        className="flex min-h-11 items-center gap-3 rounded-card px-2 hover:bg-paper-deep"
      >
        <span aria-hidden="true" className="text-2xl">
          {emoji}
        </span>
        <span className="flex-1 font-bold text-ink">{name}</span>
        <span className="text-lg font-bold tabular-nums text-ink">{percent}%</span>
      </Link>
    </li>
  );
}
