import {
  userRegister,
  quizCreate,
  clear,
  questionCreate,
  quizSessionCreate,
  quizDelete,
} from './helpers';

const ERROR = { error: expect.any(String) };

let token: string;
let quizId: number;

beforeEach(() => {
  clear();
  // Register a user and get the token
  const res = userRegister('test@example.com', 'ValidPass123', 'John', 'Doe');
  expect(res.statusCode).toBe(200);
  token = res.body.token;

  // Create a quiz
  const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
  expect(createQuizRes.statusCode).toBe(200);
  quizId = createQuizRes.body.quizId;

  // Create a question
  const createQuestionRes = questionCreate(token, quizId, {
    question: 'Are you my master?',
    duration: 60,
    points: 6,
    answers: [
      { answer: 'Yes', correct: true },
      { answer: 'No', correct: false },
      { answer: 'Maybe', correct: false },
    ],
  });
  expect(createQuestionRes.statusCode).toBe(200);
});

afterAll(() => {
  clear();
});

/*
 This is test for AQSC
 */
describe('POST /v1/admin/quiz/:quizId/session/start', () => {
  describe('invalid cases', () => {
    test('token is invalid', () => {
      const res = quizSessionCreate('invalid token', quizId, 2);
      expect(res.statusCode).toStrictEqual(401);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('user is not an owner of this quiz', () => {
      const userRegisterRes = userRegister('wick@gmail.com', 'JohnWich123', 'John', 'Wick');
      expect(userRegisterRes.statusCode).toStrictEqual(200);
      const token1 = userRegisterRes.body.token;
      const res = quizSessionCreate(token1, quizId, 2);
      expect(res.statusCode).toStrictEqual(403);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('quiz does not exist', () => {
      const res = quizSessionCreate(token, 0, 2);
      expect(res.statusCode).toStrictEqual(403);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('no question in quiz', () => {
      const createQuizRes = quizCreate(token, 'Test Quizzes', 'A test quiz for quizzes');
      expect(createQuizRes.statusCode).toBe(200);
      quizId = createQuizRes.body.quizId;
      const res = quizSessionCreate(token, quizId, 1);
      expect(res.statusCode).toStrictEqual(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('autoStartNum is a number greater than 50', () => {
      const res = quizSessionCreate(token, quizId, 51);
      expect(res.statusCode).toStrictEqual(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('autoStartNum is a number less than 0', () => {
      const res = quizSessionCreate(token, quizId, -1);
      expect(res.statusCode).toStrictEqual(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('more than 10 sessions that are not in END state currently exist for this quiz', () => {
      for (let i = 0; i < 10; i++) {
        const res = quizSessionCreate(token, quizId, 2);
        expect(res.statusCode).toStrictEqual(200);
      }
      const res = quizSessionCreate(token, quizId, 2);
      expect(res.statusCode).toStrictEqual(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('quiz is in trash', () => {
      quizDelete(token, quizId);
      const res = quizSessionCreate(token, quizId, 2);
      expect(res.statusCode).toStrictEqual(400);
      expect(res.body).toStrictEqual(ERROR);
    });
  });
  describe('valid cases', () => {
    test('successfully create quiz session', () => {
      const res = quizSessionCreate(token, quizId, 2);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual({ newSessionId: expect.any(Number) });
    });
    test('successfully create quiz session when 9 sessions that are not in END state currently exist for this quiz', () => {
      for (let i = 0; i < 9; i++) {
        const res = quizSessionCreate(token, quizId, 2);
        expect(res.statusCode).toStrictEqual(200);
      }
      const res = quizSessionCreate(token, quizId, 2);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual({ newSessionId: expect.any(Number) });
    });
  });
});
