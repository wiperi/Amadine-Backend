import {
  userRegister,
  quizCreate,
  clear,
  questionCreate,
  quizSessionCreate,
  playerJoinSession,
  quizSessionUpdateState,
  quizSessionGetStatus,
  questionUpdate,
  playerGetQuestionInfo,
  playerSubmitAnswer,
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
  let createQuestionRes = questionCreate(token, quizId, {
    question: 'Are you my master?',
    duration: 60,
    points: 6,
    answers: [
      { answer: 'Yes', correct: true },
      { answer: 'You are puppets', correct: true },
      { answer: 'No', correct: false },
      { answer: 'Who knows', correct: false },
    ],
  });
  createQuestionRes = questionCreate(token, quizId, {
    question: 'Blue pill or red pill?',
    duration: 60,
    points: 5,
    answers: [
      { answer: 'Red', correct: true },
      { answer: 'Blue', correct: false },
      { answer: 'Whatever', correct: false },
      { answer: "I don't know", correct: false },
    ],
  });

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

describe.skip('PUT /v1/player/{playerid}/question/{questionposition}/answer', () => {
  let playerId: number;
  let answerIds: number[];
  beforeEach(() => {
    // Join a not started session
    const res = playerJoinSession(quizSessionId, 'Peter Griffin');
    expect(res.statusCode).toBe(200);
    playerId = res.body.playerId;

    // Get answerIds
    const questionInfo = playerGetQuestionInfo(playerId, 1);
    expect(questionInfo.statusCode).toBe(200);
    answerIds = questionInfo.body.answers.map((answer: Record<string, unknown>) => answer.answerId);
    expect(answerIds.length).toBeGreaterThan(2); // at least 3 answers

    // Go to the first question
    quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
    quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');
  });

  describe('valid cases', () => {
    // valid cases
    test('submit all answers', () => {
      // Submit answer
      const res = playerSubmitAnswer(answerIds, playerId, 1);
      expect(res.statusCode).toBe(200);
    });
    test('submit partial answers', () => {
      // Submit answer
      const res = playerSubmitAnswer(answerIds.slice(0, 1), playerId, 1);
      expect(res.statusCode).toBe(200);

      // Submit answer again
      const res2 = playerSubmitAnswer(answerIds.slice(0, 1), playerId, 1);
      expect(res2.statusCode).toBe(200);
    });
  });

  describe('invalid cases', () => {
    test('player ID does not exist', () => {
      const res = playerSubmitAnswer(answerIds, 999999, 1);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('question position is not valid for the session', () => {
      const res = playerSubmitAnswer(answerIds, playerId, 999);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('session is not in QUESTION_OPEN state', () => {
      quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_ANSWER');
      const res = playerSubmitAnswer(answerIds, playerId, 1);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('session is not currently on this question', () => {
      quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
      const res = playerSubmitAnswer(answerIds, playerId, 1);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('answer IDs are not valid for this particular question', () => {
      const invalidAnswerIds = [999999, 1000000];
      const res = playerSubmitAnswer(invalidAnswerIds, playerId, 1);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('duplicate answer IDs provided', () => {
      const duplicateAnswerIds = [answerIds[0], answerIds[0]];
      const res = playerSubmitAnswer(duplicateAnswerIds, playerId, 1);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('less than 1 answer ID submitted', () => {
      const res = playerSubmitAnswer([], playerId, 1);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
  });
});
