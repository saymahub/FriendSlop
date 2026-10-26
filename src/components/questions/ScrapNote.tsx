import type { TextQuestion } from '@/config/questionTypes';
import { lastEmoji } from '@/lib/emoji';
import type { QuestionProps } from './types';

/**
 * Text is 16px minimum. Below that, iOS zooms the whole page the moment the
 * field takes focus, and most of this form gets filled in on a phone.
 */
const FIELD =
  'w-full rounded-card border-2 border-paper-edge bg-paper px-3 py-2 text-base placeholder:text-ghost';

export function ScrapNote({ question, value, onChange }: QuestionProps<TextQuestion>) {
  const text = typeof value === 'string' ? value : '';

  if (question.singleEmoji) {
    return (
      <input
        type="text"
        value={text}
        placeholder={question.placeholder}
        onChange={(event) => onChange(lastEmoji(event.target.value))}
        className={`${FIELD} max-w-28 text-center text-2xl`}
      />
    );
  }

  if (question.multiline) {
    return (
      <textarea
        rows={3}
        value={text}
        placeholder={question.placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={FIELD}
      />
    );
  }

  return (
    <input
      type="text"
      value={text}
      placeholder={question.placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={FIELD}
    />
  );
}
