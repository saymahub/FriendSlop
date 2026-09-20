import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAnswers, saveAnswers } from '@/data/people';
import { clearStored, readStored, writeStored } from '@/lib/storage';
import type { AnswerValue } from '@/config/questionTypes';

export type Answers = Record<string, AnswerValue>;

const DRAFT_DELAY_MS = 800;

/**
 * Work in progress, on this device only. Not the profile: nobody else can see
 * it, and it exists so a closed tab does not cost someone 40 answers.
 */
const draftKey = (personId: string) => `meet-the-gang:draft:${personId}`;

export type AnswersState = {
  answers: Answers;
  loading: boolean;
  error: string;
  setAnswer: (questionId: string, value: AnswerValue) => void;
  save: (submitting: boolean) => Promise<void>;
  discard: () => void;
  hasUnsavedChanges: boolean;
  saving: boolean;
};

/**
 * Holds one person's answers while they work, keeps a local draft as they go,
 * and writes to Firestore only when `save` runs from the submit button.
 */
export function useAnswers(personId: string): AnswersState {
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const pendingDraft = useRef<number | undefined>(undefined);
  const latestAnswers = useRef<Answers>({});
  const isDirty = useRef(false);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError('');

    fetchAnswers(personId)
      .then((saved) => {
        if (!current) {
          return;
        }

        // A draft is newer than what was saved, so it wins on reload.
        const draft = readStored<Answers | null>(draftKey(personId), null);
        const restored = draft ?? saved;

        latestAnswers.current = restored;
        isDirty.current = draft !== null;
        setAnswers(restored);
        setHasUnsavedChanges(draft !== null);
        setLoading(false);
      })
      .catch(() => {
        if (current) {
          setError('Could not load your answers. Check your connection and reload.');
          setLoading(false);
        }
      });

    return () => {
      current = false;
    };
  }, [personId]);

  // A tab closed inside the debounce window would otherwise lose the last edit.
  useEffect(() => {
    const flush = () => {
      if (isDirty.current) {
        writeStored(draftKey(personId), latestAnswers.current);
      }
    };

    window.addEventListener('pagehide', flush);

    return () => {
      window.clearTimeout(pendingDraft.current);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [personId]);

  const setAnswer = useCallback(
    (questionId: string, value: AnswerValue) => {
      setAnswers((current) => {
        const next = { ...current, [questionId]: value };
        latestAnswers.current = next;

        window.clearTimeout(pendingDraft.current);
        pendingDraft.current = window.setTimeout(() => writeStored(draftKey(personId), next), DRAFT_DELAY_MS);

        return next;
      });

      isDirty.current = true;
      setHasUnsavedChanges(true);
    },
    [personId],
  );

  const save = useCallback(
    async (submitting: boolean) => {
      window.clearTimeout(pendingDraft.current);
      setSaving(true);
      setError('');

      try {
        await saveAnswers(personId, latestAnswers.current, submitting);
        clearStored(draftKey(personId));
        isDirty.current = false;
        setHasUnsavedChanges(false);
      } catch {
        setError('Could not save. Your answers are still here, try again in a moment.');
        throw new Error('save failed');
      } finally {
        setSaving(false);
      }
    },
    [personId],
  );

  /** Throws away edits since the last save and goes back to what is stored. */
  const discard = useCallback(() => {
    window.clearTimeout(pendingDraft.current);
    clearStored(draftKey(personId));

    fetchAnswers(personId).then((saved) => {
      latestAnswers.current = saved;
      setAnswers(saved);
    });

    isDirty.current = false;
    setHasUnsavedChanges(false);
  }, [personId]);

  return { answers, loading, error, setAnswer, save, discard, hasUnsavedChanges, saving };
}
