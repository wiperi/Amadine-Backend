import {
  quizGetDetails,
  quizCreate,
  questionCreate,
} from './helpers';

import { userRegister, clear } from '../v1/helpers';

const ERROR = { error: expect.any(String) };

let token: string;
beforeEach(() => {
  clear();
  // Register a user and get the token
  const res = userRegister('test@example.com', 'ValidPass123', 'John', 'Doe');
  expect(res.statusCode).toBe(200);
  token = res.body.token;
});

afterAll(() => {
  clear();
});

// test for quiz info
describe('GET /v2/admin/quiz/:quizId', () => {
  describe('valid cases', () => {
    test('successful quiz retrieval', () => {
      const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
      const { quizId } = createQuizRes.body;
      const createQuestionRes = questionCreate(token, quizId, {
        question: 'Are you my master?',
        duration: 60,
        points: 6,
        answers: [
          { answer: 'Yes', correct: true },
          { answer: 'No', correct: false },
          { answer: 'Maybe', correct: false },
        ],
        //refer to api, it shouldn't be empty and should be a valid url
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      });
      expect(createQuestionRes.statusCode).toBe(200);
      expect(createQuizRes.statusCode).toBe(200);
      const res = quizGetDetails(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        quizId,
        name: 'Test Quiz',
        description: 'A test quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        numQuestions: 1,
        questions: [
          {
            questionId: createQuestionRes.body.questionId,
            question: 'Are you my master?',
            duration: 60,
            points: 6,
            answers: [
              {
                answer: 'Yes',
                correct: true,
                answerId: expect.any(Number),
                colour: expect.any(String),
              },
              {
                answer: 'No',
                correct: false,
                answerId: expect.any(Number),
                colour: expect.any(String),
              },
              {
                answer: 'Maybe',
                correct: false,
                answerId: expect.any(Number),
                colour: expect.any(String),
              },
            ],
            thumbnailUrl: 'http://google.com/some/image/path.jpg',
          },
        ],
        duration: 60,
        thumbnailUrl: '#',
      });
    });
  });
});

// test for quiz remove
describe('DELETE /v2/admin/quiz/:quizid', () => {
  let quizId: number;

  beforeEach(() => {
    // Create a quiz before each test in this suite
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;
  });

  describe('invalid cases', () => {
    // will be implemented after quizSessionUpdate
    test.todo('session for this quiz is not in END state');
  });
});

// test for quiz transfer
describe('POST /v2/admin/quiz/:quizid/transfer', () => {
  let quizId: number;

  beforeEach(() => {
    // Create a quiz before each test
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId; // Store quizId for reuse
  });

  describe('invalid cases', () => {
    // will be implemented after quizSessionUpdate
    test.todo('session for this quiz is not in END state');
  });
});
