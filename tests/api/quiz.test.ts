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

describe.skip('GET /v1/admin/quiz/list', () => {

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
