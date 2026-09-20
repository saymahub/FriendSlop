import { HandLabel, PaperCard } from '@/components/primitives';

/**
 * Stands in for the vault screens until step 4 builds them. It exists so the
 * navigation and the submission gate can be walked end to end now.
 */
export function ComingSoon({ title, note }: { title: string; note: string }) {
  return (
    <PaperCard tiltSeed={title} className="text-center">
      <HandLabel size="lg">{title}</HandLabel>
      <p className="mt-2 text-sm text-ink-soft">{note}</p>
    </PaperCard>
  );
}
