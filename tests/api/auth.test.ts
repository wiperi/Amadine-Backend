import request from 'sync-request-curl';
import config from '../../src/config.json';

const BASE_URL = `${config.url}:${config.port}/v1/admin/auth`;
const ERROR = { error: expect.any(String) };

// Parse the response body as JSON
function parse(res: string | Buffer) {
  return JSON.parse(res.toString());
}

beforeEach(() => {
  request('DELETE', `${config.url}:${config.port}/v1/clear`);
});

afterAll(() => {
  request('DELETE', `${config.url}:${config.port}/v1/clear`);
});

describe('DELETE /v1/clear', () => {
  it('should return empty object', () => {
    const res = request('DELETE', `${config.url}:${config.port}/v1/clear`);
    expect(res.statusCode).toStrictEqual(200);
    expect(parse(res.body)).toStrictEqual({});
  });
});

const invalidNames = [
  'a', 'a'.repeat(21), 'Tommy1', 'Tommy!', 'Tommy@', 'Tommy#', 'Tommy$',
  'Tommy,', 'Tommy.', 'Tommy?', 'Tommy<', 'Tommy>', 'Tommy/', 'Tommy\\',
  '你好', '김철수', 'Алексей', '😊', '<script>alert("XSS")</script>'
];

const validNames = [
  'Tommy', 'Tommy-Junior', 'Tommy\'Junior', 'Tommy Junior',
  'Tommy' + ' '.repeat(10) + 'J', 'aa', 'a'.repeat(20), '---', '\'\'\'', '   '
];

const invalidPasswords = [
  '', 'a'.repeat(6) + '1', 'badpassword', 'BadPassword', 'BADPASSWORD',
  'abc!@#$%^&*)&^', '12345678', '0'.repeat(8)
];

const validPasswords = [
  'GoodPassword123', 'GoodPassword123' + ' '.repeat(10),
  'a'.repeat(100) + '1', 'a1@!@#$@$%&$^%*%*)(+_}{":?></.,\\-=[]<>'
];

const invalidEmails = [
  '', 'invalid-email', 'plainaddress', '@missingusername.com',
  'username@.com', 'username@domain..com'
];

const validEmails = [
  'goodemail@gmail.com', 'user@example.com', 'test.user@domain.co'
];


describe('POST /v1/admin/auth/register', () => {

  const CORRECT_RESPONSE = { statusCode: 200, body: { token: expect.any(String) } };
  const ERROR_RESPONSE = { statusCode: 400, body: { error: expect.any(String) } };

  const CORRECT = { token: expect.any(String) };

  const validInputs = ['goodemail@gmail.com', 'GoodPassword123', 'Tommy', 'Smith'];

  // Helper function for testing different inputs on one parameter
  function runTestsForOneParam(groupName: string, inputData: string[], paramIndex: number, expectOutput: { statusCode: number, body: any }) {
    describe(groupName, () => {
      test.each(inputData)('%s', (data) => {
        let inputs = [...validInputs];
        inputs[paramIndex] = data;
        
        const res = request('POST', `${BASE_URL}/register`, {
          json: {
            email: inputs[0],
            password: inputs[1],
            nameFirst: inputs[2],
            nameLast: inputs[3]
          }
        });
        expect(res.statusCode).toStrictEqual(expectOutput.statusCode);
        expect(parse(res.body)).toStrictEqual(expectOutput.body);
      });
    });
  }

  test('Email is used', () => {
    const res = request('POST', `${BASE_URL}/register`, {
      json: {
        email: validInputs[0],
        password: validInputs[1],
        nameFirst: validInputs[2],
        nameLast: validInputs[3]
      }
    });
    expect(res.statusCode).toStrictEqual(200);
    expect(parse(res.body)).toStrictEqual(CORRECT);

    const res2 = request('POST', `${BASE_URL}/register`, {
      json: {
        email: validInputs[0],
        password: validInputs[1],
        nameFirst: validInputs[2],
        nameLast: validInputs[3]
      }
    });
    expect(res2.statusCode).toStrictEqual(400);
    expect(parse(res2.body)).toStrictEqual(ERROR);
  });

  runTestsForOneParam('Invalid emails', invalidEmails, 0, ERROR_RESPONSE);
  runTestsForOneParam('Valid emails', validEmails, 0, CORRECT_RESPONSE);

  runTestsForOneParam('Invalid passwords', invalidPasswords, 1, ERROR_RESPONSE);
  runTestsForOneParam('Valid passwords', validPasswords, 1, CORRECT_RESPONSE);

  runTestsForOneParam('Invalid first names', invalidNames, 2, ERROR_RESPONSE);
  runTestsForOneParam('Valid first names', validNames, 2, CORRECT_RESPONSE);

  runTestsForOneParam('Invalid last names', invalidNames, 3, ERROR_RESPONSE);
  runTestsForOneParam('Valid last names', validNames, 3, CORRECT_RESPONSE);
});

