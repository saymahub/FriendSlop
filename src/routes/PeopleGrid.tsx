import { Link } from 'react-router-dom';
import { HandLabel } from '@/components/primitives';
import { swatches } from '@/config/swatches';
import { fetchPeople } from '@/data/people';
import { identityOf } from '@/lib/profileData';
import { tiltFor } from '@/lib/tilt';
import { useAsync } from '@/lib/useAsync';

export function PeopleGrid() {
  const people = useAsync(fetchPeople, []);

  return (
    <div>
      <HandLabel as="h1" size="hero" face="title" className="mb-6 block text-center">
        The gang
      </HandLabel>

      {people.status === 'loading' && <p className="text-center text-ink-soft">Gathering everyone…</p>}
      {people.status === 'failed' && <p className="text-center text-ink-soft">{people.message}</p>}

      {people.status === 'ready' && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {people.value.map((person, index) => {
            const identity = identityOf(person);
            const filledIn = person.submittedAt !== null;

            return (
              <li key={person.id}>
                <Link
                  to={`/people/${person.id}`}
                  style={{ rotate: tiltFor(index), backgroundColor: swatches[person.colour].wash }}
                  className="flex min-h-28 flex-col items-center justify-center gap-1 rounded-card border-2 border-paper-edge p-3 shadow-lift"
                >
                  <span aria-hidden="true" className="text-2xl">
                    {identity.emoji}
                  </span>
                  <HandLabel size="md">{identity.name}</HandLabel>
                  {!filledIn && <span className="text-xs text-faded">not filled in yet</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
