import { PaperCard } from '@/components/primitives';
import type { Question } from '@/config/questionTypes';
import type { Tally } from '@/lib/stats/tally';

/** A phone screen fits about this many rows before a chart stops being glanceable. */
const ROWS_SHOWN = 5;

type TallyChartProps = { question: Question; tallies: Tally[]; respondents: number };

/**
 * One question's most popular answers as horizontal bars. One series, so the
 * question is the title and there is no legend; the count sits at each bar's tip.
 */
export function TallyChart({ question, tallies, respondents }: TallyChartProps) {
  const shown = tallies.slice(0, ROWS_SHOWN);
  const most = shown[0]?.count ?? 1;

  return (
    <PaperCard>
      <h3 className="font-bold text-ink">{question.label}</h3>
      <p className="mb-3 text-xs text-faded">
        {respondents} {respondents === 1 ? 'person' : 'people'} answered
      </p>

      <ol className="space-y-2">
        {shown.map(({ pick, count }) => (
          <li key={pick.key} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-1.5 text-ink-soft">
              {pick.fill && (
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: pick.fill }}
                  className="h-3 w-3 shrink-0 rounded-full border border-ink/20"
                />
              )}
              <span className="break-words">{pick.label}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                style={{ width: `${(count / most) * 100}%` }}
                className="h-4 min-w-1 rounded-r-sm bg-ink-soft/70"
              />
              <span className="text-xs font-bold tabular-nums text-ink">{count}</span>
            </span>
          </li>
        ))}
      </ol>
    </PaperCard>
  );
}
