import { Chip } from '@/components/primitives';
import type { SingleQuestion } from '@/config/questionTypes';
import type { QuestionProps } from './types';

export function ChipSelect({ question, value, onChange }: QuestionProps<SingleQuestion>) {
  return (
    <div className="flex flex-wrap gap-2">
      {question.options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          selected={value === option.value}
          onClick={() => onChange(option.value)}
        />
      ))}
    </div>
  );
}
