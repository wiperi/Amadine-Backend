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
  playerJoinSession,
  quizSessionGetFinalResult,
  succ,
  err,
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
    duration: 1,
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
    describe('valid cases', () => {
      // Tests for valid cases will be added here by guangwei
      // use test each to test each valid outbound action
      test('LOBBY -> (GO_TO_END) -> END', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'END');
        expect(res.statusCode).toBe(200);
        const statusInfo = quizSessionGetStatus(token, quizId, quizSessionId);
        expect(statusInfo.statusCode).toBe(200);
        expect(statusInfo.body.state).toBe('END');
      });

      test('LOBBY -> (NEXT_QUESTION) -> QUESTION_COUNTDOWN', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
        expect(res.statusCode).toBe(200);

        const statusInfo = quizSessionGetStatus(token, quizId, quizSessionId);
        expect(statusInfo.statusCode).toBe(200);
        expect(statusInfo.body.state).toBe('QUESTION_COUNTDOWN');
      });
    });

    describe('invalid cases', () => {
      test('INVALID ACTION: SKIP_COUNTDOWN', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });

      test('INVALID ACTION: GO_TO_ANSWER', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_ANSWER');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });

      test('INVALID ACTION: GO_TO_FINAL_RESULTS', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_FINAL_RESULTS');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });
    });
  });

  describe('END state', () => {
    beforeEach(() => {
      const res = quizSessionUpdateState(token, quizId, quizSessionId, 'END');
      expect(res.statusCode).toBe(200);

      const statusInfo = quizSessionGetStatus(token, quizId, quizSessionId);
      expect(statusInfo.statusCode).toBe(200);
      expect(statusInfo.body.state).toBe('END');
    });
    describe('invalid case', () => {
      test('INVALID ACTION: SKIP_COUNTDOWN', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });

      test('INVALID ACTION: NEXT_QUESTION', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });

      test('INVALID ACTION: GO_TO_ANSWER', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_ANSWER');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });

      test('INVALID ACTION: GO_TO_FINAL_RESULTS', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_FINAL_RESULTS');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });
    });
  });

  describe('QUESTION_COUNTDOWN state', () => {
    // Tests for QUESTION_COUNTDOWN state will be added here by yibin
  });

  describe('QUESTION_OPEN state', () => {
    // Tests for QUESTION_OPEN state will be added here by cheong
    let playerId: number;
    beforeEach(() => {
      // Join a not started session
      const res = playerJoinSession(quizSessionId, 'Peter Griffin');
      expect(res.statusCode).toBe(200);
      playerId = res.body.playerId;

      // Start the first question
      const updateRes = quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
      expect(updateRes.statusCode).toBe(200);
      quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');
    });
    describe('valid cases', () => {
      test('go to the end', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'END');
        expect(res.statusCode).toBe(200);
        const stateRes = quizSessionGetStatus(token, quizId, quizSessionId);
        expect(stateRes.body.state).toBe('END');
      });
      test('duration is up ', () => {
        // wait for the duration to be up
        async () => {
          // goto question_close state
          // LOBBY -> (NEXT_QUESTION)-> QUESTION_COUNTDOWN -> (SKIP_COUNTDOWN) -> QUESTION_OPEN -> QUESTION_CLOSE
          quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
          quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');

          // wait for 1 seconds (duration)
          await new Promise(resolve => setTimeout(resolve, 1000));

          // use get quizSession status to ensure quizSession is in state QUESTION_CLOSE
          const getStatusInfo = quizSessionGetStatus(token, quizId, quizSessionId);
          expect(getStatusInfo.statusCode).toBe(200);
          expect(getStatusInfo.body.state).toBe('QUESTION_CLOSE');
        };
      });
    });
    describe('invalid cases', () => {
      test('INVALID ACTION: NOT IN ENUM', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'INVALID_ACTION');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });
      test('INVALID ACTION: GO TO NEXT QUESTION', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });
      test('INVALID ACTION: GO TO FINAL RESULT', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_FINAL_RESULT');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });
      test('INVALID ACTION: SKIP COUNTDOWN', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });
    });
  });

  describe('QUESTION_CLOSE state', () => {
    beforeEach(async () => {
      // goto question_close state
      // LOBBY -> (NEXT_QUESTION)-> QUESTION_COUNTDOWN -> (SKIP_COUNTDOWN) -> QUESTION_OPEN -> QUESTION_CLOSE
      quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
      quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');

      await new Promise(resolve => setTimeout(resolve, 1000));

      // use get quizSession status to ensure quizSession is in state QUESTION_CLOSE
      const getStatusInfo = quizSessionGetStatus(token, quizId, quizSessionId);
      expect(getStatusInfo.statusCode).toBe(200);
      expect(getStatusInfo.body.state).toBe('QUESTION_CLOSE');
    });

    describe('valid cases', () => {
      test('QUESTION_CLOSE -> (END) -> END', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'END');
        expect(res.statusCode).toBe(200);
        const statusInfo = quizSessionGetStatus(token, quizId, quizSessionId);
        expect(statusInfo.statusCode).toBe(200);
        expect(statusInfo.body.state).toBe('END');
      });

      test('QUESTION_CLOSE -> (GO_TO_FINAL_RESULTS) -> FINAL_RESULTS', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_FINAL_RESULTS');
        expect(res.statusCode).toBe(200);
        const statusInfo = quizSessionGetStatus(token, quizId, quizSessionId);
        expect(statusInfo.statusCode).toBe(200);
        expect(statusInfo.body.state).toBe('FINAL_RESULTS');
      });

      test('QUESTION_CLOSE -> (GO_TO_ANSWER) -> ANSWER_SHOW', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_ANSWER');
        expect(res.statusCode).toBe(200);
        const statusInfo = quizSessionGetStatus(token, quizId, quizSessionId);
        expect(statusInfo.statusCode).toBe(200);
        expect(statusInfo.body.state).toBe('ANSWER_SHOW');
      });

      test('QUESTION_CLOSE -> (NEXT_QUESTION) -> QUESTION_COUNTDOWN', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
        expect(res.statusCode).toBe(200);
        const statusInfo = quizSessionGetStatus(token, quizId, quizSessionId);
        expect(statusInfo.statusCode).toBe(200);
        expect(statusInfo.body.state).toBe('QUESTION_COUNTDOWN');
      });
    });

    describe('invalid cases', () => {
      test('QUESTION_CLOSE -> (WRONG ACTION) -> END', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });
    });
  });

  describe('FINAL_RESULT state', () => {
    beforeEach(async () => {
      // goto question_close state
      // LOBBY -> (NEXT_QUESTION)-> QUESTION_COUNTDOWN -> (SKIP_COUNTDOWN) -> QUESTION_OPEN -> QUESTION_CLOSE
      quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
      quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');

      await new Promise(resolve => setTimeout(resolve, 1000));

      let getStatusInfo = quizSessionGetStatus(token, quizId, quizSessionId);
      expect(getStatusInfo.statusCode).toBe(200);
      expect(getStatusInfo.body.state).toBe('QUESTION_CLOSE');
      quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_FINAL_RESULTS');
      getStatusInfo = quizSessionGetStatus(token, quizId, quizSessionId);
      expect(getStatusInfo.statusCode).toBe(200);
      expect(getStatusInfo.body.state).toBe('FINAL_RESULTS');
    });
    describe('valid cases', () => {
      test('go to the end', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'END');
        expect(res.statusCode).toBe(200);
        const stateRes = quizSessionGetStatus(token, quizId, quizSessionId);
        expect(stateRes.body.state).toBe('END');
      });
    });
    describe('invalid cases', () => {
      test('INVALID ACTION: NOT IN ENUM', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'INVALID_ACTION');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });
      test('INVALID ACTION: GO TO NEXT QUESTION', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });
      test('INVALID ACTION: GO TO QUESTION OPEN', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_ANSWER');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });
      test('INVALID ACTION: SKIP COUNTDOWN', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });
    });
  });

  describe('ANSWER_SHOW state', () => {
    beforeEach(() => {
      const res = playerJoinSession(quizSessionId, 'John Wick');
      expect(res.statusCode).toBe(200);
      // goto ANSWER_SHOW state
      // LOBBY -> (NEXT_QUESTION)-> QUESTION_COUNTDOWN -> (SKIP_COUNTDOWN) -> QUESTION_OPEN -> (GO_TO_ANSWER) -> ANSWER_SHOW
      quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
      quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');
      quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_ANSWER');

      // use get quizSession status to ensure quizSession is in state ANSWER_SHOW
      const getStatusInfo = quizSessionGetStatus(token, quizId, quizSessionId);
      expect(getStatusInfo.statusCode).toBe(200);
      expect(getStatusInfo.body.state).toBe('ANSWER_SHOW');
    });
    describe('valid cases', () => {
      test('ANSWER_SHOW -> (END) -> END', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'END');
        expect(res.statusCode).toBe(200);
        const statusInfo = quizSessionGetStatus(token, quizId, quizSessionId);
        expect(statusInfo.statusCode).toBe(200);
        expect(statusInfo.body.state).toBe('END');
      });

      test('ANSWER_SHOW -> (GO_TO_FINAL_RESULTS) -> FINAL_RESULTS', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_FINAL_RESULTS');
        expect(res.statusCode).toBe(200);
        const statusInfo = quizSessionGetStatus(token, quizId, quizSessionId);
        expect(statusInfo.statusCode).toBe(200);
        expect(statusInfo.body.state).toBe('FINAL_RESULTS');
      });

      test('ANSWER_SHOW -> (NEXT_QUESTION) -> QUESTION_COUNTDOWN', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
        expect(res.statusCode).toBe(200);
        const statusInfo = quizSessionGetStatus(token, quizId, quizSessionId);
        expect(statusInfo.statusCode).toBe(200);
        expect(statusInfo.body.state).toBe('QUESTION_COUNTDOWN');
      });
    });

    describe('invalid cases', () => {
      test('ANSWER_SHOW -> (GO_TO_ANSWER))', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_ANSWER');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });
      test('ANSWER_SHOW -> (SKIP_COUNTDOWN)', () => {
        const res = quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual(ERROR);
      });
    });
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
    const res1 = quizSessionGetStatus(token, quizId, quizSessionId + 1);
    expect(res1.statusCode).toBe(400);
  });

  test('valid cases', () => {
    const res1 = quizSessionGetStatus(token, quizId, quizSessionId);
    expect(res1.statusCode).toBe(200);
    expect(res1.body).toStrictEqual({
      atQuestion: 0,
      state: 'LOBBY',
      players: [],
      metadata: {
        quizId: quizId,
        name: 'Test Quiz',
        description: 'A test quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        numQuestions: 1,
        duration: 1,
        thumbnailUrl: expect.any(String),
        questions: [
          {
            questionId: expect.any(Number),
            question: 'Are you my master?',
            duration: 1,
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


// // Tests for QuizSessionFinalResults
// describe.skip('GET /v1/admin/quiz/:quizId/session/:sessionId/results', () => {
//   let quizId: number;
//   let quizSessionId: number;
//   let playerIds: number[];
//   let questionId: number;
//   let correctAnsIds: number[];
//   let wrongAnsIds: number[];
//   beforeEach(() => {
//     // Create new quiz
//     // Create new question
//     // Create new quiz session
//     // Create new players
//     // Get correct and wrong answer ids
//   });


//   describe('valid cases', () => {
//     test('valid request', () => {
//       succ(quizSessionGetFinalResult(token, quizId, quizSessionId));
//     });
//   });
//   describe('invalid cases', () => {
//     test('Session Id does not refer to a valid session within this quiz', () => {
//       err(quizSessionGetFinalResult(token, 123, 123), 400);
//     });
//   });
// });
