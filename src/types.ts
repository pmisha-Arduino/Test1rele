export enum QuestionType {
  SINGLE = 'SINGLE',
  MULTIPLE = 'MULTIPLE',
  TABLE = 'TABLE',
}

export interface BaseQuestion {
  id: number;
  type: QuestionType;
  category: 'Принцип дії' | 'Типи контактів' | 'Призначення та застосування' | 'Кількість контактів';
  questionText: string;
  explanation: string;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: QuestionType.SINGLE;
  options: string[];
  correctAnswerIndex: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: QuestionType.MULTIPLE;
  options: string[];
  correctAnswerIndices: number[];
}

export interface TableQuestion extends BaseQuestion {
  type: QuestionType.TABLE;
  rows: string[];
  columns: string[];
  correctMatches: { [rowIndex: number]: number }; // rowIdx -> correct colIdx
}

export type Question = SingleChoiceQuestion | MultipleChoiceQuestion | TableQuestion;

export interface StudentAttempt {
  id: string;
  studentName: string;
  timestamp: string;
  score: number; // Correct out of 10
  answers: {
    [questionId: number]: any; // single: number, multiple: number[], table: { [row: number]: number }
  };
  durationSeconds: number;
  categoryScores: {
    [category: string]: { correct: number; total: number };
  };
}
