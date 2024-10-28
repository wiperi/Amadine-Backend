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
  playerSubmitAnswer,
  playerGetQuestionInfo,
  playerPostMessage,
  playerGetMessage,
  playerGetStatusInSession,
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

describe('PUT /v1/player/{playerid}/question/{questionposition}/answer', () => {
  let playerId: number;
  let answerIds: number[];
  beforeEach(() => {
    // Join a not started session
    const res = playerJoinSession(quizSessionId, 'Peter Griffin');
    expect(res.statusCode).toBe(200);
    playerId = res.body.playerId;

    // Start the first question
    quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
    quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');

    // Get answerIds
    const questionInfo = playerGetQuestionInfo(playerId, 1);
    expect(questionInfo.statusCode).toBe(200);
    answerIds = questionInfo.body.answers.map((answer: Record<string, unknown>) => answer.answerId);
    expect(answerIds.length).toBeGreaterThan(2); // at least 3 answers
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
      quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_ANSWER');
      quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
      quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');
      const res = playerSubmitAnswer(answerIds, playerId, 1);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);

      // Get second question info
      const questionInfo = playerGetQuestionInfo(playerId, 2);
      expect(questionInfo.statusCode).toBe(200);
      const answerIds2 = questionInfo.body.answers.map(
        (answer: Record<string, unknown>) => answer.answerId
      );
      expect(answerIds2.length).toBeGreaterThan(2); // at least 3 answers

      // Submit answer to second question
      const res2 = playerSubmitAnswer(answerIds2, playerId, 2);
      expect(res2.statusCode).toBe(200);
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
          { answerId: expect.any(Number), answer: 'You are puppets', colour: expect.any(String) },
          { answerId: expect.any(Number), answer: 'No', colour: expect.any(String) },
          { answerId: expect.any(Number), answer: 'Who knows', colour: expect.any(String) },
        ],
      });
    });
  });
});

/**
 * test for playerPostMessage
 */
