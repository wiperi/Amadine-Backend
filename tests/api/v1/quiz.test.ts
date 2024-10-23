import { adminQuizQuestionDuplicate } from '@/services/quiz';
import {
  userRegister,
  userLogin,
  quizGetList,
  quizGetDetails,
  quizCreate,
  quizDelete,
  quizUpdateDescription,
  quizGetTrash,
  quizRestore,
  clear,
  questionMove,
  questionCreate,
  quizRequestNameUpdate,
  trashEmpty,
  questionDuplicate,
  questionDelete,
  quizTransfer,
  questionUpdate,
  quizSessionCreate,
  quizSessionGetStatus,
} from './helpers';

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
 This is test for AQL
 */
describe('GET /v1/admin/quiz/list', () => {
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
        name: 'Test Quiz'
      });
    });
  });

  describe('invalid cases', () => {
    test('invalid token', () => {
      const res = quizGetList('invalid_token');
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('missing token', () => {
      const res = quizGetList('');
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });
  });
});
/*
 This is test for AQC
 */
describe('POST /v1/admin/quiz', () => {
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
    test('two different user can create same quiz',() => {
      const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
      expect(createQuizRes.statusCode).toBe(200);
      const { quizId: quizId1 } = createQuizRes.body;
      const createUserRes = userRegister('admin@unsw.edu.au', 'ValidPass123', 'Admin', 'User');
      expect(createUserRes.statusCode).toBe(200);
      const token2 = createUserRes.body.token;
      const res = quizCreate(token2, 'Test Quiz', 'A test quiz');
      const {quizId: quizId2} = res.body;
      expect(res.statusCode).toBe(200);
    });
  });
  describe('invalid cases', () => {
    test('invalid token', () => {
      const res = quizCreate('invalid_token', 'Test Quiz', 'A test quiz');
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('short name', () => {
      const res = quizCreate(token, 'a', 'A test quiz');
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('long name', () => {
      const res = quizCreate(token, 'a'.repeat(31), 'A test quiz');
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('repeated name', () => {
      const res = quizCreate(token, 'Test Quiz', 'A test quiz');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('quizId');
      const res2 = quizCreate(token, 'Test Quiz', 'A test quiz');
      expect(res2.statusCode).toBe(400);
      expect(res2.body).toStrictEqual(ERROR);
    });
  });
});
/*
 This is test for AQI
 */
describe('GET /v1/admin/quiz/:quizId', () => {
  describe('valid cases', () => {
    test('successful quiz retrieval', () => {
      const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
      expect(createQuizRes.statusCode).toBe(200);
      const { quizId } = createQuizRes.body;
      const res = quizGetDetails(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        quizId,
        name: 'Test Quiz',
        description: 'A test quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        numQuestions: 0,
        questions: [],
        duration: 0
      });
    });
  });
  describe('invalid cases', () => {
    test('invalid token', () => {
      const res = quizGetDetails('invalid_token', 1);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('missing token', () => {
      const res = quizGetDetails('', 1);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('invalid quiz ID', () => {
      const res = quizGetDetails(token, 0);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('user is not the owner of th quiz', () => {
      const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
      expect(createQuizRes.statusCode).toBe(200);
      const { quizId } = createQuizRes.body;
      const createUserRes = userRegister('testfds@example.com', 'ValidPass123', 'cheong', 'Zhang');
      expect(createUserRes.statusCode).toBe(200);
      token = createUserRes.body.token;
      const res = quizGetDetails(token, quizId);
      expect(res.statusCode).toBe(403);
    });
    test('nonexistent quiz ID', () => {
      const res = quizGetDetails(token, 1);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });
  });
});
/*
 This is test for AQNU
 */
describe('PUT /v1/admin/quiz/{quizid}/name', () => {
  let quizId: number;
  beforeEach(() => {
    // create a quiz
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;
  });

  describe('invalid cases', () => {
    test('name contains invalid characters', () => {
      const res = quizRequestNameUpdate(quizId, token, 'Алексей');
      expect(res).toStrictEqual(400);
    });

    test('name less than 3 characters', () => {
      const res = quizRequestNameUpdate(quizId, token, 'ha');
      expect(res).toStrictEqual(400);
    });

    test('name is more than 30 characters', () => {
      const res = quizRequestNameUpdate(quizId, token, 'morethanthirtycharsmorethanthirty');
      expect(res).toStrictEqual(400);
    });

    test('name is already used by the current logged in user for another quiz', () => {
      const createQuizRes1 = quizCreate(token, 'My Test Name', 'Do not have the same name as mine!');
      expect(createQuizRes1.statusCode).toStrictEqual(200);
      const res = quizRequestNameUpdate(quizId, token, 'My Test Name');
      expect(res).toStrictEqual(400);
    });

    test('userId is empty', () => {
      const res = quizRequestNameUpdate(quizId, '', 'newName');
      expect(res).toStrictEqual(401);
    });

    test('userId does not refer to a valid logged in user session', () => {
      const res = quizRequestNameUpdate(quizId, 'invalidToken', 'newName');
      expect(res).toStrictEqual(401);
    });

    test('user is not a owner of the quiz', () => {
      const userRes = userRegister('peter@example.com', 'PumpkinEater123', 'Peter', 'Griffin');
      expect(userRes.statusCode).toBe(200);
      const token1 = userRes.body.token;

      const res = quizRequestNameUpdate(quizId, token1, 'newName');
      expect(res).toStrictEqual(403);
    });

    test('quizId does not exist', () => {
      const res = quizRequestNameUpdate(0, token, 'newName');
      expect(res).toStrictEqual(403);
    });
  });

  describe('valid cases', () => {
    test('has correct return type', () => {
      const res = quizRequestNameUpdate(quizId, token, 'myName');
      expect(res).toStrictEqual({});
    });

    test('successful update the quiz name', () => {
      quizRequestNameUpdate(quizId, token, 'newName');
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
        duration: 0
      });
    });

    test('successful update last edit time', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      quizRequestNameUpdate(quizId, token, 'newName');
      const res = quizGetDetails(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body.timeLastEdited).not.toStrictEqual(res.body.timeCreated);
    });
  });
});

describe('PUT /v1/admin/quiz/{quizid}/question/{questionid}/move', () => {
  let quizId: number;
  let questionId1: number;
  let questionId2: number;

  beforeEach(() => {
    // Create a quiz
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;

    // Create two questions
    const createQuestion1Res = questionCreate(token, quizId, {
      question: 'Question 1',
      duration: 10,
      points: 5,
      answers: [
        { answer: 'A1', correct: true },
        { answer: 'A2', correct: false }
      ]
    });
    expect(createQuestion1Res.statusCode).toBe(200);
    questionId1 = createQuestion1Res.body.questionId;

    const createQuestion2Res = questionCreate(token, quizId, {
      question: 'Question 2',
      duration: 15,
      points: 7,
      answers: [
        { answer: 'B1', correct: true },
        { answer: 'B2', correct: false }
      ]
    });
    expect(createQuestion2Res.statusCode).toBe(200);
    questionId2 = createQuestion2Res.body.questionId;
  });

  describe('valid cases', () => {
    test('successfully move question to a new position', () => {
      const res = questionMove(token, quizId, questionId1, 1);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});

      // Verify the order of questions
      const quizRes = quizGetDetails(token, quizId);
      expect(quizRes.statusCode).toBe(200);
      const quiz = quizRes.body;
      expect(quiz.questions[0].questionId).toBe(questionId2);
      expect(quiz.questions[1].questionId).toBe(questionId1);
    });
  });

  describe('invalid cases', () => {
    test('invalid token', () => {
      const res = questionMove('invalid_token', quizId, questionId1, 1);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('user is not the owner of the quiz', () => {
      const newUserRes = userRegister('newuser@example.com', 'Password123', 'New', 'User');
      expect(newUserRes.statusCode).toBe(200);
      const newToken = newUserRes.body.token;

      const res = questionMove(newToken, quizId, questionId1, 1);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('quiz does not exist', () => {
      const res = questionMove(token, 999999, questionId1, 1);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('question does not exist in the quiz', () => {
      const res = questionMove(token, quizId, 999999, 1);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('new position is less than 0', () => {
      const res = questionMove(token, quizId, questionId1, -1);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('new position is greater than n-1', () => {
      const res = questionMove(token, quizId, questionId1, 2);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('new position is the same as the current position', () => {
      const res = questionMove(token, quizId, questionId1, 0);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('move question to the same position (no change)', () => {
      const res = questionMove(token, quizId, questionId1, 0);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('questionId is invalid', () => {
      const questionId = -100;
      const res = questionMove(token, quizId, questionId, 1);
      expect(res.statusCode).toStrictEqual(400);
      expect(res.body).toStrictEqual(ERROR);
    });
  });
});
/*
 This is test for AQNU
 */
describe('PUT /v1/admin/quiz/:quizId/description', () => {
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
        duration: 0
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

  describe('invalid cases', () => {
    test('invalid_token', () => {
      const res = quizUpdateDescription('invalid_token', quizId, 'An updated test quiz');

      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('invalid quiz ID', () => {
      const res = quizUpdateDescription(token, 0, 'An updated test quiz');
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('Description is more than 100 characters in length', () => {
      const res = quizUpdateDescription(token, quizId, 'Description'.repeat(10));
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('user is not the owner of th quiz', () => {
      const createUserRes = userRegister('wick@example.com', 'JohnWick123', 'John', 'Wick');
      expect(createUserRes.statusCode).toBe(200);
      token = createUserRes.body.token;
      const res = quizUpdateDescription(token, quizId, 'An updated test quiz');
      expect(res.statusCode).toBe(403);
    });
  });
});
/*
 This is test for AQR
 */
describe('DELETE /v1/admin/quiz/:quizid', () => {
  let quizId: number;

  beforeEach(() => {
    // Create a quiz before each test in this suite
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;
  });

  describe('valid cases', () => {
    test('successful quiz removal', () => {
      const res = quizDelete(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});

      // Verify the quiz is deleted using getQuizList from apihelpertest
      const resList = quizGetList(token);
      expect(resList.statusCode).toBe(200);
      expect(resList.body.quizzes).not.toContainEqual(expect.objectContaining({ quizId }));
    });
  });

  describe('invalid cases', () => {
    test('invalid token', () => {
      // Try deleting the quiz with an invalid token
      const res = quizDelete('invalid_token', quizId);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('quiz ID does not exist', () => {
      // Try deleting a non-existent quiz ID
      const res = quizDelete(token, 999999); // Non-existent quiz ID
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('user is not the owner of the quiz', () => {
      // Register another user and attempt to delete the quiz created by the original user
      const userRes = userRegister('peter@example.com', 'ValidPass123', 'Peter', 'Griffin');
      expect(userRes.statusCode).toBe(200);
      const newToken = userRes.body.token;

      // Attempt to delete with the new user's token
      const res = quizDelete(newToken, quizId);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });
  });
});
/*
 This is test for AQQC
 */
describe('POST /v1/admin/quiz/:quizId/question', () => {
  let quizId: number;

  beforeEach(() => {
    // Create a quiz before each test using the helper function with duration
    const quizResponse = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(quizResponse.statusCode).toBe(200);
    quizId = quizResponse.body.quizId;
  });
  describe('valid cases', () => {
    test('successful question creation', () => {
      const questionBody = {
        question: 'What is the capital of France?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Berlin', correct: false },
          { answer: 'Rome', correct: false },
        ],
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.body).toStrictEqual({ questionId: expect.any(Number) });
      const getQuizRes = quizGetDetails(token, quizId);
      expect(getQuizRes.statusCode).toBe(200);
      const questions = getQuizRes.body.questions;
      expect(questions).toBeDefined();
      expect(questions.length).toBeGreaterThan(0);

      // Optionally, verify that the question matches what was added
      const addedQuestion = questions.find(
        (q:any) => q.questionId === res.body.questionId
      );
      expect(addedQuestion).toBeDefined();
      expect(addedQuestion.question).toBe(questionBody.question);
      expect(addedQuestion.duration).toBe(questionBody.duration);
      expect(addedQuestion.points).toBe(questionBody.points);
      expect(addedQuestion.answers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ answer: 'Paris', correct: true }),
          expect.objectContaining({ answer: 'Berlin', correct: false }),
          expect.objectContaining({ answer: 'Rome', correct: false }),
        ])
      );
      expect(getQuizRes.body.duration).toEqual(60);
    });
    test('seccussfully add muli-questions', () => {
      const questionBody1 = {
        question: 'What is the capital of France?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Berlin', correct: false },
          { answer: 'Rome', correct: false },
        ],
      };
      let res = questionCreate(token, quizId, questionBody1);
      expect(res.body).toStrictEqual({ questionId: expect.any(Number) });
      let getQuizRes = quizGetDetails(token, quizId);
      expect(getQuizRes.statusCode).toBe(200);
      const questionBody2 = {
        question: 'who is the most powerful person in the world?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Cheong', correct: false },
          { answer: 'Mao', correct: true },
          { answer: 'Ting', correct: false },
        ],
      };
      res = questionCreate(token, quizId, questionBody2);
      getQuizRes = quizGetDetails(token, quizId);
      expect(getQuizRes.statusCode).toBe(200);
      expect(getQuizRes.body.duration).toEqual(120);
    });
  });
  describe('invalid cases', () => {
    test('invalid token', () => {
      const questionBody = {
        question: 'What is the capital of Germany?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Berlin', correct: true },
          { answer: 'Munich', correct: false },
        ],
      };

      const res = questionCreate('invalid_token', quizId, questionBody);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('missing token', () => {
      const questionBody = {
        question: 'What is the capital of Germany?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Berlin', correct: true },
          { answer: 'Munich', correct: false },
        ],
      };

      const res = questionCreate('', quizId, questionBody);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('user is not the owner of the quiz', () => {
      // Register another user
      const resRegister = userRegister('nice@unsw.edu.au', 'ValidPass123', 'Jane', 'Doe');
      expect(resRegister.statusCode).toBe(200);
      const otherToken = resRegister.body.token;

      const questionBody = {
        question: 'What is the capital of Italy?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Rome', correct: true },
          { answer: 'Milan', correct: false },
        ],
      };

      const res = questionCreate(otherToken, quizId, questionBody);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('question string is less than 5 characters', () => {
      const questionBody = {
        question: 'Hi',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Yes', correct: true },
          { answer: 'No', correct: false },
        ],
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('question string is more than 50 characters', () => {
      const longQuestion = 'A'.repeat(51);
      const questionBody = {
        question: longQuestion,
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Option A', correct: true },
          { answer: 'Option B', correct: false },
        ],
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('number of answers is less than 2', () => {
      const questionBody = {
        question: 'Is the sky blue?',
        duration: 30,
        points: 5,
        answers: [{ answer: 'Yes', correct: true }],
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('number of answers is more than 6', () => {
      const questionBody = {
        question: 'Name all continents',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Asia', correct: true },
          { answer: 'Africa', correct: true },
          { answer: 'North America', correct: true },
          { answer: 'South America', correct: true },
          { answer: 'Antarctica', correct: true },
          { answer: 'Europe', correct: true },
          { answer: 'Australia', correct: true },
        ],
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('question duration is not positive', () => {
      const questionBody = {
        question: 'What is 2 + 2?',
        duration: 0,
        points: 5,
        answers: [
          { answer: '4', correct: true },
          { answer: '5', correct: false },
        ],
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('sum of question durations exceeds quiz duration', () => {
      const firstQuestionBody = {
        question: 'First long question',
        duration: 180,
        points: 5,
        answers: [
          { answer: 'Option A', correct: true },
          { answer: 'Option B', correct: false },
        ],
      };

      const resFirst = questionCreate(token, quizId, firstQuestionBody);
      expect(resFirst.body).toHaveProperty('questionId');

      const secondQuestionBody = {
        question: 'Second question',
        duration: 1,
        points: 5,
        answers: [
          { answer: 'Option A', correct: true },
          { answer: 'Option B', correct: false },
        ],
      };

      const resSecond = questionCreate(token, quizId, secondQuestionBody);
      expect(resSecond.statusCode).toBe(400);
      expect(resSecond.body).toStrictEqual(ERROR);
    });

    test('points awarded are less than 1', () => {
      const questionBody = {
        question: 'What is the speed of light?',
        duration: 60,
        points: 0,
        answers: [
          { answer: '299,792 km/s', correct: true },
          { answer: '150,000 km/s', correct: false },
        ],
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('points awarded are greater than 10', () => {
      const questionBody = {
        question: 'What is the speed of sound?',
        duration: 60,
        points: 11,
        answers: [
          { answer: '343 m/s', correct: true },
          { answer: '150 m/s', correct: false },
        ],
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('answer length shorter than 1 character', () => {
      const questionBody = {
        question: 'What does DNA stand for?',
        duration: 60,
        points: 5,
        answers: [
          { answer: '', correct: true },
          { answer: 'Deoxyribonucleic Acid', correct: false },
        ],
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('answer length longer than 30 characters', () => {
      const longAnswer = 'A'.repeat(31);
      const questionBody = {
        question: 'What does DNA stand for?',
        duration: 60,
        points: 5,
        answers: [
          { answer: longAnswer, correct: true },
          { answer: 'Deoxyribonucleic Acid', correct: false },
        ],
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('duplicate answer strings within the same question', () => {
      const questionBody = {
        question: 'Which planet is known as the Red Planet?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Mars', correct: true },
          { answer: 'Mars', correct: false },
        ],
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('no correct answers provided', () => {
      const questionBody = {
        question: 'Which planet is known as the Blue Planet?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Mars', correct: false },
          { answer: 'Venus', correct: false },
        ],
      };

      const res = questionCreate(token, quizId, questionBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
  });
});
/*
 This is test for AQRe
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
        duration: 0
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
  describe('invalid cases', () => {
    test('invalid_token', () => {
      const res = quizRestore('invalid_token', quizId);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('invalid quiz ID', () => {
      const res = quizRestore(token, 0);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('user is not the owner of th quiz', () => {
      const createUserRes = userRegister('wick@example.com', 'JohnWick123', 'John', 'Wick');
      expect(createUserRes.statusCode).toBe(200);
      token = createUserRes.body.token;
      const res = quizRestore(token, quizId);
      expect(res.statusCode).toBe(403);
    });
    test('quiz is not in trash', () => {
      const res = quizRestore(token, quizId);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('quiz name of the restored quiz is already used by the current logged in user for another quiz', () => {
      quizDelete(token, quizId);
      const createQuizRes = quizCreate(token, 'Fate', 'Are you my master?');
      expect(createQuizRes.statusCode).toBe(200);
      const res = quizRestore(token, quizId);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
  });
});

//////////////////////////////////////////////////////////
///////////this is test DELETE /v1/admin/quiz/trash/empty
///////////////////////////////////////////////////////////
describe('DELETE /v1/admin/quiz/trash/empty', () => {
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

  describe('invalid cases', () => {
    test('invalid token', () => {
      const quizIdsParam = JSON.stringify([quizId1]);
      const emptyRes = trashEmpty('invalid_token', quizIdsParam); 
      expect(emptyRes.statusCode).toBe(401);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });

    test('missing token', () => {
      const emptyRes = trashEmpty('', JSON.stringify([quizId1])); 
      expect(emptyRes.statusCode).toBe(401);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });
    
    test('quiz ID does not exist', () => {
      const emptyRes = trashEmpty(token, JSON.stringify([999999])); 
      expect(emptyRes.statusCode).toBe(403);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });

    test('user is not the owner of the quiz', () => {
      // Register another user
      const resRegister = userRegister('nice@unsw.edu.au', 'ValidPass123', 'Cheong', 'Zhang');
      const otherToken = resRegister.body.token;
      expect(resRegister.statusCode).toBe(200);
      const emptyRes = trashEmpty(otherToken, JSON.stringify([quizId1]));
      expect(emptyRes.statusCode).toBe(403);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });
    test('Quiz is not in the trash',() => {
      const emptyRes = trashEmpty(token, JSON.stringify([quizId2]));
      expect(emptyRes.statusCode).toBe(400);
      expect(emptyRes.body).toStrictEqual(ERROR);
    }) 
  });
});
/////////////////////////////////////////////////
// Test for adminQuizTrashView //////////////////
/////////////////////////////////////////////////
describe('GET /v1/admin/quiz/trash', () => {
  let quizId: number;
  beforeEach(() => {
    const res = quizCreate(token, 'Test quiz', 'description for test quiz');
    expect(res.statusCode).toStrictEqual(200);
    quizId = res.body.quizId;
  })

  describe('invalid cases', () => {
    test('token is empty', () => {
      const res = quizGetTrash('');
      expect(res.statusCode).toStrictEqual(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('token does not refer to valid logged in user session', () => {
      const res = quizGetTrash('invalid token');
      expect(res.statusCode).toStrictEqual(401);
      expect(res.body).toStrictEqual(ERROR);
    });
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
      expect(res.body).toStrictEqual( { quizzes: [
        {
          quizId: quizId,
          name: 'Test quiz'
        }
      ]});
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
            name: 'Test quiz'
          },
          {
            quizId: quizId1,
            name: 'family guy'
          }
        ]
      });
    });

    test('success view trash when there is multiple user', () => {
      const registerRes = userRegister('peter@gmail.com', 'PumkinEater123', 'Peter', 'Griffin');
      expect(registerRes.statusCode).toBe(200);
      const deleteRes = quizDelete(token, quizId);
      expect(deleteRes.statusCode).toStrictEqual(200);
      const res = quizGetTrash(token);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual( { quizzes: [
        {
          quizId: quizId,
          name: 'Test quiz'
        }
      ]});
    });
  });
});

////////////////////////////////////////////////////
// Test for adminQuizQuestionDuplicate /////////////
////////////////////////////////////////////////////
describe('POST /v1/admin/quiz/{quizid}/question/{questionid}/duplicate', () => {
  let quizId: number;
  let questionId: number;
  beforeEach(() => {
    const quizCreateRes = quizCreate(token, 'Test quiz', 'description for test quiz');
    expect(quizCreateRes.statusCode).toStrictEqual(200);
    quizId = quizCreateRes.body.quizId;
    const questionBody = {
      question: 'What is the name of the dog in family guy?',
      duration: 60,
      points: 5,
      answers: [
        { answer: 'Brian', correct: true },
        { answer: 'Babe', correct: false },
        { answer: 'Bart', correct: false },
      ],
    };
    const questionCreateRes = questionCreate(token, quizId, questionBody);
    expect(questionCreateRes.statusCode).toStrictEqual(200);
    questionId = questionCreateRes.body.questionId;
  });

  describe('invalid cases', () => {
    test('question id does not refer to a valid question within this quiz', () => {
      const res = questionDuplicate(token, quizId, 0);
      expect(res.statusCode).toStrictEqual(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('token is invalid', () => {
      const res = questionDuplicate('invalid token', quizId, questionId);
      expect(res.statusCode).toStrictEqual(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('user is not an owner of this quiz', () => {
      const userRegisterRes = userRegister('peter@gmail.com', 'PumkinEater123', 'Peter', 'Griffin');
      expect(userRegisterRes.statusCode).toStrictEqual(200);
      const token1 = userRegisterRes.body.token;
      const res = questionDuplicate(token1, quizId, questionId);
      expect(res.statusCode).toStrictEqual(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('quiz does not exist', () => {
      const res = questionDuplicate(token, 0, questionId);
      expect(res.statusCode).toStrictEqual(403);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('questionId is invalid', () => {
      const questionId = -100;
      const res = questionDuplicate(token, quizId, questionId);
      expect(res.statusCode).toStrictEqual(400);
      expect(res.body).toStrictEqual(ERROR);
    });
  });

  describe('valid cases', () => {
    test('successfully duplicate the question', () => {
      const res = questionDuplicate(token, quizId, questionId);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual({ newQuestionId: expect.any(Number) });
      const newQuestionId = res.body.newQuestionId;

      // get quiz info
      const detailRes = quizGetDetails(token, quizId);
      expect(detailRes.statusCode).toStrictEqual(200);
      expect(detailRes.body.numQuestions).toStrictEqual(2);
      const questions = detailRes.body.questions;
      expect(questions).toStrictEqual(
        [
          {
            questionId: questionId,
            question: 'What is the name of the dog in family guy?',
            duration: 60,
            points: 5,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Brian',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Babe',
                colour: expect.any(String),
                correct: false
              },
              {
                answerId: expect.any(Number),
                answer: 'Bart',
                colour: expect.any(String),
                correct: false
              }
            ]
          },
          {
            questionId: newQuestionId,
            question: 'What is the name of the dog in family guy?',
            duration: 60,
            points: 5,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Brian',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Babe',
                colour: expect.any(String),
                correct: false
              },
              {
                answerId: expect.any(Number),
                answer: 'Bart',
                colour: expect.any(String),
                correct: false
              }
            ]
          }
        ]
      );
    });

    test('successfully update the timeLastEdit time', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = questionDuplicate(token, quizId, questionId);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual({ newQuestionId: expect.any(Number) });

      // get quiz info
      const detailRes = quizGetDetails(token, quizId);
      expect(detailRes.statusCode).toStrictEqual(200);
      expect(detailRes.body.numQuestions).toStrictEqual(2);
      expect(detailRes.body.timeLastEdited).not.toStrictEqual(detailRes.body.timeCreated);
    });
  });
});
/*
 This is test for AQQDelete
 */
describe('DELETE /v1/admin/quiz/:quizId/question/:questionId', () => {
  let quizId: number;
  let questionId: number;
  beforeEach(() => {
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;

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
    questionId = createQuestionRes.body.questionId;
  });
  describe('valid cases', () => {
    test('successful question deletion', () => {
      const res = questionDelete(token, quizId, questionId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});

      const quizRes = quizGetDetails(token, quizId);
      expect(quizRes.statusCode).toBe(200);
      expect(quizRes.body.questions).not.toContainEqual(expect.objectContaining({ questionId }));
    });
    test('successful update last edit time', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = questionDelete(token, quizId, questionId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
      const quizRes = quizGetDetails(token, quizId);
      expect(quizRes.statusCode).toBe(200);
      expect(quizRes.body.timeLastEdited).not.toStrictEqual(quizRes.body.timeCreated);
    });
  });

  describe('invalid cases', () => {
    test('question id does not refer to a valid question within this quiz', () => {
      const res = questionDelete(token, quizId, 0);
      expect(res.statusCode).toStrictEqual(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('token is invalid', () => {
      const res = questionDelete('invalid token', quizId, questionId);
      expect(res.statusCode).toStrictEqual(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('user is not an owner of this quiz', () => {
      const userRegisterRes = userRegister('wick@gmail.com', 'JohnWich123', 'John', 'Wick');
      expect(userRegisterRes.statusCode).toStrictEqual(200);
      const token1 = userRegisterRes.body.token;
      const res = questionDelete(token1, quizId, questionId);
      expect(res.statusCode).toStrictEqual(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('quiz does not exist', () => {
      const res = questionDelete(token, 0, questionId);
      expect(res.statusCode).toStrictEqual(403);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('questionId is invalid', () => {
      const questionId = -100;
      const res = questionDelete(token, quizId, questionId);
      expect(res.statusCode).toStrictEqual(400);
      expect(res.body).toStrictEqual(ERROR);
    });
  });
});

describe('POST /v1/admin/quiz/:quizid/transfer', () => {
  let quizId: number;

  beforeEach(() => {
    // Create a quiz before each test
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId; // Store quizId for reuse
  });

  describe('valid cases', () => {
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

  describe('invalid cases', () => {
    test('invalid token', () => {
      const transferRes = quizTransfer('invalid_token', quizId, 'newuser@example.com');
      expect(transferRes.statusCode).toBe(401);
      expect(transferRes.body).toStrictEqual(ERROR);
    });

    test('missing token', () => {
      const transferRes = quizTransfer('', quizId, 'newuser@example.com');
      expect(transferRes.statusCode).toBe(401);
      expect(transferRes.body).toStrictEqual(ERROR);
    });

    test('user does not exist', () => {
      const transferRes = quizTransfer(token, quizId, 'nonexistent@example.com');
      expect(transferRes.statusCode).toBe(400);
      expect(transferRes.body).toStrictEqual(ERROR);
    });

    test('transferring to self', () => {
      const transferRes = quizTransfer(token, quizId, 'test@example.com');
      expect(transferRes.statusCode).toBe(400);
      expect(transferRes.body).toStrictEqual(ERROR);
    });

    test('user is not the owner of the quiz', () => {
      const newUserRes = userRegister('random@example.com', 'ValidPass123', 'Random', 'User');
      expect(newUserRes.statusCode).toBe(200);

      const newToken = newUserRes.body.token;
      const transferRes = quizTransfer(newToken, quizId, 'newuser@example.com');
      expect(transferRes.statusCode).toBe(403);
      expect(transferRes.body).toStrictEqual(ERROR);
    });

    test('quiz does not exist', () => {
      const transferRes = quizTransfer(token, 999999, 'newuser@example.com');
      expect(transferRes.statusCode).toBe(403);
      expect(transferRes.body).toStrictEqual(ERROR);
    });

    test('target user already has a quiz with the same name', () => {
      // Register the target user
      const newUserRes = userRegister('newuser@example.com', 'ValidPass123', 'Jane', 'Smith');
      expect(newUserRes.statusCode).toBe(200);
      const newToken = newUserRes.body.token;
      
      // Create a quiz for the target user with the same name
      const targetQuizRes = quizCreate(newToken, 'Test Quiz', 'Target user quiz with same name');
      expect(targetQuizRes.statusCode).toBe(200);
    
      const transferRes = quizTransfer(token, quizId, 'newuser@example.com');
      expect(transferRes.statusCode).toBe(400); 
      expect(transferRes.body).toStrictEqual(ERROR);
    });
  });
});

describe('PUT /v1/admin/quiz/:quizid/question/:questionid', () => {
  let quizId: number;
  let questionId: number;

  beforeEach(() => {
    // Create a quiz
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;

    // Create a question
    const questionBody = {
      question: 'What is the capital of France?',
      duration: 60,
      points: 5,
      answers: [
        { answer: 'Paris', correct: true },
        { answer: 'Berlin', correct: false },
      ],
    };
    const createQuestionRes = questionCreate(token, quizId, questionBody);
    expect(createQuestionRes.statusCode).toBe(200);
    questionId = createQuestionRes.body.questionId;
  });

  describe('Valid Cases', () => {
    test('successfully update the quiz question', () => {
      const updatedQuestionBody = {
        question: 'What is the largest country in the world?',
        duration: 120,
        points: 7,
        answers: [
          { answer: 'Russia', correct: true },
          { answer: 'Canada', correct: false },
        ],
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(200);

      const quizDetailsRes = quizGetDetails(token, quizId);
      expect(quizDetailsRes.statusCode).toBe(200);
      const updatedQuestion = quizDetailsRes.body.questions.find((q:any) => q.questionId === questionId);
      expect(updatedQuestion).toBeDefined();
      expect(updatedQuestion.question).toBe(updatedQuestionBody.question);
      expect(updatedQuestion.duration).toBe(updatedQuestionBody.duration);
      expect(updatedQuestion.points).toBe(updatedQuestionBody.points);
    });

    test('successful update should change last edited time', async () => {
      // Get initial quiz details
      const quizDetailsRes = quizGetDetails(token, quizId);
      expect(quizDetailsRes.statusCode).toBe(200);
      const initialTimeLastEdited = quizDetailsRes.body.timeLastEdited;
  
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      const updatedQuestionBody = {
        question: 'What is the largest country in the world?',
        duration: 120,
        points: 7,
        answers: [
          { answer: 'Russia', correct: true },
          { answer: 'Canada', correct: false },
        ],
      };
      const updateRes = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(updateRes.statusCode).toBe(200);

      const updatedQuizDetailsRes = quizGetDetails(token, quizId);
      expect(updatedQuizDetailsRes.statusCode).toBe(200);
      const updatedTimeLastEdited = updatedQuizDetailsRes.body.timeLastEdited;
      expect(updatedTimeLastEdited).not.toBe(initialTimeLastEdited);
    });
  });

  describe('Error Cases', () => {
    test('Invalid questionId does not refer to a valid question within this quiz', () => {
      const updatedQuestionBody = {
        question: 'What is the largest country in the world?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Russia', correct: true },
          { answer: 'Canada', correct: false },
        ],
      };
      // Attempting to update with an invalid questionId
      const res = questionUpdate(token, quizId, 99999, updatedQuestionBody);
      expect(res.statusCode).toBe(400);  // Expect a 400 status code
    });

    test('Invalid token', () => {
      const updatedQuestionBody = {
        question: 'What is the largest country in the world?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Russia', correct: true },
          { answer: 'Canada', correct: false },
        ],
      };
      const res = questionUpdate('invalid_token', quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(401);
    });

    test('Not owner of the quiz (valid token but not the quiz owner)', () => {
      const updatedQuestionBody = {
        question: 'Valid question?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Berlin', correct: false },
        ],
      };
      // Assuming we have another token from a different user who doesn't own this quiz
      const registerOtherUserRes = userRegister('otheruser@example.com', 'OtherValidPass123', 'Jane', 'Doe');
      expect(registerOtherUserRes.statusCode).toBe(200);
      const otherUserToken = registerOtherUserRes.body.token;
      const res = questionUpdate(otherUserToken, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(403);  
    });

    test('Invalid question string length (less than 5 or more than 50 characters)', () => {
      const updatedQuestionBody = {
        question: 'Hi',  // Invalid length (less than 5 characters)
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Berlin', correct: false },
        ],
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(400);
    });

    test('Invalid number of answers (less than 2 or more than 6)', () => {
      const updatedQuestionBody = {
        question: 'Valid question?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: true },  // Only 1 answer (less than 2)
        ],
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(400);
    });

    test('Invalid question duration (not a positive number)', () => {
      const updatedQuestionBody = {
        question: 'Valid question?',
        duration: -1,  // Invalid duration (negative)
        points: 5,
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Berlin', correct: false },
        ],
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(400);
    });

    test('Total duration exceeds 180 seconds after question update', () => {
      // Create the first question with a valid duration
      const questionBody1 = {
        question: 'Question 1',
        duration: 60, 
        points: 5,
        answers: [
          { answer: 'Answer 1', correct: true },
          { answer: 'Answer 2', correct: false },
        ],
      };
      const createQuestionRes1 = questionCreate(token, quizId, questionBody1);
      expect(createQuestionRes1.statusCode).toBe(200);
    
      // Create another question with a small duration
      const questionBody2 = {
        question: 'Question 2',
        duration: 50,
        points: 5,
        answers: [
          { answer: 'Answer 1', correct: true },
          { answer: 'Answer 2', correct: false },
        ],
      };
      const createQuestionRes2 = questionCreate(token, quizId, questionBody2);
      expect(createQuestionRes2.statusCode).toBe(200);
    
      // Now try to update the first question to push total duration over 180 seconds
      const updatedQuestionBody = {
        question: 'Updated Question',
        duration: 100, 
        points: 5,
        answers: [
          { answer: 'Answer A', correct: true },
          { answer: 'Answer B', correct: false },
        ],
      };
    
      const res = questionUpdate(token, quizId, createQuestionRes1.body.questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(400);
    });

    test('Invalid points awarded (less than 1 or greater than 10)', () => {
      const updatedQuestionBody = {
        question: 'Valid question?',
        duration: 60,
        points: 0,  // Invalid points (less than 1)
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Berlin', correct: false },
        ],
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(400);
    });

    test('Answer string length (shorter than 1 character or longer than 30 characters)', () => {
      const updatedQuestionBody = {
        question: 'Valid question?',
        duration: 60,
        points: 5,
        answers: [
          { answer: '', correct: true },  // Invalid answer (empty string)
          { answer: 'Berlin', correct: false },
        ],
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(400);
    });

    test('Duplicate answers in the same question', () => {
      const updatedQuestionBody = {
        question: 'Valid question?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'Paris', correct: false },  // Duplicate answers
        ],
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(400);
    });

    test('No correct answers provided', () => {
      const updatedQuestionBody = {
        question: 'Valid question?',
        duration: 60,
        points: 5,
        answers: [
          { answer: 'Paris', correct: false },
          { answer: 'Berlin', correct: false },  // No correct answer
        ],
      };
      const res = questionUpdate(token, quizId, questionId, updatedQuestionBody);
      expect(res.statusCode).toBe(400);
    });
  });
});
/*
 This is test for AQSC
 */
describe('POST /v1/admin/quiz/:quizId/session/start', () => {
  let quizId: number;
  beforeEach(() => {
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;

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
/////////////////////////////////////////////
// Test for AdminQuizSessionGetStatus /////////////
/////////////////////////////////////////////
describe('GET /v1/admin/quiz/:quizId/session/:sessionId/status', () => {
  let quizId: number;
  beforeEach(() => {
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;

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
    const res = quizSessionGetStatus(token1, quizId, 1);
    expect(res.statusCode).toBe(403);   
  }); 

  test('Session Id does not refer to a valid session within this quiz',() => {
    const res = quizSessionCreate(token, quizId, 2);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({ newSessionId: expect.any(Number) });
    const sessionId = res.body.newSessionId;  
    const res1 = quizSessionGetStatus(token, quizId, sessionId + 1);
    expect(res1.statusCode).toBe(400);
  })  

  test('valid cases', () => {
    const res = quizSessionCreate(token, quizId, 2);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({ newSessionId: expect.any(Number) });
    const sessionId = res.body.newSessionId;  
    const res1 = quizSessionGetStatus(token, quizId, sessionId);
    expect(res1.statusCode).toBe(200);
  });
});