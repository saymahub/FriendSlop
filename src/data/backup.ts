import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Answers } from '@/state/useAnswers';

/**
 * Whole-database export and restore.
 *
 * The free Firestore plan has no scheduled backups, so a file you download
 * occasionally is the only safety net this project gets. Everything is admin
 * only, enforced by the rules rather than by hiding the buttons.
 */

const BACKUP_VERSION = 1;

export type Backup = {
  version: number;
  exportedAt: string;
  people: BackupPerson[];
  claims: { uid: string; personId: string; submitted: boolean }[];
};

type BackupPerson = {
  id: string;
  name: string;
  colour: string;
  emoji: string;
  order: number;
  hidden: boolean;
  claimedBy: string | null;
  claimVersion: number;
  answers: Answers;
  privateAnswers: Answers;
  /** ISO string rather than a Firestore Timestamp, so the file is readable. */
  submittedAt: string | null;
};

export async function exportEverything(): Promise<Backup> {
  const [people, claims] = await Promise.all([
    getDocs(collection(db, 'people')),
    getDocs(collection(db, 'claims')),
  ]);

  const exported = await Promise.all(
    people.docs.map(async (entry) => {
      const data = entry.data();
      const privateDoc = await getDoc(doc(db, 'people', entry.id, 'private', 'data'));
      const submittedAt = data.submittedAt as Timestamp | null;

      return {
        id: entry.id,
        name: data.name,
        colour: data.colour,
        emoji: data.emoji,
        order: data.order ?? 0,
        hidden: data.hidden ?? false,
        claimedBy: data.claimedBy ?? null,
        claimVersion: data.claimVersion ?? 1,
        answers: (data.answers ?? {}) as Answers,
        privateAnswers: (privateDoc.data()?.answers ?? {}) as Answers,
        submittedAt: submittedAt ? submittedAt.toDate().toISOString() : null,
      } satisfies BackupPerson;
    }),
  );

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    people: exported,
    claims: claims.docs.map((entry) => ({
      uid: entry.id,
      personId: entry.data().personId,
      submitted: entry.data().submitted ?? false,
    })),
  };
}

/** Writes a backup back over the database. Existing documents are replaced. */
export async function restoreEverything(backup: Backup): Promise<number> {
  if (backup.version !== BACKUP_VERSION) {
    throw new Error(`That file is version ${backup.version}, and this app reads version ${BACKUP_VERSION}.`);
  }

  await Promise.all(
    backup.people.map(async (person) => {
      await setDoc(doc(db, 'people', person.id), {
        name: person.name,
        colour: person.colour,
        emoji: person.emoji,
        order: person.order,
        hidden: person.hidden,
        claimedBy: person.claimedBy,
        claimVersion: person.claimVersion,
        answers: person.answers,
        submittedAt: person.submittedAt ? Timestamp.fromDate(new Date(person.submittedAt)) : null,
        updatedAt: Timestamp.now(),
      });

      await setDoc(doc(db, 'people', person.id, 'private', 'data'), { answers: person.privateAnswers });
    }),
  );

  await Promise.all(
    backup.claims.map((claim) =>
      setDoc(doc(db, 'claims', claim.uid), { personId: claim.personId, submitted: claim.submitted }),
    ),
  );

  return backup.people.length;
}

/**
 * Empties everyone's answers while leaving the roster, PINs and claims in place.
 * For clearing test entries without making everybody claim their card again.
 */
export async function clearAllAnswers(): Promise<number> {
  const [people, claims] = await Promise.all([
    getDocs(collection(db, 'people')),
    getDocs(collection(db, 'claims')),
  ]);

  await Promise.all(
    people.docs.map(async (entry) => {
      await setDoc(
        doc(db, 'people', entry.id),
        { answers: {}, submittedAt: null, updatedAt: Timestamp.now() },
        { merge: true },
      );
      await deleteDoc(doc(db, 'people', entry.id, 'private', 'data'));
    }),
  );

  // Leaving submitted true would keep the vault open on an empty page.
  await Promise.all(
    claims.docs.map((entry) =>
      setDoc(doc(db, 'claims', entry.id), { submitted: false }, { merge: true }),
    ),
  );

  return people.size;
}

export function downloadBackup(backup: Backup): void {
  const stamp = backup.exportedAt.slice(0, 10);
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }),
  );

  const link = document.createElement('a');
  link.href = url;
  link.download = `friendslop-${stamp}.json`;
  link.click();

  URL.revokeObjectURL(url);
}