describe('POST /v1/player/:playerId/chat', () => {
  let playerId: number;
  beforeEach(() => {
    const res = playerJoinSession(quizSessionId, 'Peter Griffin');
    expect(res.statusCode).toBe(200);
    playerId = res.body.playerId;
  });

  describe('invalid cases', () => {
    test('player Id does not exist', () => {
      const res = playerPostMessage(0, { message: { messageBody: 'hello' } });
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('invalid message body', () => {
      const res1 = playerPostMessage(playerId, { message: { messageBody: '' } });
      expect(res1.statusCode).toBe(400);
      expect(res1.body).toStrictEqual(ERROR);

      const res2 = playerPostMessage(playerId, {
        message: {
          messageBody:
            'SeskASvSvZkvSdHfoArZXJTVbsxUHoqXRFFpjamzBMNmPvfKWWwQQWZbBguKqzhcPGZkxJYwNFBDjNFQEHYUSWdxHomoDXsssARwwwwwM',
        },
      });
      expect(res2.statusCode).toBe(400);
      expect(res2.body).toStrictEqual(ERROR);
    });
  });

  describe('valid cases', () => {
    test('have correct return type', () => {
      const res = playerPostMessage(playerId, {
        message: { messageBody: 'Hello everyone! Nice to chat.' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
    });

    test('successful add one new message', () => {
      const res = playerPostMessage(playerId, {
        message: { messageBody: 'Hello everyone! Nice to chat.' },
      });
      expect(res.statusCode).toBe(200);
      const getMessageRes = playerGetMessage(playerId);
      expect(getMessageRes.statusCode).toBe(200);
      expect(getMessageRes.body).toStrictEqual({
        messages: [
          {
            messageBody: 'Hello everyone! Nice to chat.',
            playerId: playerId,
            playerName: 'Peter Griffin',
            timeSent: expect.any(Number),
          },
        ],
      });
    });

    test('successful add multiple new messages', () => {
      const res = playerPostMessage(playerId, {
        message: { messageBody: 'Hello everyone! Nice to chat.' },
      });
      expect(res.statusCode).toBe(200);
      const res1 = playerPostMessage(playerId, {
        message: { messageBody: 'Hi nice to meet you!' },
      });
      expect(res1.statusCode).toBe(200);
      const getMessageRes = playerGetMessage(playerId);
      expect(getMessageRes.statusCode).toBe(200);
      expect(getMessageRes.body).toStrictEqual({
        messages: [
          {
            messageBody: 'Hello everyone! Nice to chat.',
            playerId: playerId,
            playerName: 'Peter Griffin',
            timeSent: expect.any(Number),
          },
          {
            messageBody: 'Hi nice to meet you!',
            playerId: playerId,
            playerName: 'Peter Griffin',
            timeSent: expect.any(Number),
          },
        ],
      });
    });
  });
});

/**
 * test for playergetMessage
 */
describe('GET /v1/player/{playerid}/chat', () => {
  let playerId: number;
  beforeEach(() => {
    // Join a not started session
    const res = playerJoinSession(quizSessionId, 'John Wick');
    expect(res.statusCode).toBe(200);
    playerId = res.body.playerId;
  });
  describe('invalid cases', () => {
    test('player ID does not exist', () => {
      const res = playerGetMessage(999999);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
  });
  describe('valid cases', () => {
    test('should return empty array when no message', () => {
      const res = playerGetMessage(playerId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({ messages: [] });
    });

    test('should return correct message', () => {
      const res = playerPostMessage(playerId, {
        message: { messageBody: 'STEINS GATE' },
      });
      expect(res.statusCode).toBe(200);
      const getMessageRes = playerGetMessage(playerId);
      expect(getMessageRes.statusCode).toBe(200);
      expect(getMessageRes.body).toStrictEqual({
        messages: [
          {
            messageBody: 'STEINS GATE',
            playerId: playerId,
            playerName: 'John Wick',
            timeSent: expect.any(Number),
          },
        ],
      });
    });
    test('should return correct message in order when multiple messages', () => {
      const res1 = playerPostMessage(playerId, {
        message: { messageBody: 'STEINS GATE' },
      });
      expect(res1.statusCode).toBe(200);
      const res2 = playerPostMessage(playerId, {
        message: { messageBody: 'FATE STAY NIGHT' },
      });
      expect(res2.statusCode).toBe(200);
      const res3 = playerPostMessage(playerId, {
        message: { messageBody: 'CYBERPUNK 2077' },
      });
      expect(res3.statusCode).toBe(200);
      const res = playerGetMessage(playerId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        messages: [
          {
            messageBody: 'STEINS GATE',
            playerId: playerId,
            playerName: 'John Wick',
            timeSent: expect.any(Number),
          },
          {
            messageBody: 'FATE STAY NIGHT',
            playerId: playerId,
            playerName: 'John Wick',
            timeSent: expect.any(Number),
          },
          {
            messageBody: 'CYBERPUNK 2077',
            playerId: playerId,
            playerName: 'John Wick',
            timeSent: expect.any(Number),
          },
        ],
      });
    });

    test('should return correct timesent', async () => {
      const now1 = Math.floor(Date.now() / 1000);
      const res1 = playerPostMessage(playerId, {
        message: { messageBody: 'STEINS GATE' },
      });
      expect(res1.statusCode).toBe(200);
      // wait for 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      const now2 = Math.floor(Date.now() / 1000);
      const res2 = playerPostMessage(playerId, {
        message: { messageBody: 'FATE STAY NIGHT' },
      });
      expect(res2.statusCode).toBe(200);
      // wait for 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      const now3 = Math.floor(Date.now() / 1000);
      const res3 = playerPostMessage(playerId, {
        message: { messageBody: 'CYBERPUNK 2077' },
      });
      expect(res3.statusCode).toBe(200);
      const res = playerGetMessage(playerId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        messages: [
          {
            messageBody: 'STEINS GATE',
            playerId: playerId,
            playerName: 'John Wick',
            timeSent: expect.any(Number),
          },
          {
            messageBody: 'FATE STAY NIGHT',
            playerId: playerId,
            playerName: 'John Wick',
            timeSent: expect.any(Number),
          },
          {
            messageBody: 'CYBERPUNK 2077',
            playerId: playerId,
            playerName: 'John Wick',
            timeSent: expect.any(Number),
          },
        ],
      });
      expect(res.body.messages[0].timeSent).toBeGreaterThanOrEqual(now1 - 1);
      expect(res.body.messages[0].timeSent).toBeLessThanOrEqual(now1 + 1);
      expect(res.body.messages[1].timeSent).toBeGreaterThanOrEqual(now2 - 1);
      expect(res.body.messages[1].timeSent).toBeLessThanOrEqual(now2 + 1);
      expect(res.body.messages[2].timeSent).toBeGreaterThanOrEqual(now3 - 1);
      expect(res.body.messages[2].timeSent).toBeLessThanOrEqual(now3 + 1);
    });
  });
});

describe('GET /v1/player/:playerId', () => {
  let playerId: number;
  beforeEach(() => {
    // Join a not started session
    const res = playerJoinSession(quizSessionId, 'John Wick');
    expect(res.statusCode).toBe(200);
    playerId = res.body.playerId;
  });
  describe('valid cases', () => {
    test('should return player status successfully', () => {
      // Join the session as a player for this test
      const joinSessionRes = playerJoinSession(quizSessionId, 'Peter Griffin');
      expect(joinSessionRes.statusCode).toBe(200);
      const playerId = joinSessionRes.body.playerId;

      // Get the player’s status
      const res = playerGetStatusInSession(playerId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        state: expect.any(String),
        numQuestions: expect.any(Number),
        atQuestion: expect.any(Number),
      });
    });
  });

  describe('invalid cases', () => {
    test('should return error when player ID is invalid', () => {
      const res = playerGetStatusInSession(99999); // Non-existent player ID
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('should return error when session ID is invalid', () => {
      // Join the session as a player
      const joinSessionRes = playerJoinSession(quizSessionId, 'Peter Griffin');
      expect(joinSessionRes.statusCode).toBe(200);
      const playerId = joinSessionRes.body.playerId;

      // Clear the session to simulate invalid session state
      clear();

      // Attempt to get the status
      const res = playerGetStatusInSession(playerId);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
  });
});
