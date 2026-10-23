import type { SliderQuestion } from '@/config/questionTypes';
import type { GroupMember } from '@/data/people';
import { submittedSliderAnswer } from '@/lib/answerDisplay';

/** People who put the slider in the same place, so they can be drawn as one stack. */
export type SliderStop = { position: number; members: GroupMember[] };

export type SliderSpread = { stops: SliderStop[] };

/** Where everyone landed on one slider, or undefined when nobody moved it. */
export function spreadOf(question: SliderQuestion, group: readonly GroupMember[]): SliderSpread | undefined {
  const placed = group
    .map((member) => ({ member, position: submittedSliderAnswer(member.answers, question.id) }))
    .filter((entry): entry is { member: GroupMember; position: number } => entry.position !== undefined);

  if (placed.length === 0) {
    return undefined;
  }

  const stops = new Map<number, GroupMember[]>();
  for (const { member, position } of placed) {
    stops.set(position, [...(stops.get(position) ?? []), member]);
  }

  return { stops: [...stops.entries()].map(([position, members]) => ({ position, members })) };
}
