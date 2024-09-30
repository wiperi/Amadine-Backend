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

  test('correct return value', () => {
    const res = request('DELETE', `${config.url}:${config.port}/v1/clear`);
    expect(res.statusCode).toStrictEqual(200);
    expect(parse(res.body)).toStrictEqual({});
  });

  test.skip('correctly clears data', () => {
    // Register a user
    const registerRes = request('POST', `${BASE_URL}/register`, {
      json: {
        email: 'test@example.com',
        password: 'ValidPass123',
        nameFirst: 'John',
        nameLast: 'Doe'
      }
    });
    expect(registerRes.statusCode).toBe(200);
    const { token } = parse(registerRes.body);

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

    // Create a question
    const createQuestionRes = request('POST', `${config.url}:${config.port}/v1/admin/quiz/${quizId}/question`, {
      json: {
        token,
        questionBody: {
          question: 'Test question?',
          duration: 30,
          points: 5,
          answers: [
            { answer: 'Correct answer', correct: true },
            { answer: 'Wrong answer', correct: false }
          ]
        }
      }
    });
    expect(createQuestionRes.statusCode).toBe(200);

    // Clear all data
    const clearRes = request('DELETE', `${config.url}:${config.port}/v1/clear`);
    expect(clearRes.statusCode).toBe(200);

    // Check that user is cleared (try to login)
    const loginRes = request('POST', `${BASE_URL}/login`, {
      json: {
        email: 'test@example.com',  
        password: 'ValidPass123'
      }
    });
    expect(loginRes.statusCode).toBe(400);

    // Check that quiz is cleared (try to get quiz info)
    const getQuizRes = request('GET', `${config.url}:${config.port}/v1/admin/quiz/${quizId}`, {
      qs: { token }
    });
    expect(getQuizRes.statusCode).toBe(401);

    // Note: We can't directly check if the question is cleared because there's no specific endpoint for that.
    // However, if the quiz is gone, its questions should be gone too.
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

describe('POST /v1/admin/auth/logout', () => {
  
  let token: string;
  beforeEach(() => {
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

  describe('valid cases', () => {
    test('successful logout', async () => {
      const res = request('POST', `${BASE_URL}/logout`, {
        json: { token }
      });
      expect(res.statusCode).toBe(200);
      expect(parse(res.body)).toEqual({});

      // Verify that the token is no longer valid
      // - Since jet generation is based on time, we need to wait for a second to ensure the new token is different to old one
      await new Promise(resolve => setTimeout(resolve, 1000));
      const loginRes = request('POST', `${BASE_URL}/login`, {
        json: {
          email: 'test@example.com',
          password: 'ValidPass123'
        }
      });
      expect(loginRes.statusCode).toBe(200);
      expect(parse(loginRes.body)).toHaveProperty('token');
      expect(parse(loginRes.body).token).not.toBe(token);
    });
  });

  describe('invalid cases', () => {
    test('invalid token', () => {
      const res = request('POST', `${BASE_URL}/logout`, {
        json: { token: 'invalid_token' }
      });
      expect(res.statusCode).toBe(401);
      expect(parse(res.body)).toEqual({ error: expect.any(String) });
    });

    test('missing token', () => {
      const res = request('POST', `${BASE_URL}/logout`, {
        json: {}
      });
      expect(res.statusCode).toBe(401);
      expect(parse(res.body)).toEqual({ error: expect.any(String) });
    });

    test('already logged out token', () => {
      // Logout once
      request('POST', `${BASE_URL}/logout`, { json: { token } });

      // Try to logout again with the same token
      const res = request('POST', `${BASE_URL}/logout`, {
        json: { token }
      });
      expect(res.statusCode).toBe(401);
      expect(parse(res.body)).toEqual({ error: expect.any(String) });
    });
  });
});

describe('PUT /v1/admin/user/password', () => {
  
  let token: string;
  beforeEach(() => {
    // Register a user and get the token
    const res = request('POST', `${BASE_URL}/register`, {
      json: {
        email: 'test@example.com',
        password: 'OldPassword123',
        nameFirst: 'John',
        nameLast: 'Doe'
      }
    });
    expect(res.statusCode).toBe(200);
    token = parse(res.body).token;
  });

  describe('valid cases', () => {
    test('successful password update', () => {
      const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/password`, {
        json: {
          token,
          oldPassword: 'OldPassword123',
          newPassword: 'NewPassword456'
        }
      });
      expect(res.statusCode).toBe(200);
      expect(parse(res.body)).toStrictEqual({});

      // Verify that the new password works for login
      const loginRes = request('POST', `${BASE_URL}/login`, {
        json: {
          email: 'test@example.com',
          password: 'NewPassword456'
        }
      });
      expect(loginRes.statusCode).toBe(200);
      expect(parse(loginRes.body)).toHaveProperty('token');
    });
  });

  describe('invalid cases', () => {
    test('invalid token', () => {
      const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/password`, {
        json: {
          token: 'invalid_token',
          oldPassword: 'OldPassword123',
          newPassword: 'NewPassword456'
        }
      });
      expect(res.statusCode).toBe(401);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('missing token', () => {
      const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/password`, {
        json: {
          oldPassword: 'OldPassword123',
          newPassword: 'NewPassword456'
        }
      });
      expect(res.statusCode).toBe(401);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('incorrect old password', () => {
      const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/password`, {
        json: {
          token,
          oldPassword: 'WrongOldPassword',
          newPassword: 'NewPassword456'
        }
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('new password same as old password', () => {
      const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/password`, {
        json: {
          token,
          oldPassword: 'OldPassword123',
          newPassword: 'OldPassword123'
        }
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('new password has been used before', () => {
      const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/password`, {
        json: {
          token,
          oldPassword: 'OldPassword123',
          newPassword: 'NewPassword456'
        }
      });
      expect(res.statusCode).toBe(200);
      expect(parse(res.body)).toStrictEqual({});

      const res2 = request('PUT', `${config.url}:${config.port}/v1/admin/user/password`, {
        json: {
          token,
          oldPassword: 'NewPassword456',
          newPassword: 'OldPassword123'
        }
      });
      expect(res2.statusCode).toBe(400);
      expect(parse(res2.body)).toStrictEqual(ERROR);
    });

    test.each(invalidPasswords)('new password is invalid: %s', (password) => {
      const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/password`, {
        json: {
          token,
          oldPassword: 'OldPassword123',
          newPassword: password
        }
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });
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

////////////////////////////////////////////////////////////////
// Test for /v1/admin/user/details
////////////////////////////////////////////////////////////////

describe('PUT /v1/admin/user/details', () => {
  let token: string;
  beforeEach(() => {
    // Register a user to get the token
    const registerRes = request('POST', `${BASE_URL}/register`, {
      json: {
        email: 'handsomejim@example.com',
        password: 'ValidPass123',
        nameFirst: 'Jim',
        nameLast: 'Hu'
      }
    });
    expect(registerRes.statusCode).toBe(200);
    token = parse(registerRes.body).token;
  });
  describe('valid case', () => {
    test('successful update of user details', () => {
      const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/details`, {
        json: {
          token,
          email: 'newemail@example.com',
          nameFirst: 'Johnny',
          nameLast: 'Smith'
        }
      });
      expect(res.statusCode).toBe(200);
      expect(parse(res.body)).toStrictEqual({});
    });
  })

  test('error for invalid email format', () => {
    const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/details`, {
      json: {
        token,
        email: 'invalidemail',
        nameFirst: 'Johnny',
        nameLast: 'Smith'
      }
    });
    expect(res.statusCode).toBe(400);
    expect(parse(res.body)).toStrictEqual(ERROR);
  });

  test('error for used email', () => {
    // Register another user
    request('POST', `${BASE_URL}/register`, {
      json: {
        email: 'otheruser@example.com',
        password: 'ValidPass123',
        nameFirst: 'Jane',
        nameLast: 'Doe'
      }
    });

    // Attempt to update with the same email
    const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/details`, {
      json: {
        token,
        email: 'otheruser@example.com',
        nameFirst: 'Johnny',
        nameLast: 'Smith'
      }
    });
    expect(res.statusCode).toBe(400);
    expect(parse(res.body)).toStrictEqual(ERROR);
  });
  describe('check the token', () => {
    test('error for invalid token', () => {
      const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/details`, {
        json: {
          token: 'invalid_token', 
          email: 'testuser@example.com',
          nameFirst: 'Johnny',
          nameLast: 'Smith'
        }
      });
      expect(res.statusCode).toBe(401); 
      expect(parse(res.body)).toStrictEqual(ERROR);
    });
  
    test('error for empty token', () => {
      const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/details`, {
        json: {
          token: '',  // Empty token
          email: 'newemail@example.com',
          nameFirst: 'Johnny',
          nameLast: 'Smith'
        }
      });
      expect(res.statusCode).toBe(401);  // Expect 401 for missing token
      expect(parse(res.body)).toStrictEqual(ERROR);
    });
  })
  
  describe('check the first name', () => {
    test('error for invalid characters in first name', () => {
      const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/details`, {
        json: {
          token,
          email: 'validemail@example.com',
          nameFirst: 'Johnny#',
          nameLast: 'Smith'
        }
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });
  
    test('error for first name too short', () => {
      const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/details`, {
        json: {
          token,
          email: 'validemail@example.com',
          nameFirst: 'J', 
          nameLast: 'Smith'
        }
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('error for first name too long', () => {
      const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/details`, {
        json: {
          token,
          email: 'validemail@example.com',
          nameFirst: 'A'.repeat(21), 
          nameLast: 'Smith'
        }
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });
  
  })

  describe('check the second name', () => {
    test('error for invalid characters in second name', () => {
      const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/details`, {
        json: {
          token,
          email: 'validemail@example.com',
          nameFirst: 'Johnny',
          nameLast: 'Smith#'
        }
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });
  
    test('error for second name too short', () => {
      const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/details`, {
        json: {
          token,
          email: 'validemail@example.com',
          nameFirst: 'Johnny', 
          nameLast: 'S'
        }
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });

    test('error for second name too long', () => {
      const res = request('PUT', `${config.url}:${config.port}/v1/admin/user/details`, {
        json: {
          token,
          email: 'validemail@example.com',
          nameFirst: 'Smith',
          nameLast: 'A'.repeat(21)
        }
      });
      expect(res.statusCode).toBe(400);
      expect(parse(res.body)).toStrictEqual(ERROR);
    });
  
  })

});
