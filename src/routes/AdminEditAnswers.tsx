import { useParams } from 'react-router-dom';
import { fetchPerson } from '@/data/people';
import { identityOf } from '@/lib/profileData';
import { useAsync } from '@/lib/useAsync';
import { AnswerEditor } from './Questionnaire';

/**
 * The admin editing one person's answers, for fixing a song or a picture that
 * would not go in from their end. Firestore rules already let the admin write
 * any card; this is only the screen for it.
 */
export function AdminEditAnswers() {
  const { personId = '' } = useParams();
  const person = useAsync(() => fetchPerson(personId), [personId]);

  if (person.status === 'loading') {
    return <p className="py-10 text-center text-ink-soft">Fetching their answers…</p>;
  }

  if (person.status === 'failed' || !person.value) {
    return <p className="py-10 text-center text-ink-soft">No one on the roster has that id.</p>;
  }

  return (
    <AnswerEditor
      personId={person.value.id}
      submitted={person.value.submittedAt !== null}
      heading={`Editing ${identityOf(person.value).name}`}
    />
  );
}
