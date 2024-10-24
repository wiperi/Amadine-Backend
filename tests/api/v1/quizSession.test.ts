import {
  userRegister,
  quizCreate,
  clear,
  questionCreate,
  quizSessionCreate,
  quizDelete,
  quizSessionGetStatus,
} from './helpers';

const ERROR = { error: expect.any(String) };

let token: string;
let quizId: number;
let quizSessionId: number;

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

  // Create a quiz session
  const createQuizSessionRes = quizSessionCreate(token, quizId, 2);
  expect(createQuizSessionRes.statusCode).toBe(200);
  quizSessionId = createQuizSessionRes.body.newSessionId;
});

afterAll(() => {
  clear();
});

/*
 This is test for AQSC
 */
describe('POST /v1/admin/quiz/:quizId/session/start', () => {
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

describe('POST /v1/admin/quiz/:quizId/session/:sessionId/update', () => {
  describe('LOBBY state', () => {
    // Tests for LOBBY state will be added here by guangwei

    // beforeEach(() => {
    //   // Go to TARGET_STATE from LOBBY state
    // });

    describe('valid cases', () => {
      // Tests for valid cases will be added here by guangwei
      // use test each to test each valid outbound action
    });

    describe('invalid cases', () => {
      // Tests for invalid cases will be added here by guangwei
      // use test each to test each invalid outbound action
    });
  });

  describe('END state', () => {
    // Tests for END state will be added here by guangwei
  });

  describe('QUESTION_COUNTDOWN state', () => {
    // Tests for QUESTION_COUNTDOWN state will be added here by yibin
  });

  describe('QUESTION_OPEN state', () => {
    // Tests for QUESTION_OPEN state will be added here by cheong
  });

  describe('QUESTION_CLOSE state', () => {
    // Tests for QUESTION_CLOSE state will be added here by yuting
  });

  describe('FINAL_RESULT state', () => {
    // Tests for FINAL_RESULT state will be added here by cheong
  });

  describe('ANSWER_SHOW state', () => {
    // Tests for ANSWER_SHOW state will be added here by yibin
  });
});
/////////////////////////////////////////////
// Test for AdminQuizSessionGetStatus /////////////
/////////////////////////////////////////////
describe('GET /v1/admin/quiz/:quizId/session/:sessionId', () => {
  test('empty token', () => {
    const res = quizSessionGetStatus('', 1, 1);
    expect(res.statusCode).toBe(401);
    expect(res.body).toStrictEqual(ERROR);
  });
  test('invalid token', () => {
    const res = quizSessionGetStatus('invalid token', 1, 1);
    expect(res.statusCode).toBe(401);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('user is not the owner of the quiz', () => {
    const userRegisterRes = userRegister('cheong1024@mail.com', 'Cheong1024', 'Cheong', 'Zhang');
    expect(userRegisterRes.statusCode).toBe(200);
    const token1 = userRegisterRes.body.token;
    const quizId = 1;
    const res = quizSessionGetStatus(token1, quizId, quizId);
    expect(res.statusCode).toBe(403);
  });

  test('Session Id does not refer to a valid session within this quiz', () => {
    const res1 = quizSessionGetStatus(token, quizId, quizSessionId + 1);
    expect(res1.statusCode).toBe(400);
  });

  test.skip('valid cases', () => {
    const res1 = quizSessionGetStatus(token, quizId, quizSessionId);
    expect(res1.statusCode).toBe(200);
    //WARNING: the following test is not correct, because the players array is empty
    // console.log(res1.body);
    // will be discussed with in Oct 24
  });
});
