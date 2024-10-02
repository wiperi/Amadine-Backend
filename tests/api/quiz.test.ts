import request from 'sync-request-curl';
import config from '../../src/config.json';

const BASE_URL = `${config.url}:${config.port}/v1/admin/auth`;
const ERROR = { error: expect.any(String) };

// Parse the response body as JSON
function parse(res: string | Buffer) {
  return JSON.parse(res.toString());
}

let token: string;
beforeEach(() => {
  request('DELETE', `${config.url}:${config.port}/v1/clear`);
  // Register a user and get the token
  const res = request('POST', `${BASE_URL}/register`, {
    json: {
      email: 'test@example.com',
      password: 'ValidPass123',
      nameFirst: 'John',
      nameLast: 'Doe'
    }
  });
  expect(res.statusCode).toBe(200);
  token = parse(res.body).token;
});

afterAll(() => {
  request('DELETE', `${config.url}:${config.port}/v1/clear`);
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

describe('POST /v1/admin/quiz',( ) => {
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
      await new Promise(resolve => setTimeout (resolve, 1000));
      requestAdminQuizNameUpdate(quizId, token, "newName")
      const res = request('GET', `${config.url}:${config.port}/v1/admin/quiz/${quizId}`, {
        qs: { token }
      });
      expect(res.statusCode).toBe(200);
      expect(parse(res.body).timeLastEdited).not.toStrictEqual(parse(res.body).timeCreated);
    });
  })
});
///////////////////////////////////////////////////////////////////
///test for adminQuizQuestionCreate
///////////////////////////////////////////////////////////////////
describe('POST /v1/admin/quiz/:quizId/question', () => {

  let quizId: number;
  beforeEach(() => {
    // Create a quiz before each test
    const resQuiz = request('POST', `${BASE_URL}/v1/admin/quiz`, {
      json: {
        token,
        name: 'Test Quiz',
        description: 'A test quiz',
      },
    });
    expect(resQuiz.statusCode).toBe(200);
    quizId = parse(resQuiz.body).quizId;
  });

  describe('valid cases', () => {
    test('successful question creation', () => {
      const res = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          token,
          questionBody: {
            question: 'What is the capital of France?',
            duration: 60,
            points: 5,
            answers: [
              { answer: 'Paris', correct: true },
              { answer: 'Berlin', correct: false },
              { answer: 'Rome', correct: false },
            ],
          },
        },
      });
      expect(res.statusCode).toBe(200);
      expect(parse(res.body)).toHaveProperty('questionId');
    });
  });

  describe('invalid cases', () => {
    test('invalid token', () => {
      const res = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          token: 'invalid_token',
          questionBody: {
            question: 'What is the capital of Germany?',
            duration: 60,
            points: 5,
            answers: [
              { answer: 'Berlin', correct: true },
              { answer: 'Munich', correct: false },
            ],
          },
        },
      });
      expect(res.statusCode).toBe(401);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('missing token', () => {
      const res = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          questionBody: {
            question: 'What is the capital of Germany?',
            duration: 60,
            points: 5,
            answers: [
              { answer: 'Berlin', correct: true },
              { answer: 'Munich', correct: false },
            ],
          },
        },
      });
      expect(res.statusCode).toBe(401);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('user is not the owner of the quiz', () => {
      // Register another user
      const resRegister = request('POST', `${BASE_URL}/v1/admin/auth/register`, {
        json: {
          email: 'otheruser@example.com',
          password: 'Password123',
          nameFirst: 'Other',
          nameLast: 'User',
        },
      });
      expect(resRegister.statusCode).toBe(200);
      const otherToken = parse(resRegister.body).token;

      const res = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          token: otherToken,
          questionBody: {
            question: 'What is the capital of Italy?',
            duration: 60,
            points: 5,
            answers: [
              { answer: 'Rome', correct: true },
              { answer: 'Milan', correct: false },
            ],
          },
        },
      });
      expect(res.statusCode).toBe(403);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('question string is less than 5 characters', () => {
      const res = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          token,
          questionBody: {
            question: 'Hi',
            duration: 60,
            points: 5,
            answers: [
              { answer: 'Yes', correct: true },
              { answer: 'No', correct: false },
            ],
          },
        },
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('question string is more than 50 characters', () => {
      const longQuestion = 'A'.repeat(51);
      const res = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          token,
          questionBody: {
            question: longQuestion,
            duration: 60,
            points: 5,
            answers: [
              { answer: 'Option A', correct: true },
              { answer: 'Option B', correct: false },
            ],
          },
        },
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('number of answers is less than 2', () => {
      const res = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          token,
          questionBody: {
            question: 'Is the sky blue?',
            duration: 30,
            points: 5,
            answers: [{ answer: 'Yes', correct: true }],
          },
        },
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('number of answers is more than 6', () => {
      const res = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          token,
          questionBody: {
            question: 'name all mate',
            duration: 60,
            points: 5,
            answers: [
              { answer: 'cheong', correct: true },
              { answer: 'guangwei', correct: true },
              { answer: 'zach', correct: true },
              { answer: 'ting', correct: true },
              { answer: 'tian', correct: true },
              { answer: 'hashar', correct: true },
              { answer: 'amber', correct: true },
            ],
          },
        },
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('question duration is not positive', () => {
      const res = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          token,
          questionBody: {
            question: 'What is 2 + 2?',
            duration: 0,
            points: 5,
            answers: [
              { answer: '4', correct: true },
              { answer: '5', correct: false },
            ],
          },
        },
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('sum of question durations exceeds 3 minutes', () => {
      const firstQuestionRes = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          token,
          questionBody: {
            question: 'First long question',
            duration: 180,
            points: 5,
            answers: [
              { answer: 'Option A', correct: true },
              { answer: 'Option B', correct: false },
            ],
          },
        },
      });
      expect(firstQuestionRes.statusCode).toBe(200);

      const res = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          token,
          questionBody: {
            question: 'Second question',
            duration: 1,
            points: 5,
            answers: [
              { answer: 'Option A', correct: true },
              { answer: 'Option B', correct: false },
            ],
          },
        },
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('points awarded are less than 1', () => {
      const res = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          token,
          questionBody: {
            question: 'test quetion abcd?',
            duration: 60,
            points: 0,
            answers: [
              { answer: 'yes wecan', correct: true },
              { answer: 'no we can not', correct: false },
            ],
          },
        },
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('points awarded are greater than 10', () => {
      const res = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          token,
          questionBody: {
            question: 'What is the speed of sound?',
            duration: 60,
            points: 11,
            answers: [
              { answer: '343 m/s', correct: true },
              { answer: '150 m/s', correct: false },
            ],
          },
        },
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('answer length shorter than 1 character', () => {
      const res = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          token,
          questionBody: {
            question: 'What does DNA stand for?',
            duration: 60,
            points: 5,
            answers: [
              { answer: '', correct: true },
              { answer: 'Deoxyribonucleic Acid', correct: false },
            ],
          },
        },
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('answer length longer than 30 characters', () => {
      const res = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          token,
          questionBody: {
            question: 'What does DNA stand for?',
            duration: 60,
            points: 5,
            answers: [
              { answer: 'turning'.repeat(31), correct: true },
              { answer: 'fdskjfhasjkfhklas', correct: false },
            ],
          },
        },
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('duplicate answer strings within the same question', () => {
      const res = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          token,
          questionBody: {
            question: 'What is the capital of France?',
            duration: 60,
            points: 5,
            answers: [
              { answer: 'Mars', correct: true },
              { answer: 'Mars', correct: false },
            ],
          },
        },
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('no correct answers provided', () => {
      const res = request('POST', `${BASE_URL}/v1/admin/quiz/${quizId}/question`, {
        json: {
          token,
          questionBody: {
            question: 'what the meaning of life',
            duration: 60,
            points: 5,
            answers: [
              { answer: 'for learning 1531', correct: false },
              { answer: 'for learning 1093', correct: false },
            ],
          },
        },
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });
  });
});
