import {
  quizGetList,
  quizGetDetails,
  quizCreate,
  quizDelete,
  quizTransfer,
  quizUpdateName,
  quizUpdateDescription,
  quizGetTrash,
  quizRestore,
  questionCreate,
  trashEmpty,
} from './helpers';

import { userRegister, clear, quizSessionCreate, userLogin } from '../v1/helpers';

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

/*
 This is test for AQI
 */
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

/*
 This is test for AQD
 */
describe('DELETE /v2/admin/quiz/:quizid', () => {
  let quizId: number;

  beforeEach(() => {
    // Create a quiz before each test in this suite
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;
  });

  describe('invalid cases', () => {
    test('session for this quiz is not in END state', () => {
      const createQuestionRes = questionCreate(token, quizId, {
        question: 'Are you my master?',
        duration: 60,
        points: 6,
        answers: [
          { answer: 'Yes', correct: true },
          { answer: 'No', correct: false },
          { answer: 'Maybe', correct: false },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      });
      expect(createQuestionRes.statusCode).toBe(200);
      const res2 = quizSessionCreate(token, quizId, 2);
      expect(res2.statusCode).toBe(200);
      const res = quizDelete(token, quizId);
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual(ERROR);
    });
  });
  describe('valid cases', () => {
    test('delete successful', () => {
      const res = quizDelete(token, quizId);
      expect(res.statusCode).toBe(200);
    });
  });
});

/*
 This is test for AQT
 */
describe('POST /v2/admin/quiz/:quizid/transfer', () => {
  let quizId: number;

  beforeEach(() => {
    // Create a quiz before each test
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId; // Store quizId for reuse
  });

  describe('invalid cases', () => {
    test('successfully transfer quiz to another user', () => {
      // Register another user to transfer the quiz to
      const newUserRes = userRegister('newuser@example.com', 'ValidPass123', 'Jane', 'Smith');
      expect(newUserRes.statusCode).toBe(200);

      // Transfer the quiz to the new user
      const transferRes = quizTransfer(token, quizId, 'newuser@example.com');
      expect(transferRes.statusCode).toBe(200);
      expect(transferRes.body).toStrictEqual({});

      // Verify the new owner by checking quiz details
      const newToken = newUserRes.body.token;
      const quizDetails = quizGetDetails(newToken, quizId);
      expect(quizDetails.statusCode).toBe(200);
      expect(quizDetails.body.authUserId).toBe(newUserRes.body.userId);
    });
  });
});
/*
 This is test for AQL
 */
describe('GET /v2/admin/quiz/list', () => {
  describe('valid cases', () => {
    test('successful quiz list retrieval with no quizzes', () => {
      const res = quizGetList(token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({ quizzes: [] });
    });

    test('successful quiz list retrieval with quizzes', () => {
      // Create a quiz
      const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
      expect(createQuizRes.statusCode).toBe(200);
      const { quizId } = createQuizRes.body;
      const res = quizGetList(token);
      expect(res.statusCode).toBe(200);
      const body = res.body;
      expect(body).toHaveProperty('quizzes');
      expect(Array.isArray(body.quizzes)).toBe(true);
      expect(body.quizzes.length).toBe(1);
      expect(body.quizzes[0]).toStrictEqual({
        quizId,
        name: 'Test Quiz',
      });
    });
  });
});
/*
 This is test for AQC
 */
describe('POST /v2/admin/quiz', () => {
  describe('valid cases', () => {
    test('successful quiz creation', () => {
      const res = quizCreate(token, 'Test Quiz', 'A test quiz');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('quizId');
    });
    test('successful quiz creation with empty description', () => {
      const res = quizCreate(token, 'Test Quiz', '');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('quizId');
    });
    test('two different user can create same quiz', () => {
      const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
      expect(createQuizRes.statusCode).toBe(200);
      const { quizId: quizId1 } = createQuizRes.body;
      const createUserRes = userRegister('admin@unsw.edu.au', 'ValidPass123', 'Admin', 'User');
      expect(createUserRes.statusCode).toBe(200);
      const token2 = createUserRes.body.token;
      const res = quizCreate(token2, 'Test Quiz', 'A test quiz');
      const { quizId: quizId2 } = res.body;
      expect(res.statusCode).toBe(200);
    });
  });
});
/*
 This is test for AQNU
 */
describe('PUT /v2/admin/quiz/{quizid}/name', () => {
  let quizId: number;
  beforeEach(() => {
    // create a quiz
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;
  });
  describe('valid cases', () => {
    test.only('has correct return type', () => {
      const res = quizUpdateName(quizId, token, 'myName');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
    });

    test('successful update the quiz name', () => {
      quizUpdateName(quizId, token, 'newName');
      const res = quizGetDetails(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        quizId,
        name: 'newName',
        description: 'A test quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: '#',
      });
    });

    test('successful update last edit time', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      quizUpdateName(quizId, token, 'newName');
      const res = quizGetDetails(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body.timeLastEdited).not.toStrictEqual(res.body.timeCreated);
    });
  });
});
/*
 This is test for AQDU
 */
