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
  createQuestion
} from './apiTestHelpersV1'

const BASE_URL = `${config.url}:${config.port}/v1/admin/auth`;
const ERROR = { error: expect.any(String) };

// Parse the response body as JSON
function parse(res: string | Buffer) {
  return JSON.parse(res.toString());
}

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

describe('GET /v1/admin/quiz/list', () => {

  describe('valid cases', () => {
    test('successful quiz list retrieval with no quizzes', () => {
      const res = request('GET', `${config.url}:${config.port}/v1/admin/quiz/list`, {
        qs: { token }
      });
      expect(res.statusCode).toBe(200);
      expect(parse(res.body)).toStrictEqual({ quizzes: [] });
    });

    test('successful quiz list retrieval with quizzes', () => {
      // Create a quiz
      const createQuizRes = request('POST', `${config.url}:${config.port}/v1/admin/quiz`, {
        json: {
          token,
          name: 'Test Quiz',
          description: 'A test quiz'
        }
      });
      expect(createQuizRes.statusCode).toBe(200);
      const { quizId } = parse(createQuizRes.body);

      const res = request('GET', `${config.url}:${config.port}/v1/admin/quiz/list`, {
        qs: { token }
      });
      expect(res.statusCode).toBe(200);
      const body = parse(res.body);
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
      const res = request('GET', `${config.url}:${config.port}/v1/admin/quiz/list`, {
        qs: { token: 'invalid_token' }
      });
      expect(res.statusCode).toBe(401);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('missing token', () => {
      const res = request('GET', `${config.url}:${config.port}/v1/admin/quiz/list`);
      expect(res.statusCode).toBe(401);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });
  });
});

describe('POST /v1/admin/quiz', () => {
  describe('valid cases', () => {
    test('successful quiz creation', () => {
      const res = request('POST', `${config.url}:${config.port}/v1/admin/quiz`, {
        json: {
          token,
          name: 'Test Quiz',
          description: 'A test quiz'
        }
      });
      expect(res.statusCode).toBe(200);
      expect(parse(res.body)).toHaveProperty('quizId');
    });
    test('successful quiz creation with empty description', () => {
      const res = request('POST', `${config.url}:${config.port}/v1/admin/quiz`, {
        json: {
          token,
          name: 'Test Quiz',
          description: ''
        }
      });
      expect(res.statusCode).toBe(200);
      expect(parse(res.body)).toHaveProperty('quizId');
    });
  });
  describe('invalid cases', () => {
    test('invalid token', () => {
      const res = request('POST', `${config.url}:${config.port}/v1/admin/quiz`, {
        qs: { token: 'invalid_token' }
      });
      expect(res.statusCode).toBe(401);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });
    test('short name', () => {
      const res = request('POST', `${config.url}:${config.port}/v1/admin/quiz`, {
        json: {
          token,
          name: 'a',
          description: 'A test quiz'
        }
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });
    test('long name', () => {
      const res = request('POST', `${config.url}:${config.port}/v1/admin/quiz`, {
        json: {
          token,
          name: 'a'.repeat(31),
          description: 'A test quiz'
        }
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });
    test('repeated name', () => {
      const res = request('POST', `${config.url}:${config.port}/v1/admin/quiz`, {
        json: {
          token,
          name: 'Test Quiz',
          description: 'A test quiz'
        }
      });
      expect(res.statusCode).toBe(200);
      expect(parse(res.body)).toHaveProperty('quizId');
      const res2 = request('POST', `${config.url}:${config.port}/v1/admin/quiz`, {
        json: {
          token,
          name: 'Test Quiz',
          description: 'A test quiz'
        }
      });
      expect(res2.statusCode).toBe(400);
      expect(parse(res2.body)).toStrictEqual(ERROR);
    });
  });
});
/*
 This is test for AQI
 */
describe('GET /v1/admin/quiz/:quizId', () => {
  describe('valid cases', () => {
    test('successful quiz retrieval', () => {
      const createQuizRes = request('POST', `${config.url}:${config.port}/v1/admin/quiz`, {
        json: {
          token,
          name: 'Test Quiz',
          description: 'A test quiz'
        }
      });
      expect(createQuizRes.statusCode).toBe(200);
      const { quizId } = parse(createQuizRes.body);

      const res = request('GET', `${config.url}:${config.port}/v1/admin/quiz/${quizId}`, {
        qs: { token }
      });
      expect(res.statusCode).toBe(200);
      expect(parse(res.body)).toStrictEqual({
        quizId,
        name: 'Test Quiz',
        description: 'A test quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number)
      });
    });
  });
  describe('invalid cases', () => {
    test('invalid token', () => {
      const res = request('GET', `${config.url}:${config.port}/v1/admin/quiz/1`, {
        qs: { token: 'invalid_token' }
      });
      expect(res.statusCode).toBe(401);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });
    test('missing token', () => {
      const res = request('GET', `${config.url}:${config.port}/v1/admin/quiz/1`);
      expect(res.statusCode).toBe(401);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });
    test('invalid quiz ID', () => {
      const res = request('GET', `${config.url}:${config.port}/v1/admin/quiz/0`, {
        qs: { token }
      });
      expect(res.statusCode).toBe(403);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('user is not the owner of th quiz', () => {
      const createQuizRes = request('POST', `${config.url}:${config.port}/v1/admin/quiz`, {
        json: {
          token,
          name: 'Test Quiz',
          description: 'A test quiz'
        }
      });
      expect(createQuizRes.statusCode).toBe(200);
      const { quizId } = parse(createQuizRes.body);
      const createUserRes = request('POST', `${BASE_URL}/register`, {
        json: {
          email: 'testfds@example.com',
          password: 'ValidPass123',
          nameFirst: 'cheong',
          nameLast: 'Zhang'
        }
      });
      expect(createUserRes.statusCode).toBe(200);
      token = parse(createUserRes.body).token;
      const res = request('GET', `${config.url}:${config.port}/v1/admin/quiz/${quizId}`, {
        qs: { token }
      });
      expect(res.statusCode).toBe(403);
    });
    test('nonexistent quiz ID', () => {
      const res = request('GET', `${config.url}:${config.port}/v1/admin/quiz/1`, {
        qs: { token }
      });
      expect(res.statusCode).toBe(403);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });
  });
});



/////////////////////////////////////////////////////
// Test for adminQuizNameUpdate /////////////////////
/////////////////////////////////////////////////////

/**
 * function to help implement the request
 *    - if no error, return the content
 *    - if there is error, return the statusCode
 * 
 * @param quizId 
 * @param token 
 * @param name 
 * @returns 
 */
function requestAdminQuizNameUpdate(quizId: Number, token: String, name: String) {
  const res = request(
    'PUT',
    `${config.url}:${config.port}/v1/admin/quiz/${quizId}/name`,
    {
      json: {
        token,
        name
      }
    }
  );

  if (res.statusCode === 200) {
    return parse(res.body);
  }
  return res.statusCode;
}

describe('PUT /v1/admin/quiz/{quizid}/name', () => {
  let quizId: Number;
  beforeEach(() => {
    // create a quiz
    const createQuizRes = request('POST', `${config.url}:${config.port}/v1/admin/quiz`, {
      json: {
        token,
        name: 'Test Quiz',
        description: 'A test quiz'
      }
    });
    expect(createQuizRes.statusCode).toBe(200);
    quizId = parse(createQuizRes.body).quizId;
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
      const createQuizRes1 = request('POST', `${config.url}:${config.port}/v1/admin/quiz`, {
        json: {
          token,
          name: 'My Test Name',
          description: 'Do not have the same name as mine!'
        }
      });
      expect(createQuizRes1.statusCode).toStrictEqual(200);
      const res = requestAdminQuizNameUpdate(quizId, token, 'My Test Name');
      expect(res).toStrictEqual(400);
    });

    test('userId is empty', () => {
      const res = requestAdminQuizNameUpdate(quizId, "", "newName");
      expect(res).toStrictEqual(401);
    });

    test('userId does not refer to a valid logged in user session', () => {
      const res = requestAdminQuizNameUpdate(quizId, "invalidToken", 'newName');
      expect(res).toStrictEqual(401);
    });

    test('user is not a owner of the quiz', () => {
      const userRes = request('POST', `${BASE_URL}/register`, {
        json: {
          email: 'peter@example.com',
          password: 'PumpkinEater123',
          nameFirst: 'Peter',
          nameLast: 'Griffin'
        }
      });
      expect(userRes.statusCode).toBe(200);
      const token1 = parse(userRes.body).token;

      const res = requestAdminQuizNameUpdate(quizId, token1, "newName");
      expect(res).toStrictEqual(403);
    });

    test('quizId does not exist', () => {
      const res = requestAdminQuizNameUpdate(0, token, "newName");
      expect(res).toStrictEqual(403);
    });
  });

  describe('valid cases', () => {
    test('has correct return type', () => {
      const res = requestAdminQuizNameUpdate(quizId, token, "myName");
      expect(res).toStrictEqual({});
    });

    test('successful update the quiz name', () => {
      requestAdminQuizNameUpdate(quizId, token, "newName");
      const res = request('GET', `${config.url}:${config.port}/v1/admin/quiz/${quizId}`, {
        qs: { token }
      });
      expect(res.statusCode).toBe(200);
      expect(parse(res.body)).toStrictEqual({
        quizId,
        name: 'newName',
        description: 'A test quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number)
      });
    });

    test('successful update last edit time', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      requestAdminQuizNameUpdate(quizId, token, "newName")
      const res = request('GET', `${config.url}:${config.port}/v1/admin/quiz/${quizId}`, {
        qs: { token }
      });
      expect(res.statusCode).toBe(200);
      expect(parse(res.body).timeLastEdited).not.toStrictEqual(parse(res.body).timeCreated);
    });
  })
});

// ... existing code ...
describe.skip('PUT /v1/admin/quiz/{quizid}/question/{questionid}/move', () => {
  let quizId: number;
  let questionId1: number;
  let questionId2: number;

  beforeEach(() => {
    // Create a quiz
    const createQuizRes = createQuiz(token, 'Test Quiz', 'A test quiz', 60);
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

///////////////////////////////////////////////////////////////////
///test for adminQuizQuestionCreate
///////////////////////////////////////////////////////////////////
describe('POST /v1/admin/quiz/:quizId/question', () => {
  let quizId: number;

  beforeEach(() => {
    // Create a quiz before each test using the helper function with duration
    const quizResponse = createQuiz(token, 'Test Quiz', 'A test quiz', 180);
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
      expect(res).toHaveProperty('questionId');
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
      expect(res).toStrictEqual(ERROR);
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
      expect(res).toStrictEqual(ERROR);
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
      expect(res).toStrictEqual(ERROR);
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
      expect(res).toStrictEqual(ERROR);
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
      expect(res).toStrictEqual(ERROR);
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
      expect(res).toStrictEqual(ERROR);
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
      expect(res).toStrictEqual(ERROR);
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
      expect(res).toStrictEqual(ERROR);
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
      expect(resFirst).toHaveProperty('questionId');

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
      expect(resSecond).toStrictEqual(ERROR);
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
      expect(res).toStrictEqual(ERROR);
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
      expect(res).toStrictEqual(ERROR);
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
      expect(res).toStrictEqual(ERROR);
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
      expect(res).toStrictEqual(ERROR);
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
      expect(res).toStrictEqual(ERROR);
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
      expect(res).toStrictEqual(ERROR);
    });
  });
});
