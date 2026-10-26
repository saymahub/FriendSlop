import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { roster } from '@/config/roster';
import { loadRosterNames } from '@/config/rosterNames';
import type { SwatchId } from '@/config/swatches';
import type { Answers } from '@/state/useAnswers';
import { swatches } from '@/config/swatches';
import { cleanAnswers } from './answerShape';
import { mergeAnswers, splitAnswers } from './answerSplit';

/**
 * A person as stored. Public answers live on this document; the gifting section
 * lives in `people/{id}/private/data`, which rules serve only to the group.
 */
export type PersonDoc = {
  id: string;
  name: string;
  colour: SwatchId;
  emoji: string;
  order: number;
  hidden: boolean;
  /** The uid that owns this card, or null while it is free to claim. */
  claimedBy: string | null;
  /** Bumped by an admin PIN reset, which retires the old auth account. */
  claimVersion: number;
  answers: Answers;
  submittedAt: Timestamp | null;
};

const PEOPLE = 'people';
const PRIVATE_DOC = ['private', 'data'] as const;

export async function fetchPeople(): Promise<PersonDoc[]> {
  const snapshot = await getDocs(collection(db, PEOPLE));

  return snapshot.docs
    .map((entry) => toPerson(entry.id, entry.data()))
    .filter((person) => !person.hidden)
    .sort((left, right) => left.order - right.order);
}

export async function fetchPerson(personId: string): Promise<PersonDoc | undefined> {
  const snapshot = await getDoc(doc(db, PEOPLE, personId));
  return snapshot.exists() ? toPerson(snapshot.id, snapshot.data()) : undefined;
}

/**
 * Private answers, or an empty map when the viewer is not allowed them. A guest
 * hitting this gets a permission error from Firestore, which is the system
 * working rather than a fault to report.
 */
export async function fetchPrivateAnswers(personId: string): Promise<Answers> {
  try {
    const snapshot = await getDoc(doc(db, PEOPLE, personId, ...PRIVATE_DOC));
    return snapshot.exists() ? cleanAnswers(snapshot.data().answers) : {};
  } catch {
    return {};
  }
}

export async function fetchAnswers(personId: string): Promise<Answers> {
  const [person, privateAnswers] = await Promise.all([
    fetchPerson(personId),
    fetchPrivateAnswers(personId),
  ]);

  return mergeAnswers(person?.answers ?? {}, privateAnswers);
}

/** Someone who has handed their page in, with both halves of their answers. */
export type GroupMember = { person: PersonDoc; answers: Answers };

/**
 * Everyone who has submitted, private answers included. Only the group and the
 * admin may read those, so this is for vault screens; a guest would get the
 * public half only.
 */
export async function fetchSubmittedGroup(): Promise<GroupMember[]> {
  const submitted = (await fetchPeople()).filter((person) => person.submittedAt !== null);

  return Promise.all(
    submitted.map(async (person) => ({
      person,
      answers: mergeAnswers(person.answers, await fetchPrivateAnswers(person.id)),
    })),
  );
}

/** Writes both halves of someone's answers, and stamps the submission. */
export async function saveAnswers(personId: string, answers: Answers, submitting: boolean): Promise<void> {
  const { publicAnswers, privateAnswers } = splitAnswers(answers);

  await updateDoc(doc(db, PEOPLE, personId), {
    answers: publicAnswers,
    updatedAt: serverTimestamp(),
    ...(submitting ? { submittedAt: serverTimestamp() } : {}),
  });

  await setDoc(doc(db, PEOPLE, personId, ...PRIVATE_DOC), { answers: privateAnswers });
}

export function claimPerson(personId: string, uid: string): Promise<void> {
  return updateDoc(doc(db, PEOPLE, personId), { claimedBy: uid, updatedAt: serverTimestamp() });
}

/** Admin only, per the rules: creates any roster entry that does not exist yet. */
export async function seedRoster(): Promise<number> {
  const names = await loadRosterNames();
  const existing = await getDocs(collection(db, PEOPLE));
  const known = new Set(existing.docs.map((entry) => entry.id));
  const missing = roster.filter((person) => !known.has(person.id));

  await Promise.all(
    missing.map((person, index) =>
      setDoc(doc(db, PEOPLE, person.id), {
        name: names[person.id],
        colour: person.colour,
        emoji: person.emoji,
        order: known.size + index,
        hidden: false,
        claimedBy: null,
        claimVersion: 1,
        answers: {},
        submittedAt: null,
        updatedAt: serverTimestamp(),
      }),
    ),
  );

  return missing.length;
}

/**
 * Admin only: deletes every person, their private answers and every claim.
 *
 * For clearing test data before the real roster goes in. Deleting a document
 * does not delete its subcollections, so the private half is removed explicitly
 * rather than left behind as an orphan.
 */
export async function wipeEveryone(): Promise<number> {
  const [people, claims] = await Promise.all([
    getDocs(collection(db, PEOPLE)),
    getDocs(collection(db, 'claims')),
  ]);

  await Promise.all(
    people.docs.map(async (entry) => {
      await deleteDoc(doc(db, PEOPLE, entry.id, ...PRIVATE_DOC));
      await deleteDoc(doc(db, PEOPLE, entry.id));
    }),
  );

  await Promise.all(claims.docs.map((entry) => deleteDoc(doc(db, 'claims', entry.id))));

  return people.size;
}

/** Admin only: retires the current PIN so the person can set a new one. */
export function resetPin(personId: string, claimVersion: number): Promise<void> {
  return updateDoc(doc(db, PEOPLE, personId), {
    claimedBy: null,
    claimVersion: claimVersion + 1,
    updatedAt: serverTimestamp(),
  });
}

/**
 * A card as read back, every field checked. People can write to their own card by
 * going around the site, so a field of the wrong kind (a colour that is not a
 * swatch, a name that is not text) falls back to a safe value instead of
 * crashing the name grid or a profile for everyone.
 */
function toPerson(id: string, data: Record<string, unknown>): PersonDoc {
  return {
    id,
    name: typeof data.name === 'string' ? data.name : id,
    colour: typeof data.colour === 'string' && Object.hasOwn(swatches, data.colour) ? (data.colour as SwatchId) : 'stone',
    emoji: typeof data.emoji === 'string' ? data.emoji : '📎',
    order: typeof data.order === 'number' && Number.isFinite(data.order) ? data.order : 0,
    hidden: data.hidden === true,
    claimedBy: typeof data.claimedBy === 'string' ? data.claimedBy : null,
    claimVersion: typeof data.claimVersion === 'number' && data.claimVersion >= 1 ? data.claimVersion : 1,
    answers: cleanAnswers(data.answers),
    submittedAt: isTimestamp(data.submittedAt) ? data.submittedAt : null,
  };
}

function isTimestamp(value: unknown): value is Timestamp {
  return typeof value === 'object' && value !== null && typeof (value as Timestamp).toMillis === 'function';
}
