import request from 'sync-request-curl';
import config from '../../src/config.json';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserDetails,
  updateUserDetails,
  updateUserPassword,
  getQuizList,
  getQuizDetails,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  updateQuizDescription,
  getQuizTrash,
  restoreQuiz,
  clear,
  moveQuestion,
  createQuestion,
  requestAdminQuizNameUpdate,
  emptyTrash
} from './apiTestHelpersV1'
import { get } from 'http';
import { findQuizById } from '../../src/utils/helper';
import { json } from 'stream/consumers';

const ERROR = { error: expect.any(String) };

let token: string;
beforeEach(() => {
  clear();
  // Register a user and get the token
  const res = registerUser('test@example.com', 'ValidPass123', 'John', 'Doe');
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
      const res = getQuizList(token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({ quizzes: [] });
    });

    test('successful quiz list retrieval with quizzes', () => {
      // Create a quiz
      const createQuizRes = createQuiz(token, 'Test Quiz', 'A test quiz');
      expect(createQuizRes.statusCode).toBe(200);
      const { quizId } = createQuizRes.body;
      const res = getQuizList(token);
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
      const res = getQuizList('invalid_token');
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('missing token', () => {
      const res = getQuizList('');
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
      const res = createQuiz(token, 'Test Quiz', 'A test quiz');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('quizId');
    });
    test('successful quiz creation with empty description', () => {
      const res = createQuiz(token, 'Test Quiz', '');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('quizId');
    });
  });
  describe('invalid cases', () => {
    test('invalid token', () => {
      const res = createQuiz('invalid_token', 'Test Quiz', 'A test quiz');
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('short name', () => {
      const res = createQuiz(token, 'a', 'A test quiz');
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('long name', () => {
      const res = createQuiz(token, 'a'.repeat(31), 'A test quiz');
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('repeated name', () => {
      const res = createQuiz(token, 'Test Quiz', 'A test quiz');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('quizId');
      const res2 = createQuiz(token, 'Test Quiz', 'A test quiz');
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
      const createQuizRes = createQuiz(token, 'Test Quiz', 'A test quiz');
      expect(createQuizRes.statusCode).toBe(200);
      const { quizId } = createQuizRes.body;
      const res = getQuizDetails(token, quizId);
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
      const res = getQuizDetails('invalid_token', 1);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('missing token', () => {
      const res = getQuizDetails('', 1);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('invalid quiz ID', () => {
      const res = getQuizDetails(token, 0);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('user is not the owner of th quiz', () => {
      const createQuizRes = createQuiz(token, 'Test Quiz', 'A test quiz');
      expect(createQuizRes.statusCode).toBe(200);
      const { quizId } = createQuizRes.body;
      const createUserRes = registerUser('testfds@example.com', 'ValidPass123', 'cheong', 'Zhang');
      expect(createUserRes.statusCode).toBe(200);
      token = createUserRes.body.token;
      const res = getQuizDetails(token, quizId);
      expect(res.statusCode).toBe(403);
    });
    test('nonexistent quiz ID', () => {
      const res = getQuizDetails(token, 1);
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
    const createQuizRes = createQuiz(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;
  });

  describe('invalid cases', () => {
    test('name contains invalid characters', () => {
      const res = requestAdminQuizNameUpdate(quizId, token, 'Алексей');
      expect(res).toStrictEqual(400);
    });

    test('name less than 3 characters', () => {
      const res = requestAdminQuizNameUpdate(quizId, token, 'ha');
      expect(res).toStrictEqual(400);
    });

    test('name is more than 30 characters', () => {
      const res = requestAdminQuizNameUpdate(quizId, token, 'morethanthirtycharsmorethanthirty');
      expect(res).toStrictEqual(400);
    });

    test('name is already used by the current logged in user for another quiz', () => {
      const createQuizRes1 = createQuiz(token, 'My Test Name', 'Do not have the same name as mine!');
      expect(createQuizRes1.statusCode).toStrictEqual(200);
      const res = requestAdminQuizNameUpdate(quizId, token, 'My Test Name');
      expect(res).toStrictEqual(400);
    });

    test('userId is empty', () => {
      const res = requestAdminQuizNameUpdate(quizId, '', 'newName');
      expect(res).toStrictEqual(401);
    });

    test('userId does not refer to a valid logged in user session', () => {
      const res = requestAdminQuizNameUpdate(quizId, 'invalidToken', 'newName');
      expect(res).toStrictEqual(401);
    });

    test('user is not a owner of the quiz', () => {
      const userRes = registerUser('peter@example.com', 'PumpkinEater123', 'Peter', 'Griffin');
      expect(userRes.statusCode).toBe(200);
      const token1 = userRes.body.token;

      const res = requestAdminQuizNameUpdate(quizId, token1, 'newName');
      expect(res).toStrictEqual(403);
    });

    test('quizId does not exist', () => {
      const res = requestAdminQuizNameUpdate(0, token, 'newName');
      expect(res).toStrictEqual(403);
    });
  });

  describe('valid cases', () => {
    test('has correct return type', () => {
      const res = requestAdminQuizNameUpdate(quizId, token, 'myName');
      expect(res).toStrictEqual({});
    });

    test('successful update the quiz name', () => {
      requestAdminQuizNameUpdate(quizId, token, 'newName');
      const res = getQuizDetails(token, quizId);
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
      requestAdminQuizNameUpdate(quizId, token, 'newName');
      const res = getQuizDetails(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body.timeLastEdited).not.toStrictEqual(res.body.timeCreated);
    });
  });
});

// ... existing code ...
describe.skip('PUT /v1/admin/quiz/{quizid}/question/{questionid}/move', () => {
  let quizId: number;
  let questionId1: number;
  let questionId2: number;

  beforeEach(() => {
    // Create a quiz
    const createQuizRes = createQuiz(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;

    // Create two questions
    const createQuestion1Res = createQuestion(token, quizId, {
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

    const createQuestion2Res = createQuestion(token, quizId, {
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
      const res = moveQuestion(token, quizId, questionId1, 1);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});

      // Verify the order of questions
      const quizRes = getQuizDetails(token, quizId);
      expect(quizRes.statusCode).toBe(200);
      const quiz = quizRes.body;
      expect(quiz.questions[0].questionId).toBe(questionId2);
      expect(quiz.questions[1].questionId).toBe(questionId1);
    });

    test('move question to the same position (no change)', () => {
      const res = moveQuestion(token, quizId, questionId1, 0);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});

      // Verify the order of questions remains unchanged
      const quizRes = getQuizDetails(token, quizId);
      expect(quizRes.statusCode).toBe(200);
      const quiz = quizRes.body;
      expect(quiz.questions[0].questionId).toBe(questionId1);
      expect(quiz.questions[1].questionId).toBe(questionId2);
    });
  });

  describe('invalid cases', () => {
    test('invalid token', () => {
      const res = moveQuestion('invalid_token', quizId, questionId1, 1);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('user is not the owner of the quiz', () => {
      const newUserRes = registerUser('newuser@example.com', 'Password123', 'New', 'User');
      expect(newUserRes.statusCode).toBe(200);
      const newToken = newUserRes.body.token;

      const res = moveQuestion(newToken, quizId, questionId1, 1);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('quiz does not exist', () => {
      const res = moveQuestion(token, 999999, questionId1, 1);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('question does not exist in the quiz', () => {
      const res = moveQuestion(token, quizId, 999999, 1);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('new position is less than 0', () => {
      const res = moveQuestion(token, quizId, questionId1, -1);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('new position is greater than n-1', () => {
      const res = moveQuestion(token, quizId, questionId1, 2);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('new position is the same as the current position', () => {
      const res = moveQuestion(token, quizId, questionId1, 0);
      expect(res.statusCode).toBe(400);
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
    const createQuizRes = createQuiz(token, 'Fate', 'Description');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;
  });

  describe('valid cases', () => {
    test('should update the description of the quiz', () => {
      const res = updateQuizDescription(token, quizId, 'An updated test quiz');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
      const res1 = getQuizDetails(token, quizId);
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
      const res = updateQuizDescription(token, quizId, 'An updated test quiz');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
      const res1 = getQuizDetails(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res1.body.timeLastEdited).not.toStrictEqual(res1.body.timeCreated);
    });
  });

  describe('invalid cases', () => {
    test('invalid_token', () => {
      const res = updateQuizDescription('invalid_token', quizId, 'An updated test quiz');

      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('invalid quiz ID', () => {
      const res = updateQuizDescription(token, 0, 'An updated test quiz');
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('Description is more than 100 characters in length', () => {
      const res = updateQuizDescription(token, quizId, 'Description'.repeat(10));
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('user is not the owner of th quiz', () => {
      const createUserRes = registerUser('wick@example.com', 'JohnWick123', 'John', 'Wick');
      expect(createUserRes.statusCode).toBe(200);
      token = createUserRes.body.token;
      const res = updateQuizDescription(token, quizId, 'An updated test quiz');
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
    const createQuizRes = createQuiz(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;
  });

  describe('valid cases', () => {
    test('successful quiz removal', () => {
      const res = deleteQuiz(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});

      // Verify the quiz is deleted using getQuizList from apihelpertest
      const resList = getQuizList(token);
      expect(resList.statusCode).toBe(200);
      expect(resList.body.quizzes).not.toContainEqual(expect.objectContaining({ quizId }));
    });
  });

  describe('invalid cases', () => {
    test('invalid token', () => {
      // Try deleting the quiz with an invalid token
      const res = deleteQuiz('invalid_token', quizId);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('quiz ID does not exist', () => {
      // Try deleting a non-existent quiz ID
      const res = deleteQuiz(token, 999999); // Non-existent quiz ID
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('user is not the owner of the quiz', () => {
      // Register another user and attempt to delete the quiz created by the original user
      const userRes = registerUser('peter@example.com', 'ValidPass123', 'Peter', 'Griffin');
      expect(userRes.statusCode).toBe(200);
      const newToken = userRes.body.token;

      // Attempt to delete with the new user's token
      const res = deleteQuiz(newToken, quizId);
      expect(res.statusCode).toBe(401);
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
    const quizResponse = createQuiz(token, 'Test Quiz', 'A test quiz');
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

      const res = createQuestion(token, quizId, questionBody);
      expect(res.body).toStrictEqual({ questionId: expect.any(Number) });
      const getQuizRes = getQuizDetails(token, quizId);
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
      let res = createQuestion(token, quizId, questionBody1);
      expect(res.body).toStrictEqual({ questionId: expect.any(Number) });
      let getQuizRes = getQuizDetails(token, quizId);
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
      res = createQuestion(token, quizId, questionBody2);
      getQuizRes = getQuizDetails(token, quizId);
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

      const res = createQuestion('invalid_token', quizId, questionBody);
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

      const res = createQuestion('', quizId, questionBody);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('user is not the owner of the quiz', () => {
      // Register another user
      const resRegister = registerUser('nice@unsw.edu.au', 'ValidPass123', 'Jane', 'Doe');
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

      const res = createQuestion(otherToken, quizId, questionBody);
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

      const res = createQuestion(token, quizId, questionBody);
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

      const res = createQuestion(token, quizId, questionBody);
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

      const res = createQuestion(token, quizId, questionBody);
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

      const res = createQuestion(token, quizId, questionBody);
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

      const res = createQuestion(token, quizId, questionBody);
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

      const resFirst = createQuestion(token, quizId, firstQuestionBody);
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

      const resSecond = createQuestion(token, quizId, secondQuestionBody);
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

      const res = createQuestion(token, quizId, questionBody);
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

      const res = createQuestion(token, quizId, questionBody);
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

      const res = createQuestion(token, quizId, questionBody);
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

      const res = createQuestion(token, quizId, questionBody);
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

      const res = createQuestion(token, quizId, questionBody);
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

      const res = createQuestion(token, quizId, questionBody);
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
    const createQuizRes = createQuiz(token, 'Fate', 'Description');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;
  });
  describe('valid cases', () => {
    test('should restore quiz', () => {
      deleteQuiz(token, quizId);
      const res = restoreQuiz(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
      const res1 = getQuizDetails(token, quizId);
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
      deleteQuiz(token, quizId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = restoreQuiz(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
      const res1 = getQuizDetails(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res1.body.timeLastEdited).not.toStrictEqual(res1.body.timeCreated);
    });
  });
  describe('invalid cases', () => {
    test('invalid_token', () => {
      const res = restoreQuiz('invalid_token', quizId);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('invalid quiz ID', () => {
      const res = restoreQuiz(token, 0);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('user is not the owner of th quiz', () => {
      const createUserRes = registerUser('wick@example.com', 'JohnWick123', 'John', 'Wick');
      expect(createUserRes.statusCode).toBe(200);
      token = createUserRes.body.token;
      const res = restoreQuiz(token, quizId);
      expect(res.statusCode).toBe(403);
    });
    test('quiz is not in trash', () => {
      const res = restoreQuiz(token, quizId);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('quiz name of the restored quiz is already used by the current logged in user for another quiz', () => {
      deleteQuiz(token, quizId);
      const createQuizRes = createQuiz(token, 'Fate', 'Are you my master?');
      expect(createQuizRes.statusCode).toBe(200);
      const res = restoreQuiz(token, quizId);
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
    let createQuizRes = createQuiz(token, 'Test Quiz1', 'A test quiz1');
    expect(createQuizRes.statusCode).toBe(200);
    quizId1 = createQuizRes.body.quizId;

    createQuizRes = createQuiz(token, 'Test Quiz2', 'A test quiz2');
    expect(createQuizRes.statusCode).toBe(200);
    quizId2 = createQuizRes.body.quizId;

    // Delete the quiz
    const deleteQuizRes = deleteQuiz(token, quizId1);
    expect(deleteQuizRes.statusCode).toBe(200);
  });

  describe('valid cases', () => {
    test('successful empty trash', () => {
      const quizIdsParam = JSON.stringify([quizId1]);
      const emptyRes = emptyTrash(token, quizIdsParam);
      expect(emptyRes.statusCode).toBe(200);
      expect(emptyRes.body).toStrictEqual({});
      const quizListRes = getQuizList(token);
      expect(quizListRes.statusCode).toBe(200);
      expect(findQuizById(quizId1)).toBeUndefined();
    });
    test('successful empty trash with multiple quizzes', () => {
      deleteQuiz(token, quizId2);
      const quizIdsParam = JSON.stringify([quizId1, quizId2]);
      const emptyRes = emptyTrash(token, quizIdsParam);
      expect(emptyRes.statusCode).toBe(200);
      expect(emptyRes.body).toStrictEqual({});
      const quizListRes = getQuizList(token);
      expect(quizListRes.statusCode).toBe(200);
      expect(findQuizById(quizId1)).toBeUndefined();
      expect(findQuizById(quizId2)).toBeUndefined
    });
  });

  describe('invalid cases', () => {
    test('invalid token', () => {
      const quizIdsParam = JSON.stringify([quizId1]);
      const emptyRes = emptyTrash('invalid_token', quizIdsParam); 
      expect(emptyRes.statusCode).toBe(401);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });

    test('missing token', () => {
      const emptyRes = emptyTrash('', JSON.stringify([quizId1])); 
      expect(emptyRes.statusCode).toBe(401);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });
    
    test('quiz ID does not exist', () => {
      const emptyRes = emptyTrash(token, JSON.stringify([999999])); 
      expect(emptyRes.statusCode).toBe(403);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });

    test('user is not the owner of the quiz', () => {
      // Register another user
      const resRegister = registerUser('nice@unsw.edu.au', 'ValidPass123', 'Cheong', 'Zhang');
      const otherToken = resRegister.body.token;
      expect(resRegister.statusCode).toBe(200);
      const emptyRes = emptyTrash(otherToken, JSON.stringify([quizId1]));
      expect(emptyRes.statusCode).toBe(403);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });
    test('Quiz is not in the trash',() => {
      const emptyRes = emptyTrash(token, JSON.stringify([quizId2]));
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
    const res = createQuiz(token, 'Test quiz', 'description for test quiz');
    expect(res.statusCode).toStrictEqual(200);
    quizId = res.body.quizId;
  })

  describe('invalid cases', () => {
    test('token is empty', () => {
      const res = getQuizTrash('');
      expect(res.statusCode).toStrictEqual(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('token does not refer to valid logged in user session', () => {
      const res = getQuizTrash('invalid token');
      expect(res.statusCode).toStrictEqual(401);
      expect(res.body).toStrictEqual(ERROR);
    });
  });

  describe('valid cases', () => {
    beforeEach(() => {
      const loginRes = loginUser('test@example.com', 'ValidPass123');
      expect(loginRes.statusCode).toStrictEqual(200);
    });

    test('success view trash for user with 0 quiz in trash', () => {
      const res = getQuizTrash(token);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual({ quizzes: [] });
    });

    test('success view trash for user with 1 quiz in trash', () => {
      const deleteRes = deleteQuiz(token, quizId);
      expect(deleteRes.statusCode).toStrictEqual(200);
      const res = getQuizTrash(token);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual( { quizzes: [
        {
          quizId: quizId,
          name: 'Test quiz'
        }
      ]});
    });

    test('success view trash for user with multiple quizzes in trash', () => {
      const createQuizRes = createQuiz(token, 'family guy', 'what is the dog name');
      expect(createQuizRes.statusCode).toStrictEqual(200);
      const quizId1 = createQuizRes.body.quizId;
      const deleteRes1 = deleteQuiz(token, quizId);
      expect(deleteRes1.statusCode).toStrictEqual(200);
      const deleteRes2 = deleteQuiz(token, quizId1);
      expect(deleteRes2.statusCode).toStrictEqual(200);
      const res = getQuizTrash(token);
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
      const registerRes = registerUser('peter@gmail.com', 'PumkinEater123', 'Peter', 'Griffin');
      expect(registerRes.statusCode).toBe(200);
      const deleteRes = deleteQuiz(token, quizId);
      expect(deleteRes.statusCode).toStrictEqual(200);
      const res = getQuizTrash(token);
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
//////////////////////////////////////////////////////////
///////////this is test DELETE /v1/admin/quiz/trash/empty
///////////////////////////////////////////////////////////
describe('DELETE /v1/admin/quiz/trash/empty', () => {
  let quizId1: number;
  let quizId2: number;
  beforeEach(() => {
    // Create a quiz before each test in this suite
    let createQuizRes = createQuiz(token, 'Test Quiz1', 'A test quiz1');
    expect(createQuizRes.statusCode).toBe(200);
    quizId1 = createQuizRes.body.quizId;

    createQuizRes = createQuiz(token, 'Test Quiz2', 'A test quiz2');
    expect(createQuizRes.statusCode).toBe(200);
    quizId2 = createQuizRes.body.quizId;


    // Delete the quiz
    const deleteQuizRes = deleteQuiz(token, quizId1);
    expect(deleteQuizRes.statusCode).toBe(200);
  });

  describe('valid cases', () => {
    test('successful empty trash', () => {
      const quizIdsParam = JSON.stringify([quizId1]);
      const emptyRes = emptyTrash(token, quizIdsParam);
      expect(emptyRes.statusCode).toBe(200);
      expect(emptyRes.body).toStrictEqual({});
      const quizListRes = getQuizList(token);
      expect(quizListRes.statusCode).toBe(200);
      expect(findQuizById(quizId1)).toBeUndefined();
    });
    test('successful empty trash with multiple quizzes', () => {
      deleteQuiz(token, quizId2);
      const quizIdsParam = JSON.stringify([quizId1, quizId2]);
      const emptyRes = emptyTrash(token, quizIdsParam);
      expect(emptyRes.statusCode).toBe(200);
      expect(emptyRes.body).toStrictEqual({});
      const quizListRes = getQuizList(token);
      expect(quizListRes.statusCode).toBe(200);
      expect(findQuizById(quizId1)).toBeUndefined();
      expect(findQuizById(quizId2)).toBeUndefined
    });
  });

  describe('invalid cases', () => {
    test('invalid token', () => {
      const quizIdsParam = JSON.stringify([quizId1]);
      const emptyRes = emptyTrash('invalid_token', quizIdsParam); 
      expect(emptyRes.statusCode).toBe(401);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });

    test('missing token', () => {
      const emptyRes = emptyTrash('', JSON.stringify([quizId1])); 
      expect(emptyRes.statusCode).toBe(401);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });

    test('quiz ID does not exist', () => {
      const emptyRes = emptyTrash(token, JSON.stringify([999999])); 
      expect(emptyRes.statusCode).toBe(403);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });

    test('user is not the owner of the quiz', () => {
      // Register another user
      const resRegister = registerUser('nice@unsw.edu.au', 'ValidPass123', 'Cheong', 'Zhang');
      const otherToken = resRegister.body.token;
      expect(resRegister.statusCode).toBe(200);
      const emptyRes = emptyTrash(otherToken, JSON.stringify([quizId1]));
      expect(emptyRes.statusCode).toBe(403);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });
    test('Quiz is not in the trash',() => {
      const emptyRes = emptyTrash(token, JSON.stringify([quizId2]));
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
    const res = createQuiz(token, 'Test quiz', 'description for test quiz');
    expect(res.statusCode).toStrictEqual(200);
    quizId = res.body.quizId;
  })

  describe('invalid cases', () => {
    test('token is empty', () => {
      const res = getQuizTrash('');
      expect(res.statusCode).toStrictEqual(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('token does not refer to valid logged in user session', () => {
      const res = getQuizTrash('invalid token');
      expect(res.statusCode).toStrictEqual(401);
      expect(res.body).toStrictEqual(ERROR);
    });
  });

  describe('valid cases', () => {
    beforeEach(() => {
      const loginRes = loginUser('test@example.com', 'ValidPass123');
      expect(loginRes.statusCode).toStrictEqual(200);
    });

    test('success view trash for user with 0 quiz in trash', () => {
      const res = getQuizTrash(token);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual({ quizzes: [] });
    });

    test('success view trash for user with 1 quiz in trash', () => {
      const deleteRes = deleteQuiz(token, quizId);
      expect(deleteRes.statusCode).toStrictEqual(200);
      const res = getQuizTrash(token);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual( { quizzes: [
        {
          quizId: quizId,
          name: 'Test quiz'
        }
      ]});
    });

    test('success view trash for user with multiple quizzes in trash', () => {
      const createQuizRes = createQuiz(token, 'family guy', 'what is the dog name');
      expect(createQuizRes.statusCode).toStrictEqual(200);
      const quizId1 = createQuizRes.body.quizId;
      const deleteRes1 = deleteQuiz(token, quizId);
      expect(deleteRes1.statusCode).toStrictEqual(200);
      const deleteRes2 = deleteQuiz(token, quizId1);
      expect(deleteRes2.statusCode).toStrictEqual(200);
      const res = getQuizTrash(token);
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
      const registerRes = registerUser('peter@gmail.com', 'PumkinEater123', 'Peter', 'Griffin');
      expect(registerRes.statusCode).toBe(200);
      const deleteRes = deleteQuiz(token, quizId);
      expect(deleteRes.statusCode).toStrictEqual(200);
      const res = getQuizTrash(token);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual({ quizzes: [
        {
          quizId: quizId,
          name: 'Test quiz'
        }
      ]});
    });
  });
});
