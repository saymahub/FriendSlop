import { useCallback, useState } from 'react';
import { isPictureAnswer, type LookupQuestion, type PictureAnswer } from '@/config/questionTypes';
import { searchPictures, type LookupResult } from '@/lib/lookup';
import { useSearch } from '@/lib/lookup/useSearch';
import { SearchMatches, type Match } from './SearchMatches';
import type { QuestionProps } from './types';

const FIELD = 'w-full rounded-card border-2 border-paper-edge bg-paper px-3 py-2 text-base placeholder:text-ghost';

const toMatch = (result: LookupResult): Match => ({ key: `${result.title}-${result.image}`, ...result });

/**
 * A text field that offers matching pictures as you type. Picking one stores the
 * title with its picture; typing anything stores plain text, so something too
 * niche for search is still a complete answer, just shown without a picture.
 */
export function PictureSearch({ question, value, onChange }: QuestionProps<LookupQuestion>) {
  const picked = isPictureAnswer(value) ? value : undefined;
  const text = picked?.title ?? (typeof value === 'string' ? value : '');
  const [searching, setSearching] = useState(false);
  const search = useCallback((term: string) => searchPictures(question.source, term), [question.source]);
  const results = useSearch(search, text, searching && !picked);

  const type = (next: string) => {
    setSearching(true);
    onChange(next);
  };

  const choose = (result: LookupResult) => {
    setSearching(false);
    onChange({ title: result.title, image: result.image } satisfies PictureAnswer);
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        placeholder={question.placeholder}
        onChange={(event) => type(event.target.value)}
        className={FIELD}
      />
      {picked ? (
        <PickedPicture picked={picked} onRemove={() => onChange(picked.title)} />
      ) : (
        <SearchMatches state={results} toMatch={toMatch} onChoose={choose} />
      )}
    </div>
  );
}

function PickedPicture({ picked, onRemove }: { picked: PictureAnswer; onRemove: () => void }) {
  return (
    <div className="mt-2 flex items-center gap-3">
      <img src={picked.image} alt="" className="h-16 w-16 rounded-photo border border-paper-edge object-cover" />
      <button type="button" onClick={onRemove} className="min-h-11 text-sm text-ink-soft underline">
        Remove picture
      </button>
    </div>
  );
}