describe.skip('POST /v1/admin/auth/logout', () => {

  let token: string;
  beforeEach(() => {
    const res = request('POST', `${BASE_URL}/register`, {
      json: {
        email: 'goodemail@gmail.com',
        password: 'GoodPassword123',
        nameFirst: 'Tommy',
        nameLast: 'Smith'
      }
    });
    expect(res.statusCode).toStrictEqual(200);
    token = parse(res.body).token;
  });

  test('normal case', () => {
    const res = request('POST', `${BASE_URL}/logout`, {
      json: {
        token: token
      }
    });
    expect(res.statusCode).toStrictEqual(200);
    expect(parse(res.body)).toStrictEqual({});

    const loginRes = request('POST', `${BASE_URL}/login`, {
      json: {
        email: 'goodemail@gmail.com',
        password: 'GoodPassword123'
      }
    });
    expect(loginRes.statusCode).toStrictEqual(400);
    expect(parse(loginRes.body)).toStrictEqual(ERROR);
  });
});

describe.skip('PUT /v1/admin/user/password', () => {

  let token: string;
  beforeEach(() => {
    const res = request('POST', `${BASE_URL}/register`, {
      json: {
        email: 'goodemail@gmail.com',
        password: 'GoodPassword123',
        nameFirst: 'Tommy',
        nameLast: 'Smith'
      }
    });
    expect(res.statusCode).toStrictEqual(200);
    token = parse(res.body).token;
  });

  test('normal case', () => {
    const res = request('PUT', `${BASE_URL}/password`, {
      json: {
        token: token,
        oldPassword: 'GoodPassword123',
        newPassword: 'NewPassword123'
      }
    });
    expect(res.statusCode).toStrictEqual(200);
    expect(parse(res.body)).toStrictEqual({});
  });
});

////////////////////////////////////////////////////////////////
// Test for /v1/admin/auth/login
////////////////////////////////////////////////////////////////
describe('POST /v1/admin/auth/login', () => {
  let token: string;
  beforeEach(() => {
    const res = request('POST', `${BASE_URL}/register`, {
      json: {
        email: 'goodemail@gmail.com',
        password: 'GlenPassword123',
        nameFirst: 'Glen',
        nameLast: 'Quagmire'
      }
    });
    token = parse(res.body).token;
  });

  describe('invalid cases', () => {
    test('Email does not exist', () => {
      const res = request('POST', `${BASE_URL}/register`, { json: { email: 'petergriffin@gmail.com', password: 'PumpkinEater123' }});
      expect(parse(res.body)).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Password is not correct for the given email', () => {
      const res = request('POST', `${BASE_URL}/register`, { json: { email: 'goodemail@email.com', password: 'Ifogortmypassword123' }});
      expect(parse(res.body)).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });
  });

  describe('valid cases', () => {
    test('successful login with correct id', () => {
      const res = request('POST', `${BASE_URL}/login`, { json: { email: 'goodemail@gmail.com', password: 'GlenPassword123' }});
      expect(parse(res.body).token).toStrictEqual(token);
      expect(res.statusCode).toStrictEqual(200);
    });

    test('same user return same id', () => {
      const res1 = request('POST', `${BASE_URL}/login`, { json: { email: 'goodemail@gmail.com', password: 'GlenPassword123' }});
      const res2 = request('POST', `${BASE_URL}/login`, { json: { email: 'goodemail@gmail.com', password: 'GlenPassword123' }});
      expect(parse(res1.body)).toStrictEqual(parse(res2.body));
      expect(res1.statusCode).toStrictEqual(200);
      expect(res2.statusCode).toStrictEqual(200);
    });

    test('different user return different id', () => {
      const res1 = request('POST', `${BASE_URL}/login`, { json: { email: 'goodemail@gmail.com', password: 'GlenPassword123' }});
      const userRes = request('POST', `${BASE_URL}/register`, { json: { email: 'peter@gmail.com', password: 'PumpkinEater123', nameFirst: 'peter', nameLast: 'griffin' }});
      const res2 = request('POST', `${BASE_URL}/login`, { json: { email: 'peter@gmail.com', password: 'PumpkinEater123' }});
      expect(parse(res2.body).token).toStrictEqual(parse(userRes.body).token);
      expect(parse(res1.body)).not.toStrictEqual(parse(res2.body));
    });
  });
});
