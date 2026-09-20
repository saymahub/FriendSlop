import { HandLabel } from '@/components/primitives';
import type { AnswerValue, Question } from '@/config/questionTypes';
import { renderers } from './registry';

type QuestionFieldProps = {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
};

/**
 * The frame around every question: label, optional help, the private marker, and
 * the "prefer not to say" escape hatch that private questions must offer.
 */
export function QuestionField({ question, value, onChange }: QuestionFieldProps) {
  const Renderer = renderers[question.type];
  const declined = value === null;

  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-1 flex flex-wrap items-baseline gap-2">
        <HandLabel size="md">{question.label}</HandLabel>
        {question.isPrivate && <PrivateBadge />}
        {question.isOptional && <span className="text-xs text-faded">optional</span>}
      </legend>

      {question.help && <p className="mb-2 text-sm text-ink-soft">{question.help}</p>}

      {declined ? (
        <p className="text-sm text-faded italic">Skipped.</p>
      ) : (
        <Renderer question={question} value={value} onChange={onChange} />
      )}

      {question.isPrivate && (
        <button
          type="button"
          onClick={() => onChange(declined ? '' : null)}
          className="mt-4 ml-1 inline-block text-xs text-faded underline underline-offset-2"
        >
          {declined ? 'Actually, let me answer' : 'Prefer not to say'}
        </button>
      )}
    </fieldset>
  );
}

function PrivateBadge() {
  return (
    <span className="rounded-chip border border-paper-edge px-2 py-0.5 text-[10px] tracking-wide text-faded uppercase">
      Group only
    </span>
  );
}
