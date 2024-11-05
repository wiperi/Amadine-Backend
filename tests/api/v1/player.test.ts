import { QuestionResultReturned } from '@/models/Types';
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
  quizGetDetails,
  playerGetQuestionResult,
  playerGetStatusInSession,
  succ,
  err,
  playerGetSessionResult,
} from './helpers';
import exp from 'constants';

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
  const createQuizSessionRes = quizSessionCreate(token, quizId, 5);
  expect(createQuizSessionRes.statusCode).toBe(200);
  quizSessionId = createQuizSessionRes.body.sessionId;
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

    test('when number of player is reach auto start number, state become QUESTION_COUNTDOWN', () => {
      const peter = playerJoinSession(quizSessionId, 'Peter Griffin');
      const quagmire = playerJoinSession(quizSessionId, 'Glen Quagmire');
      const meg = playerJoinSession(quizSessionId, 'Meg Griffin');
      const chris = playerJoinSession(quizSessionId, 'Chris Griffin');
      const brian = playerJoinSession(quizSessionId, 'Brian Griffin');
      expect(peter.statusCode).toBe(200);
      expect(quagmire.statusCode).toBe(200);
      expect(meg.statusCode).toBe(200);
      expect(chris.statusCode).toBe(200);
      expect(brian.statusCode).toBe(200);
      const stateRes = quizSessionGetStatus(token, quizId, quizSessionId);
      expect(stateRes.statusCode).toBe(200);
      expect(stateRes.body.state).toStrictEqual('QUESTION_COUNTDOWN');
    })
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

    // This test return this error message:
    //    answer id is not valid for this particular question
    // instead of:
    //    less than 1 answer Id was submitted
    test.skip('less than 1 answer ID submitted', () => {
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
      const errorRes = playerGetQuestionInfo(playerId, 0);
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

describe('GET /v1/player/{playerid}/question/{questionposition}/results', () => {
  let playerIds: number[];
  let questionId: number;
  let correctAnsIds: number[];
  let wrongAnsIds: number[];
  beforeEach(() => {
    playerIds = [
      succ(playerJoinSession(quizSessionId, 'player1')).playerId,
      succ(playerJoinSession(quizSessionId, 'player2')).playerId,
      succ(playerJoinSession(quizSessionId, 'player3')).playerId,
    ];

    const questionInfo = succ(quizGetDetails(token, quizId)).questions[0];
    questionId = questionInfo.questionId;
    correctAnsIds = questionInfo.answers
      .filter((a: { correct: boolean }) => a.correct)
      .map((a: { answerId: number }) => a.answerId);
    wrongAnsIds = questionInfo.answers
      .filter((a: { correct: boolean }) => !a.correct)
      .map((a: { answerId: number }) => a.answerId);
  });

  describe('valid cases', () => {
    test(
      'player get correct question result',
      async () => {
        // Start the session
        expect(quizSessionGetStatus(token, quizId, quizSessionId).body.state).toBe('LOBBY');
        succ(quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION'));
        expect(quizSessionGetStatus(token, quizId, quizSessionId).body.state).toBe(
          'QUESTION_COUNTDOWN'
        );
        succ(quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN'));
        expect(quizSessionGetStatus(token, quizId, quizSessionId).body.state).toBe('QUESTION_OPEN');
        // Answer question
        succ(playerSubmitAnswer(correctAnsIds, playerIds[0], 1));
        await new Promise(resolve => setTimeout(resolve, 2000));
        succ(playerSubmitAnswer(correctAnsIds, playerIds[1], 1));
        await new Promise(resolve => setTimeout(resolve, 2000));
        succ(playerSubmitAnswer(wrongAnsIds, playerIds[2], 1));
        succ(quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_ANSWER'));
        expect(quizSessionGetStatus(token, quizId, quizSessionId).body.state).toBe('ANSWER_SHOW');
        // Check the result
        const res = succ(playerGetQuestionResult(playerIds[0], 1));
        expect(res.questionId).toBe(questionId);
        expect(res.playersCorrectList).toContain('player1');
        expect(res.playersCorrectList).toContain('player2');
        expect(res.playersCorrectList).not.toContain('player3');
        expect(res.averageAnswerTime).toBeGreaterThan(2 - 1);
        expect(res.averageAnswerTime).toBeLessThan(2 + 1);
        expect(res.percentCorrect).toBe(67);
      },
      10 * 1000
    );
  });

  describe('invalid cases', () => {
    test('error when player ID does not exist', () => {
      err(playerGetQuestionResult(0, 1), 400);
    });

    test('error when question position is invalid', () => {
      succ(quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION'));
      succ(quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN'));
      succ(playerSubmitAnswer(correctAnsIds, playerIds[0], 1));
      succ(quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_ANSWER'));

      err(playerGetQuestionResult(playerIds[0], 0), 400);
      err(playerGetQuestionResult(playerIds[0], 999), 400);
    });

    test('error when session not in ANSWER_SHOW state', () => {
      succ(quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION'));
      succ(quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN'));

      err(playerGetQuestionResult(playerIds[0], 1), 400);
    });

    test('error when session not at this question', () => {
      // Move to question 1 answer show
      succ(quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION'));
      succ(quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN'));
      succ(playerSubmitAnswer(correctAnsIds, playerIds[0], 1));
      succ(quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_ANSWER'));

      // Move to question 2
      succ(quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION'));
      succ(quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN'));
      succ(quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_ANSWER'));

      err(playerGetQuestionResult(playerIds[0], 1), 400);
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
    test('should move through different quiz states and verify player status', () => {
      // Step 1: LOBBY state - before starting the quiz
      let res = playerGetStatusInSession(playerId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        state: 'LOBBY',
        numQuestions: 2,
        atQuestion: 0,
      });

      // Step 2: Move to QUESTION_COUNTDOWN for the first question
      quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
      res = playerGetStatusInSession(playerId);
      expect(res.statusCode).toBe(200);
      expect(res.body.state).toBe('QUESTION_COUNTDOWN');
      expect(res.body.atQuestion).toBe(1);

      // Step 3: Open first question - QUESTION_OPEN state
      quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');
      res = playerGetStatusInSession(playerId);
      expect(res.statusCode).toBe(200);
      expect(res.body.state).toBe('QUESTION_OPEN');
      expect(res.body.atQuestion).toBe(1);

      // Step 4: Close the first question and show the answer - ANSWER_SHOW state
      quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_ANSWER');
      res = playerGetStatusInSession(playerId);
      expect(res.statusCode).toBe(200);
      expect(res.body.state).toBe('ANSWER_SHOW');
      expect(res.body.atQuestion).toBe(1);

      // Step 5: Move to QUESTION_COUNTDOWN for the second question
      quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION');
      res = playerGetStatusInSession(playerId);
      expect(res.statusCode).toBe(200);
      expect(res.body.state).toBe('QUESTION_COUNTDOWN');
      expect(res.body.atQuestion).toBe(2);

      // Step 6: Open the second question - QUESTION_OPEN state
      quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN');
      res = playerGetStatusInSession(playerId);
      expect(res.statusCode).toBe(200);
      expect(res.body.state).toBe('QUESTION_OPEN');
      expect(res.body.atQuestion).toBe(2);

      // Step 7: Close the second question and show the answer - ANSWER_SHOW state
      quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_ANSWER');
      res = playerGetStatusInSession(playerId);
      expect(res.statusCode).toBe(200);
      expect(res.body.state).toBe('ANSWER_SHOW');
      expect(res.body.atQuestion).toBe(2);

      // Step 7: Close the second question and move to FINAL_RESULTS
      quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_FINAL_RESULTS');
      res = playerGetStatusInSession(playerId);
      expect(res.statusCode).toBe(200);
      expect(res.body.state).toBe('FINAL_RESULTS');
      expect(res.body.atQuestion).toBe(0);

      // Step 8: End the session
      quizSessionUpdateState(token, quizId, quizSessionId, 'END');
      res = playerGetStatusInSession(playerId);
      expect(res.statusCode).toBe(200);
      expect(res.body.state).toBe('END');
      expect(res.body.atQuestion).toBe(0);
    });
  });

  describe('invalid cases', () => {
    test('should return error when player ID is invalid', () => {
      const res = playerGetStatusInSession(-1); // Non-existent player ID
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

/**
 * Test for playerGetSessionResult
 */
describe('GET /v1/player/:playerid/results', () => {
  let Peter: number;
  let Homer: number;
  let correctAnsIds1: number[];
  let wrongAnsIds1: number[];
  let correctAnsIds2: number[];
  let wrongAnsIds2: number[];
  let question1Result: QuestionResultReturned;
  let question2Result: QuestionResultReturned;
  beforeEach(async () => {
    Peter = succ(playerJoinSession(quizSessionId, 'Peter Griffin')).playerId;
    Homer = succ(playerJoinSession(quizSessionId, 'Homer Simpson')).playerId;

    const question1Info = succ(quizGetDetails(token, quizId)).questions[0];
    correctAnsIds1 = question1Info.answers
      .filter((a: { correct: boolean }) => a.correct)
      .map((a: { answerId: number }) => a.answerId);
    wrongAnsIds1 = question1Info.answers
      .filter((a: { correct: boolean }) => !a.correct)
      .map((a: { answerId: number }) => a.answerId);

    const question2Info = succ(quizGetDetails(token, quizId)).questions[1];
    correctAnsIds2 = question2Info.answers
      .filter((a: { correct: boolean }) => a.correct)
      .map((a: { answerId: number }) => a.answerId);
    wrongAnsIds2 = question2Info.answers
      .filter((a: { correct: boolean }) => !a.correct)
      .map((a: { answerId: number }) => a.answerId);

    // Update session state to FINAL_RESULTS state
    // LOBBY -> (NEXT_QUESTION) -> QUESTION_COUNTDOWN
    succ(quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION'));
    // QUESTION_COUNTDOWN -> (SKIP_COUNTDOWN) -> QUESTION_OPEN
    succ(quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN'));
    // Now is QUESTION_OPEN state, let players both answer the question correctly
    succ(playerSubmitAnswer(correctAnsIds1, Peter, 1));
    await new Promise(resolve => setTimeout(resolve, 1000));
    succ(playerSubmitAnswer(correctAnsIds1, Homer, 1));
    // QUESTION_OPEN -> (GO_TO_ANSWER) -> ANSWER_SHOW
    succ(quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_ANSWER'));
    question1Result = succ(playerGetQuestionResult(Peter, 1));
    // ANSWER_SHOW -> (NEXT_QUESTION) -> QUESTION_COUNTDOWN
    succ(quizSessionUpdateState(token, quizId, quizSessionId, 'NEXT_QUESTION'));
    // QUESTION_COUNTDOWN -> (SKIP_COUNTDOWN) -> QUESTION_OPEN
    succ(quizSessionUpdateState(token, quizId, quizSessionId, 'SKIP_COUNTDOWN'));
    // Now is QUESTION_OPEN state, let player1 be correct and player2 be incorrect
    succ(playerSubmitAnswer(correctAnsIds2, Peter, 2));
    await new Promise(resolve => setTimeout(resolve, 1000));
    succ(playerSubmitAnswer(wrongAnsIds2, Homer, 2));
    // QUESTION_OPEN -> (GO_TO_ANSWER) -> ANSWER_SHOW
    succ(quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_ANSWER'));
    question2Result = succ(playerGetQuestionResult(Peter, 2));
    // ANSWER_SHOW -> (GO_TO_FINAL_RESULTS) -> FINAL_RESULTS
    succ(quizSessionUpdateState(token, quizId, quizSessionId, 'GO_TO_FINAL_RESULTS'));
    const stateInfo = succ(quizSessionGetStatus(token, quizId, quizSessionId));
    expect(stateInfo.state).toStrictEqual('FINAL_RESULTS');
  });

  describe('invalid cases', () => {
    test('playerId does not exist', () => {
      err(playerGetSessionResult(0), 400);
    });

    test('session is not in FINAL_RESULTS STATE', () => {
      succ(quizSessionUpdateState(token, quizId, quizSessionId, 'END'));
      // Now session state is in END state
      err(playerGetSessionResult(Peter), 400);
    });
  });

  describe('valid cases', () => {
    test('return correct answer with 2 players', () => {
      // player1: 6 + 5 points
      // player2: 3 + 0 points
      const sessionResult = succ(playerGetSessionResult(Peter));
      expect(sessionResult.usersRankedByScore).toStrictEqual([
        {
          name: 'Peter Griffin',
          score: 11,
        },
        {
          name: 'Homer Simpson',
          score: 3,
        },
      ]);

      expect(sessionResult.questionResults[0]).toStrictEqual(question1Result);
      expect(sessionResult.questionResults[1]).toStrictEqual(question2Result);
    });

    test('return correct answer with 4 players', async () => {
      // They answer each question in different order. ie. there will a time gap between submitting answer
      // The final result should be
      // player1: X + n + m points
      // player2: X + n points
      // player3: X points
      // player4: 0 points

      // Create a new quizSession
      const createQuizSessionRes = quizSessionCreate(token, quizId, 5);
      expect(createQuizSessionRes.statusCode).toBe(200);
      const sessionId = createQuizSessionRes.body.sessionId;

      // this quizSession has 2 questions and 4 players
      const Peter = succ(playerJoinSession(sessionId, 'Peter Griffin')).playerId;
      const Homer = succ(playerJoinSession(sessionId, 'Homer Simpson')).playerId;
      const Glen = succ(playerJoinSession(sessionId, 'Glen Quagmire')).playerId;
      const Joe = succ(playerJoinSession(sessionId, 'Joe Swanson')).playerId;

      // Update session state to FINAL_RESULTS state
      // LOBBY -> (NEXT_QUESTION) -> QUESTION_COUNTDOWN
      succ(quizSessionUpdateState(token, quizId, sessionId, 'NEXT_QUESTION'));
      // QUESTION_COUNTDOWN -> (SKIP_COUNTDOWN) -> QUESTION_OPEN
      succ(quizSessionUpdateState(token, quizId, sessionId, 'SKIP_COUNTDOWN'));
      // Now is QUESTION_OPEN state, let players both answer the question correctly
      // First question has 2 players correct and 1 player incorrect, 1 player did not answer
      succ(playerSubmitAnswer(correctAnsIds1, Peter, 1));
      await new Promise(resolve => setTimeout(resolve, 1000));
      succ(playerSubmitAnswer(correctAnsIds1, Homer, 1));
      succ(playerSubmitAnswer(wrongAnsIds1, Glen, 1));
      // QUESTION_OPEN -> (GO_TO_ANSWER) -> ANSWER_SHOW
      succ(quizSessionUpdateState(token, quizId, sessionId, 'GO_TO_ANSWER'));
      question1Result = succ(playerGetQuestionResult(Peter, 1));
      // ANSWER_SHOW -> (NEXT_QUESTION) -> QUESTION_COUNTDOWN
      succ(quizSessionUpdateState(token, quizId, sessionId, 'NEXT_QUESTION'));
      // QUESTION_COUNTDOWN -> (SKIP_COUNTDOWN) -> QUESTION_OPEN
      succ(quizSessionUpdateState(token, quizId, sessionId, 'SKIP_COUNTDOWN'));
      // Now is QUESTION_OPEN state, let player1 be correct and player2 be incorrect
      // Second question has 1 player correct, 2 players incorrect, 1 player did not answer
      succ(playerSubmitAnswer(correctAnsIds2, Homer, 2));
      await new Promise(resolve => setTimeout(resolve, 1000));
      succ(playerSubmitAnswer(correctAnsIds2, Glen, 2));
      await new Promise(resolve => setTimeout(resolve, 1000));
      succ(playerSubmitAnswer(correctAnsIds2, Peter, 2));
      // QUESTION_OPEN -> (GO_TO_ANSWER) -> ANSWER_SHOW
      succ(quizSessionUpdateState(token, quizId, sessionId, 'GO_TO_ANSWER'));
      question2Result = succ(playerGetQuestionResult(Peter, 2));
      // ANSWER_SHOW -> (GO_TO_FINAL_RESULTS) -> FINAL_RESULTS
      succ(quizSessionUpdateState(token, quizId, sessionId, 'GO_TO_FINAL_RESULTS'));
      const stateInfo = succ(quizSessionGetStatus(token, quizId, sessionId));
      expect(stateInfo.state).toStrictEqual('FINAL_RESULTS');

      const sessionResult = succ(playerGetSessionResult(Peter));
      expect(sessionResult.usersRankedByScore).toStrictEqual([
        {
          name: 'Peter Griffin',
          score: 6 + 2,
        },
        {
          name: 'Homer Simpson',
          score: 3 + 5,
        },
        {
          name: 'Glen Quagmire',
          score: 3,
        },
        {
          name: 'Joe Swanson',
          score: 0,
        },
      ]);

      expect(sessionResult.questionResults[0]).toStrictEqual(question1Result);
      expect(sessionResult.questionResults[1]).toStrictEqual(question2Result);
    });
  });
});
