import { Tape } from '@/components/primitives';
import { BlockHeading } from '../BlockHeading';
import { questions } from '@/config/questions';
import { labelledAnswers, textAnswer } from '@/lib/answerDisplay';
import type { BlockProps } from '../blockTypes';

/**
 * Sizes and the other gift-giver details. Omitted outright for guests rather
 * than shown locked: a visible lock is an invitation to try the handle.
 */
export function EnvelopePocket({ profile }: BlockProps) {
  const entries = privateEntries(profile.answers);

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="relative rounded-card border-2 border-dashed border-[var(--person-base)] bg-paper/70 p-5">
      <Tape placement="top-right" />
      <BlockHeading>For gift-givers</BlockHeading>
      <p className="mb-3 text-xs text-faded">Only the group can see this.</p>

      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {entries.map((entry) => (
          <div key={entry.label}>
            <dt className="text-xs text-faded">{entry.label}</dt>
            <dd className="text-sm">{entry.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

type Entry = { label: string; value: string };

function privateEntries(answers: BlockProps['profile']['answers']): Entry[] {
  return questions
    .filter((question) => question.isPrivate && question.type !== 'slider')
    .map((question) => ({ label: question.label, value: displayValue(answers, question.id) }))
    .filter((entry) => entry.value !== '');
}

function displayValue(answers: BlockProps['profile']['answers'], questionId: string): string {
  const labels = labelledAnswers(answers, questionId);
  return labels.length > 0 ? labels.join(', ') : textAnswer(answers, questionId);
}
