import type { FC } from 'react';
import type { QuestionType } from '@/config/questionTypes';
import type { QuestionProps } from './types';
import { ChipMultiSelect } from './ChipMultiSelect';
import { ChipSelect } from './ChipSelect';
import { DatePad } from './DatePad';
import { ScrapNote } from './ScrapNote';
import { SongSearch } from './SongSearch';
import { SwatchGrid } from './SwatchGrid';
import { TapeSlider } from './TapeSlider';

/**
 * Question type to component. Nothing else in the app branches on question type:
 * adding a type means writing one component and adding one line here.
 */
export const renderers: Record<QuestionType, FC<QuestionProps>> = {
  single: ChipSelect as FC<QuestionProps>,
  multi: ChipMultiSelect as FC<QuestionProps>,
  text: ScrapNote as FC<QuestionProps>,
  slider: TapeSlider as FC<QuestionProps>,
  swatch: SwatchGrid as FC<QuestionProps>,
  song: SongSearch as FC<QuestionProps>,
  date: DatePad as FC<QuestionProps>,
};
