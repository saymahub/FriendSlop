import { useState } from 'react';
import { Chip } from '@/components/primitives';
import { asSelection, toggleCapped } from '@/lib/selection';
import type { MultiQuestion } from '@/config/questionTypes';
import type { QuestionProps } from './types';

const OTHER_PREFIX = 'other:';

export function ChipMultiSelect({ question, value, onChange }: QuestionProps<MultiQuestion>) {
  const selected = asSelection(value);
  const otherEntry = selected.find((item) => item.startsWith(OTHER_PREFIX));
  const [showOther, setShowOther] = useState(otherEntry !== undefined);

  const toggle = (optionValue: string) => onChange(toggleCapped(selected, optionValue, question.max));

  const setOtherText = (text: string) => {
    const withoutOther = selected.filter((item) => !item.startsWith(OTHER_PREFIX));
    onChange(text.trim() ? [...withoutOther, `${OTHER_PREFIX}${text}`] : withoutOther);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={selected.includes(option.value)}
            badge={badgeFor(question, selected, option.value)}
            onClick={() => toggle(option.value)}
          />
        ))}
        <Chip label="Something else" selected={showOther} onClick={() => setShowOther(!showOther)} />
      </div>

      {showOther && (
        <input
          type="text"
          defaultValue={otherEntry?.slice(OTHER_PREFIX.length) ?? ''}
          onChange={(event) => setOtherText(event.target.value)}
          placeholder="Tell us what"
          className="mt-3 w-full rounded-card border-2 border-paper-edge bg-paper px-3 py-2 text-base"
        />
      )}

      {question.max !== undefined && (
        <p className="mt-2 text-xs text-faded">
          Pick up to {question.max}. A new pick replaces your oldest.
        </p>
      )}
    </div>
  );
}

/** Numbered badges only earn their place when the order of picks is capped. */
function badgeFor(question: MultiQuestion, selected: string[], optionValue: string): number | undefined {
  if (question.max === undefined) {
    return undefined;
  }

  const position = selected.indexOf(optionValue);
  return position === -1 ? undefined : position + 1;
}