describe('PUT /v2/admin/quiz/:quizId/description', () => {
  let quizId: number;
  beforeEach(() => {
    const createQuizRes = quizCreate(token, 'Fate', 'Description');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;
  });

  describe('valid cases', () => {
    test('should update the description of the quiz', () => {
      const res = quizUpdateDescription(token, quizId, 'An updated test quiz');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
      const res1 = quizGetDetails(token, quizId);
      expect(res1.statusCode).toBe(200);
      expect(res1.body).toStrictEqual({
        quizId,
        name: 'Fate',
        description: 'An updated test quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: '#',
      });
    });
    test('successful update last edit time', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = quizUpdateDescription(token, quizId, 'An updated test quiz');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
      const res1 = quizGetDetails(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res1.body.timeLastEdited).not.toStrictEqual(res1.body.timeCreated);
    });
  });
});
/*
 This is test for AQVT
 */
describe('GET /v2/admin/quiz/trash', () => {
  let quizId: number;
  beforeEach(() => {
    const res = quizCreate(token, 'Test quiz', 'description for test quiz');
    expect(res.statusCode).toStrictEqual(200);
    quizId = res.body.quizId;
  });
  describe('valid cases', () => {
    beforeEach(() => {
      const loginRes = userLogin('test@example.com', 'ValidPass123');
      expect(loginRes.statusCode).toStrictEqual(200);
    });

    test('success view trash for user with 0 quiz in trash', () => {
      const res = quizGetTrash(token);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual({ quizzes: [] });
    });

    test('success view trash for user with 1 quiz in trash', () => {
      const deleteRes = quizDelete(token, quizId);
      expect(deleteRes.statusCode).toStrictEqual(200);
      const res = quizGetTrash(token);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual({
        quizzes: [
          {
            quizId: quizId,
            name: 'Test quiz',
          },
        ],
      });
    });
    test('success view trash for user with multiple quizzes in trash', () => {
      const createQuizRes = quizCreate(token, 'family guy', 'what is the dog name');
      expect(createQuizRes.statusCode).toStrictEqual(200);
      const quizId1 = createQuizRes.body.quizId;
      const deleteRes1 = quizDelete(token, quizId);
      expect(deleteRes1.statusCode).toStrictEqual(200);
      const deleteRes2 = quizDelete(token, quizId1);
      expect(deleteRes2.statusCode).toStrictEqual(200);
      const res = quizGetTrash(token);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual({
        quizzes: [
          {
            quizId: quizId,
            name: 'Test quiz',
          },
          {
            quizId: quizId1,
            name: 'family guy',
          },
        ],
      });
    });

    test('success view trash when there is multiple user', () => {
      const registerRes = userRegister('peter@gmail.com', 'PumkinEater123', 'Peter', 'Griffin');
      expect(registerRes.statusCode).toBe(200);
      const deleteRes = quizDelete(token, quizId);
      expect(deleteRes.statusCode).toStrictEqual(200);
      const res = quizGetTrash(token);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual({
        quizzes: [
          {
            quizId: quizId,
            name: 'Test quiz',
          },
        ],
      });
    });
  });
});
/*
 This is test for AQR
 */
describe('POST /v1/admin/quiz/:quizId/restore', () => {
  let quizId: number;
  beforeEach(() => {
    const createQuizRes = quizCreate(token, 'Fate', 'Description');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;
  });
  describe('valid cases', () => {
    test('should restore quiz', () => {
      quizDelete(token, quizId);
      const res = quizRestore(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
      const res1 = quizGetDetails(token, quizId);
      expect(res1.statusCode).toBe(200);
      expect(res1.body).toStrictEqual({
        quizId,
        name: 'Fate',
        description: 'Description',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: '#',
      });
    });
    test('successful update last edit time', async () => {
      quizDelete(token, quizId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = quizRestore(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
      const res1 = quizGetDetails(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res1.body.timeLastEdited).not.toStrictEqual(res1.body.timeCreated);
    });
  });
});
/*
 This is test for AQE
 */
describe('DELETE /v2/admin/quiz/trash/empty', () => {
  let quizId1: number;
  let quizId2: number;
  beforeEach(() => {
    // Create a quiz before each test in this suite
    let createQuizRes = quizCreate(token, 'Test Quiz1', 'A test quiz1');
    expect(createQuizRes.statusCode).toBe(200);
    quizId1 = createQuizRes.body.quizId;

    createQuizRes = quizCreate(token, 'Test Quiz2', 'A test quiz2');
    expect(createQuizRes.statusCode).toBe(200);
    quizId2 = createQuizRes.body.quizId;

    // Delete the quiz
    const deleteQuizRes = quizDelete(token, quizId1);
    expect(deleteQuizRes.statusCode).toBe(200);
  });
  describe('valid cases', () => {
    test('successful empty trash', () => {
      const quizIdsParam = JSON.stringify([quizId1]);
      const emptyRes = trashEmpty(token, quizIdsParam);
      expect(emptyRes.statusCode).toBe(200);
      expect(emptyRes.body).toStrictEqual({});
      const AdminQuizTrashViewRes = quizGetTrash(token);
      expect(AdminQuizTrashViewRes.statusCode).toBe(200);
      expect(AdminQuizTrashViewRes.body).toStrictEqual({ quizzes: [] });
    });
    test('successful empty trash with multiple quizzes', () => {
      quizDelete(token, quizId2);
      const quizIdsParam = JSON.stringify([quizId1, quizId2]);
      const emptyRes = trashEmpty(token, quizIdsParam);
      expect(emptyRes.statusCode).toBe(200);
      expect(emptyRes.body).toStrictEqual({});
      expect(quizGetTrash(token).body).toStrictEqual({ quizzes: [] });
    });
  });
});
