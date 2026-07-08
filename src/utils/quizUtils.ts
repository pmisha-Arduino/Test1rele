import { Question, QuestionType, StudentAttempt } from '../types';

// Check if student answer is 100% correct
export const isAnswerCorrect = (question: Question, studentAnswer: any): boolean => {
  if (studentAnswer === undefined || studentAnswer === null) return false;

  switch (question.type) {
    case QuestionType.SINGLE:
      return Number(studentAnswer) === question.correctAnswerIndex;

    case QuestionType.MULTIPLE: {
      if (!Array.isArray(studentAnswer)) return false;
      const studentSet = new Set(studentAnswer.map(Number));
      const correctSet = new Set(question.correctAnswerIndices);
      if (studentSet.size !== correctSet.size) return false;
      for (const idx of correctSet) {
        if (!studentSet.has(idx)) return false;
      }
      return true;
    }

    case QuestionType.TABLE: {
      if (typeof studentAnswer !== 'object' || studentAnswer === null) return false;
      const rows = question.rows;
      for (let r = 0; r < rows.length; r++) {
        const studentCol = studentAnswer[r];
        const correctCol = question.correctMatches[r];
        if (studentCol === undefined || Number(studentCol) !== correctCol) {
          return false;
        }
      }
      return true;
    }

    default:
      return false;
  }
};

// Calculate category-wise statistics
export const calculateCategoryScores = (questions: Question[], answers: { [id: number]: any }) => {
  const stats: { [category: string]: { correct: number; total: number } } = {};

  questions.forEach((q) => {
    if (!stats[q.category]) {
      stats[q.category] = { correct: 0, total: 0 };
    }
    stats[q.category].total += 1;
    if (isAnswerCorrect(q, answers[q.id])) {
      stats[q.category].correct += 1;
    }
  });

  return stats;
};

// Pre-seeded attempts for lecturers
const MOCK_ATTEMPTS: StudentAttempt[] = [
  {
    id: 'att-1',
    studentName: 'Олександр Коваленко',
    timestamp: new Date(Date.now() - 4 * 3600000).toLocaleString('uk-UA'),
    score: 8,
    durationSeconds: 340,
    answers: {
      1: 1, // Correct
      2: 1, // Correct
      3: 1, // Correct
      4: 1, // Correct
      5: [0, 1, 2], // Correct
      6: [0, 1], // Incomplete (Missing 2)
      7: [0, 1, 2], // Correct
      8: [0, 1], // Incomplete (Missing 2)
      9: { 0: 0, 1: 1, 2: 2 }, // Correct
      10: { 0: 0, 1: 1, 2: 2 }, // Correct
    },
    categoryScores: {
      'Принцип дії': { correct: 2, total: 2 },
      'Типи контактів': { correct: 2, total: 3 },
      'Призначення та застосування': { correct: 2, total: 2 },
      'Кількість контактів': { correct: 2, total: 3 },
    }
  },
  {
    id: 'att-2',
    studentName: 'Марія Шевченко',
    timestamp: new Date(Date.now() - 2 * 3600000).toLocaleString('uk-UA'),
    score: 10,
    durationSeconds: 285,
    answers: {
      1: 1, 2: 1, 3: 1, 4: 1,
      5: [0, 1, 2], 6: [0, 1, 2], 7: [0, 1, 2], 8: [0, 1, 2],
      9: { 0: 0, 1: 1, 2: 2 }, 10: { 0: 0, 1: 1, 2: 2 }
    },
    categoryScores: {
      'Принцип дії': { correct: 2, total: 2 },
      'Типи контактів': { correct: 3, total: 3 },
      'Призначення та застосування': { correct: 2, total: 2 },
      'Кількість контактів': { correct: 3, total: 3 },
    }
  },
  {
    id: 'att-3',
    studentName: 'Дмитро Мельник',
    timestamp: new Date(Date.now() - 20 * 3600000).toLocaleString('uk-UA'),
    score: 6,
    durationSeconds: 512,
    answers: {
      1: 0, // Incorrect
      2: 1, // Correct
      3: 1, // Correct
      4: 2, // Incorrect
      5: [0, 1], // Incomplete
      6: [0, 1, 2], // Correct
      7: [0, 1, 2], // Correct
      8: [0], // Incomplete
      9: { 0: 0, 1: 1, 2: 2 }, // Correct
      10: { 0: 1, 1: 0, 2: 2 } // Incorrect
    },
    categoryScores: {
      'Принцип дії': { correct: 1, total: 2 },
      'Типи контактів': { correct: 3, total: 3 },
      'Призначення та застосування': { correct: 2, total: 2 },
      'Кількість контактів': { correct: 0, total: 3 },
    }
  },
  {
    id: 'att-4',
    studentName: 'Ірина Бондар',
    timestamp: new Date(Date.now() - 32 * 3600000).toLocaleString('uk-UA'),
    score: 9,
    durationSeconds: 420,
    answers: {
      1: 1, 2: 1, 3: 1, 4: 1,
      5: [0, 1, 2], 6: [0, 1, 2], 7: [0, 1, 3], // Wrong
      8: [0, 1, 2], 9: { 0: 0, 1: 1, 2: 2 }, 10: { 0: 0, 1: 1, 2: 2 }
    },
    categoryScores: {
      'Принцип дії': { correct: 2, total: 2 },
      'Типи контактів': { correct: 3, total: 3 },
      'Призначення та застосування': { correct: 1, total: 2 },
      'Кількість контактів': { correct: 3, total: 3 },
    }
  },
  {
    id: 'att-5',
    studentName: 'Артем Кравченко',
    timestamp: new Date(Date.now() - 48 * 3600000).toLocaleString('uk-UA'),
    score: 7,
    durationSeconds: 310,
    answers: {
      1: 1, 2: 0, 3: 1, 4: 1,
      5: [0, 2], 6: [0, 1, 2], 7: [0, 1, 2], 8: [0, 1],
      9: { 0: 0, 1: 1, 2: 2 }, 10: { 0: 0, 1: 1, 2: 0 }
    },
    categoryScores: {
      'Принцип дії': { correct: 1, total: 2 },
      'Типи контактів': { correct: 2, total: 3 },
      'Призначення та застосування': { correct: 2, total: 2 },
      'Кількість контактів': { correct: 2, total: 3 },
    }
  }
];

// Load history from localStorage
export const loadAttempts = (): StudentAttempt[] => {
  const saved = localStorage.getItem('relay_quiz_attempts');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing saved attempts, resetting to seed data.', e);
    }
  }
  // Initialize with seed data if empty
  localStorage.setItem('relay_quiz_attempts', JSON.stringify(MOCK_ATTEMPTS));
  return MOCK_ATTEMPTS;
};

// Save a new attempt to localStorage
export const saveAttempt = (attempt: Omit<StudentAttempt, 'id' | 'timestamp'>): StudentAttempt => {
  const fullAttempt: StudentAttempt = {
    ...attempt,
    id: 'att-' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toLocaleString('uk-UA'),
  };

  const current = loadAttempts();
  const updated = [fullAttempt, ...current];
  localStorage.setItem('relay_quiz_attempts', JSON.stringify(updated));
  return fullAttempt;
};

// Clear history or reset to mock
export const resetAttempts = (keepMock = true) => {
  if (keepMock) {
    localStorage.setItem('relay_quiz_attempts', JSON.stringify(MOCK_ATTEMPTS));
    return MOCK_ATTEMPTS;
  } else {
    localStorage.setItem('relay_quiz_attempts', JSON.stringify([]));
    return [];
  }
};
