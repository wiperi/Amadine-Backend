import {
  userRegister,
  quizCreate,
  clear,
  questionCreate,
  quizSessionCreate,
  quizDelete,
  quizSessionGetActivity,
  quizSessionUpdateState,
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
      const res1 = quizSessionGetStatus(token, quizId, res.body.newSessionId);
      expect(res1.statusCode).toBe(200);
      expect(res1.body.state).toStrictEqual('LOBBY');
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
    test('successfully create quiz session when autoStartNum is 0', () => {
      const res = quizSessionCreate(token, quizId, 0);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual({ newSessionId: expect.any(Number) });
      const res1 = quizSessionGetStatus(token, quizId, res.body.newSessionId);
      expect(res1.statusCode).toBe(200);
      expect(res1.body.state).toStrictEqual('QUESTION_COUNTDOWN');
    });
  });
});

describe('PUT /v1/admin/quiz/:quizId/session/:sessionId', () => {
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

describe('GET /v1/admin/quiz/:quizId/sessions', () => {
  beforeEach(() => {
    clear();
    // Register a user and get the token
    const res = userRegister('test@example.com', 'ValidPass123', 'John', 'Doe');
    expect(res.statusCode).toBe(200);
    token = res.body.token;

    // Create a quiz and a question
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;

    const createQuestionRes = questionCreate(token, quizId, {
      question: 'What is your favorite color?',
      duration: 60,
      points: 6,
      answers: [
        { answer: 'Red', correct: true },
        { answer: 'Blue', correct: false },
        { answer: 'Green', correct: false },
      ],
    });
    expect(createQuestionRes.statusCode).toBe(200);
  });
  describe('valid cases', () => {
    test('valid request should return active and inactive sessions', () => {
      // Create a session for this test
      const createQuizSessionRes = quizSessionCreate(token, quizId, 2);
      expect(createQuizSessionRes.statusCode).toBe(200);
      quizSessionId = createQuizSessionRes.body.newSessionId;

      const res = quizSessionGetActivity(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        activeSessions: expect.any(Array),
        inactiveSessions: expect.any(Array),
      });
      expect(res.body.activeSessions.length).toBeGreaterThan(0);
      expect(res.body.inactiveSessions.length).toBe(0);
    });

    test('valid request with no sessions should return empty arrays', () => {
      const res = quizSessionGetActivity(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        activeSessions: [],
        inactiveSessions: [],
      });
    });
    test('valid request with multiple active and inactive sessions', () => {
      // Create 3 active sessions
      const activeSessionIds = [];
      for (let i = 0; i < 3; i++) {
        const createSessionRes = quizSessionCreate(token, quizId, 2);
        expect(createSessionRes.statusCode).toBe(200);
        activeSessionIds.push(createSessionRes.body.newSessionId);
      }

      // Create 2 sessions and mark them as inactive using quizSessionUpdateState
      const inactiveSessionIds = [];
      for (let i = 0; i < 2; i++) {
        const createSessionRes = quizSessionCreate(token, quizId, 2); // Create session
        expect(createSessionRes.statusCode).toBe(200);
        const sessionId = createSessionRes.body.newSessionId;
        inactiveSessionIds.push(sessionId);

        // Mark this session as inactive using quizSessionUpdateState
        const updateRes = quizSessionUpdateState(token, quizId, sessionId, 'END');
        expect(updateRes.statusCode).toBe(200);
      }

      const res = quizSessionGetActivity(token, quizId);
      expect(res.statusCode).toBe(200);

      // Ensure that active and inactive sessions are returned correctly and sorted
      expect(res.body.activeSessions).toStrictEqual(activeSessionIds.sort((a, b) => a - b));
      expect(res.body.inactiveSessions).toStrictEqual(inactiveSessionIds.sort((a, b) => a - b));
    });
  });

  describe('invalid cases', () => {
    test('token is invalid', () => {
      const res = quizSessionGetActivity('invalid token', quizId);
      expect(res.statusCode).toStrictEqual(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('user is not an owner of this quiz', () => {
      const userRegisterRes = userRegister('wick@gmail.com', 'JohnWich123', 'John', 'Wick');
      expect(userRegisterRes.statusCode).toStrictEqual(200);
      const newToken = userRegisterRes.body.token;
      const res = quizSessionGetActivity(newToken, quizId);
      expect(res.statusCode).toStrictEqual(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('quiz does not exist', () => {
      const res = quizSessionGetActivity(token, 0);
      expect(res.statusCode).toStrictEqual(403);
      expect(res.body).toStrictEqual(ERROR);
    });
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
    const res = quizSessionCreate(token, quizId, 2);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({ newSessionId: expect.any(Number) });
    const sessionId = res.body.newSessionId;
    const res1 = quizSessionGetStatus(token, quizId, sessionId + 1);
    expect(res1.statusCode).toBe(400);
  });

  test.skip('valid cases', () => {
    const res = quizSessionCreate(token, quizId, 2);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({ newSessionId: expect.any(Number) });
    const sessionId = res.body.newSessionId;
    const res1 = quizSessionGetStatus(token, quizId, sessionId);
    expect(res1.statusCode).toBe(200);
    //WARNING: the following test is not correct, because the players array is empty
    // console.log(res1.body);
    // will be discussed with in Oct 24
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

  test('valid cases', () => {
    const res1 = quizSessionGetStatus(token, quizId, quizSessionId);
    expect(res1.statusCode).toBe(200);
    expect(res1.body).toStrictEqual({
      atQuestion: 1,
      state: 'LOBBY',
      players: [],
      metadata: {
        quizId: quizId,
        name: 'Test Quiz',
        description: 'A test quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        numQuestions: 1,
        duration: 60,
        thumbnailUrl: expect.any(String),
        questions: [
          {
            questionId: expect.any(Number),
            question: 'Are you my master?',
            duration: 60,
            points: 6,
            // warning!!:
            thumbnailUrl: expect.any(String),
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
          },
        ],
      },
    });
  });
});
