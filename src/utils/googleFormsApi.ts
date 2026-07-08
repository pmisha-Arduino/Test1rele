import { Question, QuestionType } from '../types';
import { QUESTIONS } from '../questionsData';

export interface FormCreationResult {
  formId: string;
  responderUri: string;
  editUri: string;
}

/**
 * Creates a Google Form Quiz using the provided OAuth access token.
 * Maps our custom 10 questions (including Single choice, Multiple Choice, and Table matching)
 * into a highly compatible, fully graded Google Form Quiz structure.
 */
export async function createGoogleFormQuiz(accessToken: string, title: string): Promise<FormCreationResult> {
  // Step 1: Create the empty Google Form
  const createResponse = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: title,
        documentTitle: title,
        description: 'Тематичний кваліфікаційний тест на тему: "Електромагнітні реле та їх застосування". Перевірка знань принципу дії, контактних груп та маркування.',
      }
    }),
  });

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    throw new Error(`Помилка створення форми: ${createResponse.statusText}. Деталі: ${errText}`);
  }

  const formData = await createResponse.json();
  const formId = formData.formId;
  const responderUri = formData.responderUri;
  const editUri = `https://docs.google.com/forms/d/${formId}/edit`;

  // Step 2: Build the batchUpdate payload to configure quiz settings and add graded questions
  const requests: any[] = [];

  // 1. Enable quiz setting
  requests.push({
    updateFormSettings: {
      settings: {
        quizSettings: {
          isQuiz: true,
        },
      },
      updateMask: 'quizSettings.isQuiz',
    },
  });

  let indexCounter = 0;

  // 2. Loop and map each question
  QUESTIONS.forEach((q) => {
    if (q.type === QuestionType.SINGLE) {
      requests.push({
        createItem: {
          item: {
            title: `Запитання №${q.id} [${q.category}]: ${q.questionText}`,
            description: q.explanation ? `Пояснення: ${q.explanation}` : undefined,
            questionItem: {
              question: {
                required: true,
                choiceQuestion: {
                  type: 'RADIO',
                  options: q.options.map((opt) => ({ value: opt })),
                },
                grading: {
                  pointValue: 1,
                  correctAnswers: {
                    answers: [{ value: q.options[q.correctAnswerIndex!] }],
                  },
                },
              },
            },
          },
          location: {
            index: indexCounter++,
          },
        },
      });
    } else if (q.type === QuestionType.MULTIPLE) {
      requests.push({
        createItem: {
          item: {
            title: `Запитання №${q.id} [${q.category}]: ${q.questionText} (Оберіть усі правильні варіанти)`,
            description: q.explanation ? `Пояснення: ${q.explanation}` : undefined,
            questionItem: {
              question: {
                required: true,
                choiceQuestion: {
                  type: 'CHECKBOX',
                  options: q.options.map((opt) => ({ value: opt })),
                },
                grading: {
                  pointValue: 1,
                  correctAnswers: {
                    answers: q.correctAnswerIndices!.map((idx) => ({ value: q.options[idx] })),
                  },
                },
              },
            },
          },
          location: {
            index: indexCounter++,
          },
        },
      });
    } else if (q.type === QuestionType.TABLE && q.rows && q.columns && q.correctMatches) {
      // For Table matching, we map each row to an independent, highly compatible multiple choice question
      // This is extremely robust and ensures flawless rendering on all platforms (mobile, web)
      q.rows.forEach((rowName, rIdx) => {
        const correctColumnValue = q.columns![q.correctMatches![rIdx]];
        requests.push({
          createItem: {
            item: {
              title: `Запитання №${q.id} [Встановлення відповідності - ${q.category}]: Співвіднесіть "${rowName}"`,
              description: rIdx === 0 && q.explanation ? `Пояснення до теми: ${q.explanation}` : undefined,
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: 'RADIO',
                    options: q.columns!.map((col) => ({ value: col })),
                  },
                  grading: {
                    pointValue: 1,
                    correctAnswers: {
                      answers: [{ value: correctColumnValue }],
                    },
                  },
                },
              },
            },
          },
          location: {
            index: indexCounter++,
          },
        });
      });
    }
  });

  // Call batchUpdate to apply all changes
  const updateResponse = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!updateResponse.ok) {
    const errText = await updateResponse.text();
    throw new Error(`Помилка налаштування та додавання запитань: ${updateResponse.statusText}. Деталі: ${errText}`);
  }

  return {
    formId,
    responderUri,
    editUri,
  };
}
