import {
  userRegister,
  quizCreate,
  clear,
  questionCreate,
  quizSessionCreate,
  playerJoinSession,
  quizSessionUpdateState,
  quizSessionGetStatus,
  playerGetQuestionInfo,
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

/**
 * test for playerJoin
 */
describe('POST /v1/player/join', () => {
  describe('invalid cases', () => {
    test('name of the user is not unique', () => {
      const res = playerJoinSession(quizSessionId, 'Peter Griffin');
      expect(res.statusCode).toBe(200);
      const errorRes = playerJoinSession(quizSessionId, 'Peter Griffin');
      expect(errorRes.statusCode).toBe(400);
      expect(errorRes.body).toStrictEqual(ERROR);
    });

    test('sessionId does not refer to a valid session', () => {
      const res = playerJoinSession(0, 'Peter Griffin');
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('session is not in LOBBY state', () => {
      const res = quizSessionUpdateState(token, quizId, quizSessionId, 'END');
      expect(res.statusCode).toBe(200);
      const playerJoinRes = playerJoinSession(quizSessionId, 'Peter Griffin');
      expect(playerJoinRes.statusCode).toBe(400);
      expect(playerJoinRes.body).toStrictEqual(ERROR);
    });
  });

  describe('valid cases', () => {
    test('should be successful when enter a empty string for name', () => {
      const res = playerJoinSession(quizSessionId, '');
      expect(res.statusCode).toBe(200);
    });

    test('have correct return type', () => {
      const res = playerJoinSession(quizSessionId, 'Peter Griffin');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({ playerId: expect.any(Number) });
    });

    test('two player return different playerId', () => {
      const res1 = playerJoinSession(quizSessionId, 'Peter Griffin');
      const res2 = playerJoinSession(quizSessionId, 'Glen Quagmire');
      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
      expect(res1.body.playerId).not.toStrictEqual(res2.body.playerId);
    });

    test('player sucessfully joined quizSession', () => {
      const res = playerJoinSession(quizSessionId, 'Peter Griffin');
      expect(res.statusCode).toBe(200);
      const getInfoRes = quizSessionGetStatus(token, quizId, quizSessionId);
      expect(getInfoRes.statusCode).toBe(200);
      expect(getInfoRes.body.players).toStrictEqual(['Peter Griffin']);
    });

    test('multiple players sucessfully joined quizSession', () => {
      const res1 = playerJoinSession(quizSessionId, 'Peter Griffin');
      const res2 = playerJoinSession(quizSessionId, 'Glen Quagmire');
      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
      const getInfoRes = quizSessionGetStatus(token, quizId, quizSessionId);
      expect(getInfoRes.statusCode).toBe(200);
      expect(getInfoRes.body.players).toStrictEqual(['Peter Griffin', 'Glen Quagmire']);
    });
  });
});

describe('GET /v1/player/:playerId/question/:questionposition', () => {
  let playerId: number;
  beforeEach(() => {
    const res = playerJoinSession(quizSessionId, 'Peter Griffin');
    expect(res.statusCode).toBe(200);
    playerId = res.body.playerId;
  });

  describe('invalid cases', () => {
    test('playerId does not refer to a valid player', () => {
      const errorRes = playerGetQuestionInfo(playerId + 1, 0);
      expect(errorRes.statusCode).toBe(400);
      expect(errorRes.body).toStrictEqual(ERROR);
    });

    //If question position is not valid for the session this player is in
    test('questionPosition does not refer to a valid question', () => {
      const errorRes = playerGetQuestionInfo(playerId, 100);
      expect(errorRes.statusCode).toBe(400);
      expect(errorRes.body).toStrictEqual(ERROR);
    });
    // If session is not currently on this question
    test('session is not currently on this question', () => {
      const errorRes = playerGetQuestionInfo(playerId, 4567898765);
      expect(errorRes.statusCode).toBe(400);
      expect(errorRes.body).toStrictEqual(ERROR);
    });
    // Session is in LOBBY, QUESTION_COUNTDOWN, FINAL_RESULTS or END state
    test('player is not in PLAYING state', () => {
      const res = quizSessionUpdateState(token, quizId, quizSessionId, 'END');
      expect(res.statusCode).toBe(200);
      const errorRes = playerGetQuestionInfo(playerId, 1);
      expect(errorRes.statusCode).toBe(400);
      expect(errorRes.body).toStrictEqual(ERROR);
    });
  });

  describe('valid cases', () => {
    test('player get correct question info', () => {
      quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
      quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');

      const res = playerGetQuestionInfo(playerId, 1);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        questionId: expect.any(Number),
        question: 'Are you my master?',
        duration: 60,
        thumbnailUrl: expect.any(String),
        points: 6,
        answers: [
          { answerId: expect.any(Number), answer: 'Yes', colour: expect.any(String) },
          { answerId: expect.any(Number), answer: 'No', colour: expect.any(String) },
          { answerId: expect.any(Number), answer: 'Maybe', colour: expect.any(String) },
        ],
      });
    });
  });
});
