import type { DateQuestion } from '@/config/questionTypes';
import type { QuestionProps } from './types';

export function DatePad({ value, onChange }: QuestionProps<DateQuestion>) {
  return (
    <input
      type="date"
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-card border-2 border-paper-edge bg-paper px-3 py-2 text-base"
    />
  );
}
