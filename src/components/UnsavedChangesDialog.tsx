import { useEffect, useRef } from 'react';
import { Button, HandLabel } from '@/components/primitives';

type UnsavedChangesDialogProps = {
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};

/**
 * Shown when someone navigates away from the questionnaire with edits they have
 * not saved. Cancel is the safe default, so dismissing it never loses work.
 */
export function UnsavedChangesDialog({ onSave, onDiscard, onCancel }: UnsavedChangesDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => cancelRef.current?.focus(), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-title"
        className="w-full max-w-sm rounded-card border-2 border-paper-edge bg-paper p-5 text-center shadow-lift"
      >
        <HandLabel as="h2" size="lg" className="block">
          <span id="unsaved-title">You have unsaved changes</span>
        </HandLabel>
        <p className="mt-2 mb-4 text-sm text-ink-soft">
          Save them to your page, or throw them away and keep what you last saved.
        </p>

        <div className="flex flex-col gap-2">
          <Button onClick={onSave}>Save and carry on</Button>
          <Button variant="quiet" onClick={onDiscard}>
            Discard changes
          </Button>
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-11 text-sm text-faded underline underline-offset-2"
          >
            Stay on this page
          </button>
        </div>
      </div>
    </div>
  );
}
