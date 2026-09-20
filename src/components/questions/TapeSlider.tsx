import type { SliderQuestion } from '@/config/questionTypes';
import type { QuestionProps } from './types';

const DEFAULT_STOPS = 5;
const SCALE_MAX = 100;

/**
 * A slider with a handful of stops rather than a continuous track.
 *
 * Answers are stored as 0-100 rather than as a stop index, so changing a
 * question from five stops to seven later reads back sensibly instead of
 * turning "all the way left" into "middle".
 */
export function TapeSlider({ question, value, onChange }: QuestionProps<SliderQuestion>) {
  const stops = question.stops ?? DEFAULT_STOPS;
  const step = SCALE_MAX / (stops - 1);
  const [low, high] = question.ends;

  const position = typeof value === 'number' ? value : SCALE_MAX / 2;
  const activeStop = Math.round(position / step);

  return (
    <div>
      <div className="relative">
        <StopMarks stops={stops} activeStop={activeStop} answered={typeof value === 'number'} />
        <input
          type="range"
          min={0}
          max={SCALE_MAX}
          step={step}
          value={position}
          aria-label={question.label}
          aria-valuetext={describePosition(activeStop, stops, low, high)}
          onChange={(event) => onChange(Number(event.target.value))}
          className="relative h-11 w-full cursor-pointer accent-[var(--person-base)]"
        />
      </div>

      <div className="flex justify-between gap-4 text-xs text-ink-soft">
        <span className="max-w-[45%]">{low}</span>
        <span className="max-w-[45%] text-right">{high}</span>
      </div>
    </div>
  );
}

type StopMarksProps = { stops: number; activeStop: number; answered: boolean };

/** Dots sit behind the track so it is obvious the handle has places to land. */
function StopMarks({ stops, activeStop, answered }: StopMarksProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-1">
      {Array.from({ length: stops }, (_, index) => (
        <span
          key={index}
          className={`h-2 w-2 rounded-full ${
            answered && index === activeStop ? 'bg-ink' : 'bg-paper-edge'
          }`}
        />
      ))}
    </div>
  );
}

function describePosition(activeStop: number, stops: number, low: string, high: string): string {
  if (activeStop === 0) {
    return low;
  }

  if (activeStop === stops - 1) {
    return high;
  }

  return `${activeStop + 1} of ${stops}, between ${low} and ${high}`;
}
