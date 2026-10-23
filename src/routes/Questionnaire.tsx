import { useBlocker, useNavigate } from 'react-router-dom';
import { Button, HandLabel, PaperCard, Stamp, Tape } from '@/components/primitives';
import { QuestionField } from '@/components/questions/QuestionField';
import { UnsavedChangesDialog } from '@/components/UnsavedChangesDialog';
import { questionsInSection, sections } from '@/config/questions';
import { isComplete, overallProgress, sectionProgress } from '@/lib/progress';
import { useUnloadWarning } from '@/lib/useUnloadWarning';
import { useViewer } from '@/state/ViewerContext';
import { useAnswers, type Answers } from '@/state/useAnswers';
import type { SectionId } from '@/config/questionTypes';

export function Questionnaire() {
  const { viewer, markSubmitted } = useViewer();

  if (viewer.kind !== 'member') {
    throw new Error('Questionnaire rendered for a viewer who has not claimed a card');
  }

  return <MemberForm personId={viewer.personId} submitted={viewer.submitted} onSubmit={markSubmitted} />;
}

type MemberFormProps = { personId: string; submitted: boolean; onSubmit: () => Promise<void> };

function MemberForm({ personId, submitted, onSubmit }: MemberFormProps) {
  const { answers, loading, error, setAnswer, save, discard, hasUnsavedChanges, saving } =
    useAnswers(personId);

  // Leaving by a link is interceptable; closing the tab is not, so the browser's
  // own warning covers that case.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  );
  useUnloadWarning(hasUnsavedChanges);

  const progress = overallProgress(answers);

  const handIn = async () => {
    await save(true);
    await onSubmit();
  };

  if (loading) {
    return <p className="py-10 text-center text-ink-soft">Fetching your answers…</p>;
  }

  return (
    <div>
      <header className="mb-8 flex flex-col items-center text-center">
        <HandLabel as="h1" size="hero" face="title" className="block">
          Your page
        </HandLabel>
        <div className="mt-3">
          <ProgressBar answered={progress.answered} total={progress.total} />
        </div>
        {submitted && (
          <div className="mt-3">
            <Stamp label="Submitted" />
          </div>
        )}
      </header>

      {error && <p className="mb-4 text-center text-sm text-allergy">{error}</p>}

      {sections.map((section) => (
        <SectionBlock
          key={section.id}
          sectionId={section.id}
          title={section.title}
          blurb={section.blurb}
          answers={answers}
          onChange={setAnswer}
        />
      ))}

      <SubmitPanel
        answers={answers}
        submitted={submitted}
        saving={saving}
        onSubmit={handIn}
        onSave={() => save(false)}
      />

      {blocker.state === 'blocked' && (
        <UnsavedChangesDialog
          onSave={async () => {
            await save(false);
            blocker.proceed();
          }}
          onDiscard={() => {
            discard();
            blocker.proceed();
          }}
          onCancel={() => blocker.reset()}
        />
      )}
    </div>
  );
}

type SectionBlockProps = {
  sectionId: SectionId;
  title: string;
  blurb: string;
  answers: Answers;
  onChange: (questionId: string, value: never) => void;
};

function SectionBlock({ sectionId, title, blurb, answers, onChange }: SectionBlockProps) {
  const done = sectionProgress(sectionId, answers);

  return (
    <section className="mb-8">
      <div className="mb-3">
        <HandLabel as="h2" size="lg" className="block">
          {title}
        </HandLabel>
        <p className="text-sm text-ink-soft">{blurb}</p>
        <p className="text-xs text-faded">
          {done.answered} of {done.total} answered
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {questionsInSection(sectionId).map((question) => (
          <PaperCard key={question.id}>
            <QuestionField
              question={question}
              value={answers[question.id]}
              onChange={(value) => onChange(question.id, value as never)}
            />
          </PaperCard>
        ))}
      </div>

      <Tape placement="inline" className="mt-8" />
    </section>
  );
}

/** Highest threshold first: the fill takes the greenest step it has reached. */
const PROGRESS_FILLS = [
  { from: 100, fill: 'bg-progress-100' },
  { from: 75, fill: 'bg-progress-75' },
  { from: 50, fill: 'bg-progress-50' },
  { from: 25, fill: 'bg-progress-25' },
] as const;

/** Their own colour to begin with, then a step greener at each quarter done. */
function fillFor(percent: number): string {
  return PROGRESS_FILLS.find((step) => percent >= step.from)?.fill ?? 'bg-[var(--person-base)]';
}

function ProgressBar({ answered, total }: { answered: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        role="progressbar"
        aria-valuenow={answered}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Questions answered"
        className="h-2.5 w-48 overflow-hidden rounded-chip border border-paper-edge bg-paper-deep"
      >
        <div style={{ width: `${percent}%` }} className={`h-full transition-colors duration-500 ${fillFor(percent)}`} />
      </div>
      <span className="text-xs text-faded">
        {answered} of {total}
      </span>
    </div>
  );
}

type SubmitPanelProps = {
  answers: Answers;
  submitted: boolean;
  saving: boolean;
  onSubmit: () => void;
  onSave: () => void;
};

function SubmitPanel({ answers, submitted, saving, onSubmit, onSave }: SubmitPanelProps) {
  const navigate = useNavigate();
  const ready = isComplete(answers);
  const remaining = overallProgress(answers);

  if (submitted) {
    return (
      <PaperCard className="text-center">
        <HandLabel size="lg">That&rsquo;s you done.</HandLabel>
        <p className="mt-1 mb-4 text-sm text-ink-soft">
          Everyone else&rsquo;s pages are open to you now. Edit anything here, then save again.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="keep" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
          <Button variant="quiet" onClick={() => navigate('/stats')}>
            Group stats
          </Button>
          <Button onClick={() => navigate('/me')}>See my page</Button>
        </div>
      </PaperCard>
    );
  }

  return (
    <PaperCard className="text-center">
      <HandLabel size="lg">Ready to unlock the rest?</HandLabel>
      <p className="mt-1 mb-4 text-sm text-ink-soft">
        {ready
          ? 'Everything is filled in. Submitting opens everyone else\u2019s pages.'
          : `${remaining.total - remaining.answered} still to go, but you can hand it in now and finish later.`}
      </p>
      <Button onClick={onSubmit} disabled={saving}>
        {saving ? 'Saving…' : 'Submit my page'}
      </Button>
    </PaperCard>
  );
}
