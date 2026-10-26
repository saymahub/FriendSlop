import { Link } from 'react-router-dom';
import { PaperCard } from '@/components/primitives';
import { BlockHeading } from '@/profile/BlockHeading';
import { identityOf } from '@/lib/profileData';
import type { Twin } from '@/lib/stats/twins';

/** The smallest of the four card tilts; the steeper ones read as crooked on a card this wide. */
const GENTLEST_TILT = 2;

/** Everyone they can be compared with, most alike first. */
export function TwinBoard({ twins }: { twins: Twin[] }) {
  if (twins.length === 0) {
    return null;
  }

  return (
    <PaperCard tiltSeed={GENTLEST_TILT}>
      <BlockHeading>Your twins</BlockHeading>
      <ol className="space-y-1">
        {twins.map((twin) => (
          <TwinRow key={twin.member.person.id} twin={twin} />
        ))}
      </ol>
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
        <span className="min-w-0 flex-1 truncate font-bold text-ink">{name}</span>
        <span className="w-12 text-right text-lg font-bold tabular-nums text-ink">{percent}%</span>
      </Link>
    </li>
  );
}
