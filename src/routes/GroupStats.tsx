import { useState } from 'react';
import { identityOf } from '@/lib/profileData';
import { HandLabel, PaperCard } from '@/components/primitives';
import { SafeArea } from '@/components/SafeArea';
import { questionsInSection, questions, sections } from '@/config/questions';
import type { Section, SliderQuestion } from '@/config/questionTypes';
import { fetchSubmittedGroup, type GroupMember } from '@/data/people';
import { BlockHeading } from '@/profile/BlockHeading';
import { isChoiceQuestion } from '@/lib/stats/picks';
import { spreadOf, type SliderSpread } from '@/lib/stats/spread';
import { respondentsTo, tallyOf } from '@/lib/stats/tally';
import { rankTwins } from '@/lib/stats/twins';
import { useAsync } from '@/lib/useAsync';
import { useViewer } from '@/state/ViewerContext';
import { SliderSpreadChart } from '@/stats/SliderSpreadChart';
import { TallyChart } from '@/stats/TallyChart';
import { TwinBoard } from '@/stats/TwinBoard';

/** With fewer pages than this, "most popular" just means "what one person said". */
const MINIMUM_GROUP = 2;

/**
 * The group as a whole, counted from submitted pages only: a half-filled draft
 * would skew the numbers and show answers someone has not finished choosing.
 */
export function GroupStats() {
  const group = useAsync(fetchSubmittedGroup, []);

  return (
    <div className="flex flex-col gap-8">
      <HandLabel as="h1" size="hero" face="title" className="block text-center">
        Group stats
      </HandLabel>

      {group.status === 'loading' && <p className="text-center text-ink-soft">Counting everyone up…</p>}
      {group.status === 'failed' && <p className="text-center text-ink-soft">{group.message}</p>}
      {group.status === 'ready' && <StatsBody group={group.value} />}
    </div>
  );
}

function StatsBody({ group }: { group: GroupMember[] }) {
  if (group.length < MINIMUM_GROUP) {
    return (
      <PaperCard className="text-center">
        <p className="text-ink-soft">Stats appear once at least {MINIMUM_GROUP} people have submitted their pages.</p>
      </PaperCard>
    );
  }

  return (
    <>
      <p className="-mt-6 text-center text-sm text-faded">From {group.length} submitted pages.</p>
      <SafeArea>
        <Twins group={group} />
      </SafeArea>
      <SafeArea>
        <Spreads group={group} />
      </SafeArea>
      {sections.map((section) => (
        <SafeArea key={section.id}>
          <Favourites section={section} group={group} />
        </SafeArea>
      ))}
    </>
  );
}

/**
 * A member sees their own twins. The admin has no page of their own, so they pick
 * whose twins to look at instead.
 */
function Twins({ group }: { group: GroupMember[] }) {
  const { viewer } = useViewer();

  if (viewer.kind === 'admin') {
    return <AdminTwins group={group} />;
  }

  const me = viewer.kind === 'member' ? group.find((member) => member.person.id === viewer.personId) : undefined;
  return me ? <TwinBoard twins={rankTwins(me, group)} /> : null;
}

function AdminTwins({ group }: { group: GroupMember[] }) {
  const [chosenId, setChosenId] = useState(group[0]?.person.id ?? '');
  const chosen = group.find((member) => member.person.id === chosenId);

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        Twins as
        <select
          value={chosenId}
          onChange={(event) => setChosenId(event.target.value)}
          className="min-h-11 rounded-card border-2 border-paper-edge bg-paper px-2 text-base text-ink"
        >
          {group.map((member) => (
            <option key={member.person.id} value={member.person.id}>
              {identityOf(member.person).name}
            </option>
          ))}
        </select>
      </label>
      {chosen && <TwinBoard twins={rankTwins(chosen, group)} />}
    </div>
  );
}

function Spreads({ group }: { group: GroupMember[] }) {
  const spreads = questions
    .filter((question): question is SliderQuestion => question.type === 'slider')
    .map((question) => ({ question, spread: spreadOf(question, group) }))
    .filter((entry): entry is { question: SliderQuestion; spread: SliderSpread } => entry.spread !== undefined);

  if (spreads.length === 0) {
    return null;
  }

  return (
    <PaperCard>
      <BlockHeading>Where the group lands</BlockHeading>
      <div className="space-y-5">
        {spreads.map(({ question, spread }) => (
          <SliderSpreadChart key={question.id} question={question} spread={spread} />
        ))}
      </div>
    </PaperCard>
  );
}

function Favourites({ section, group }: { section: Section; group: GroupMember[] }) {
  const charts = questionsInSection(section.id)
    .filter(isChoiceQuestion)
    .map((question) => ({ question, tallies: tallyOf(question, group), respondents: respondentsTo(question, group) }))
    .filter((chart) => chart.tallies.length > 0);

  if (charts.length === 0) {
    return null;
  }

  return (
    <section>
      <HandLabel as="h2" size="lg" className="mb-3 block">
        {section.title}
      </HandLabel>
      <div className="grid gap-4 sm:grid-cols-2">
        {charts.map((chart) => (
          <TallyChart key={chart.question.id} {...chart} />
        ))}
      </div>
    </section>
  );
}
