import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Maps an auth uid to the card it owns.
 *
 * It exists because Firestore rules cannot run queries: to decide whether the
 * caller has submitted, the rules need a document at a path they can derive
 * from `request.auth.uid` alone.
 */
export type Claim = {
  personId: string;
  submitted: boolean;
};

const CLAIMS = 'claims';

export async function fetchClaim(uid: string): Promise<Claim | undefined> {
  const snapshot = await getDoc(doc(db, CLAIMS, uid));
  return snapshot.exists() ? (snapshot.data() as Claim) : undefined;
}

export function writeClaim(uid: string, claim: Claim): Promise<void> {
  return setDoc(doc(db, CLAIMS, uid), claim);
}

/** Admin only: drops the index entry alongside clearing `claimedBy`. */
export function deleteClaim(uid: string): Promise<void> {
  return deleteDoc(doc(db, CLAIMS, uid));
}
