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
      test('not the user\'s quiz', () => {
        const createQuizRes = request('POST', `${config.url}:${config.port}/v1/admin/quiz`, {
          json: {
            token,
            name: 'Test Quiz',
            description: 'A test quiz'
          }
        });
        const res_create = request('POST', `${BASE_URL}/register`, {
        json: {
          email: 'test1@example.com',
          password: 'ValidPass1235678',
          nameFirst: 'Choeng',
          nameLast: 'Zhang'
        }
        });
        expect(res_create.statusCode).toBe(200);
        token = parse(res_create.body).token;
        expect(createQuizRes.statusCode).toBe(200);
        const { quizId } = parse(createQuizRes.body);
        const res_get = request('GET', `${config.url}:${config.port}/v1/admin/quiz/${quizId}`, {
          qs: { token: token }
        });
        expect(res_get.statusCode).toBe(403);  
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
    test('nonexistent quiz ID', () => {
      const res = request('GET', `${config.url}:${config.port}/v1/admin/quiz/1`, {
        qs: { token }
      });
      expect(res.statusCode).toBe(403);
      expect(parse(res.body)).toStrictEqual(ERROR);
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
