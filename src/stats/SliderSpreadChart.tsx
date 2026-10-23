import { identityOf } from '@/lib/profileData';
import type { SliderQuestion } from '@/config/questionTypes';
import type { SliderSpread } from '@/lib/stats/spread';

type SliderSpreadChartProps = { question: SliderQuestion; spread: SliderSpread };

/**
 * Everyone's emoji along one slider, stacked where people landed on the same
 * stop, with a faint tick marking the centre. Ends are words, like the slider.
 */
export function SliderSpreadChart({ question, spread }: SliderSpreadChartProps) {
  const [low, high] = question.ends;
  const tallest = Math.max(...spread.stops.map((stop) => stop.members.length));

  return (
    <div>
      <p className="text-sm font-bold text-ink-soft">{question.label}</p>

      <div style={{ height: `${tallest * 1.6 + 1.5}rem` }} className="relative mx-3 mt-1">
        <span className="absolute inset-x-0 bottom-2 h-1 rounded-chip bg-paper-edge" />
        <CentreTick />
        {spread.stops.map((stop) => (
          <ul
            key={stop.position}
            style={{ left: `${stop.position}%` }}
            className="absolute bottom-4 flex -translate-x-1/2 flex-col-reverse items-center"
          >
            {stop.members.map((member) => (
              <EmojiPin key={member.person.id} member={member} />
            ))}
          </ul>
        ))}
      </div>

      <div className="flex justify-between gap-4 text-xs text-faded">
        <span className="max-w-[45%]">{low}</span>
        <span className="max-w-[45%] text-right">{high}</span>
      </div>
    </div>
  );
}

/**
 * A faint tick at the centre, so where someone sits reads against neutral. An SVG
 * line with crisp edges snaps to whole pixels, so every chart draws it at the same
 * weight; a 2px box at a fractional position blurs across three.
 */
function CentreTick() {
  return (
    <svg aria-hidden="true" className="absolute inset-x-0 bottom-0 h-5 w-full overflow-visible text-ink/35">
      <line x1="50%" x2="50%" y1="0" y2="100%" stroke="currentColor" strokeWidth="2" shapeRendering="crispEdges" />
    </svg>
  );
}

function EmojiPin({ member }: { member: SliderSpread['stops'][number]['members'][number] }) {
  const { name, emoji } = identityOf(member.person);

  return (
    <li className="text-lg leading-6">
      <span role="img" aria-label={name} title={name}>
        {emoji}
      </span>
    </li>
  );
}
