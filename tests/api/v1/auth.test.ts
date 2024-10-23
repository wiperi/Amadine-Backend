import {
  clear,
  userRegister,
  userLogin,
  userLogout,
  userGetDetails,
  userUpdateDetails,
  userUpdatePassword,
  quizGetDetails,
  quizCreate,
  questionCreate,
} from './helpers';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clear();
});

afterAll(() => {
  clear();
});

describe('DELETE /v1/clear', () => {
  test('correct return value', () => {
    const res = clear();
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({});
  });

  test('correctly clears data', () => {
    // Register a user
    const registerRes = userRegister('test@example.com', 'ValidPass123', 'John', 'Doe');
    expect(registerRes.statusCode).toBe(200);
    const { token } = registerRes.body;

    // Create a quiz
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    const { quizId } = createQuizRes.body;

    // Create a question
    const createQuestionRes = questionCreate(token, quizId, {
      question: 'Test question?',
      duration: 30,
      points: 5,
      answers: [
        { answer: 'Correct answer', correct: true },
        { answer: 'Wrong answer', correct: false },
      ],
    });
    expect(createQuestionRes.statusCode).toBe(200);

    // Clear all data
    const clearRes = clear();
    expect(clearRes.statusCode).toBe(200);

    // Check that user is cleared (try to login)
    const loginRes = userLogin('test@example.com', 'ValidPass123');
    expect(loginRes.statusCode).toBe(400);

    // Check that quiz is cleared (try to get quiz info)
    const getQuizRes = quizGetDetails(token, quizId);
    expect(getQuizRes.statusCode).toBe(401);

    // Note: We can't directly check if the question is cleared because there's no specific endpoint for that.
    // However, if the quiz is gone, its questions should be gone too.
  });
});

const invalidNames = [
  'a',
  'a'.repeat(21),
  'Tommy1',
  'Tommy!',
  'Tommy@',
  'Tommy#',
  'Tommy$',
  'Tommy,',
  'Tommy.',
  'Tommy?',
  'Tommy<',
  'Tommy>',
  'Tommy/',
  'Tommy\\',
  '你好',
  '김철수',
  'Алексей',
  '😊',
  '<script>alert("XSS")</script>',
];

const validNames = [
  'Tommy',
  'Tommy-Junior',
  "Tommy'Junior",
  'Tommy Junior',
  'Tommy' + ' '.repeat(10) + 'J',
  'aa',
  'a'.repeat(20),
  '---',
  "'''",
  '   ',
];

const invalidPasswords = [
  '',
  'a'.repeat(6) + '1',
  'badpassword',
  'BadPassword',
  'BADPASSWORD',
  'abc!@#$%^&*)&^',
  '12345678',
  '0'.repeat(8),
];

const validPasswords = [
  'GoodPassword123',
  'GoodPassword123' + ' '.repeat(10),
  'a'.repeat(100) + '1',
  'a1@!@#$@$%&$^%*%*)(+_}{":?></.,\\-=[]<>',
];

const invalidEmails = [
  '',
  'invalid-email',
  'plainaddress',
  '@missingusername.com',
  'username@.com',
  'username@domain..com',
];

const validEmails = ['goodemail@gmail.com', 'user@example.com', 'test.user@domain.co'];

describe('POST /v1/admin/auth/register', () => {
  const CORRECT_RESPONSE = { statusCode: 200, body: { token: expect.any(String) } };
  const ERROR_RESPONSE = { statusCode: 400, body: { error: expect.any(String) } };

  const CORRECT = { token: expect.any(String) };

  const validInputs = ['goodemail@gmail.com', 'GoodPassword123', 'Tommy', 'Smith'];

  // Helper function for testing different inputs on one parameter
  function runTestsForOneParam(
    groupName: string,
    inputData: string[],
    paramIndex: number,
    expectOutput: { statusCode: number; body: any }
  ) {
    describe(groupName, () => {
      test.each(inputData)('%s', data => {
        const inputs = [...validInputs];
        inputs[paramIndex] = data;

        const res = userRegister(inputs[0], inputs[1], inputs[2], inputs[3]);
        expect(res.statusCode).toStrictEqual(expectOutput.statusCode);
        expect(res.body).toStrictEqual(expectOutput.body);
      });
    });
  }

  test('Email is used', () => {
    const res = userRegister(validInputs[0], validInputs[1], validInputs[2], validInputs[3]);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual(CORRECT);

    const res2 = userRegister(validInputs[0], validInputs[1], validInputs[2], validInputs[3]);
    expect(res2.statusCode).toStrictEqual(400);
    expect(res2.body).toStrictEqual(ERROR);
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
    const res = userRegister('test@example.com', 'ValidPass123', 'John', 'Doe');
    expect(res.statusCode).toBe(200);
    token = res.body.token;
  });

  describe('valid cases', () => {
    test('successful logout', async () => {
      const res = userLogout(token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({});

      // Verify that the token is no longer valid
      // - Since jet generation is based on time, we need to wait for a second to ensure the new token is different to old one
      await new Promise(resolve => setTimeout(resolve, 1000));
      const loginRes = userLogin('test@example.com', 'ValidPass123');
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty('token');
      expect(loginRes.body.token).not.toBe(token);
    });
  });

  describe('invalid cases', () => {
    test('invalid token', () => {
      const res = userLogout('invalid_token');
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: expect.any(String) });
    });

    test('missing token', () => {
      const res = userLogout('');
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: expect.any(String) });
    });

    test('already logged out token', () => {
      // Logout once
      userLogout(token);

      // Try to logout again with the same token
      const res = userLogout(token);
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: expect.any(String) });
    });
  });
});

describe('PUT /v1/admin/user/password', () => {
  let token: string;
  beforeEach(() => {
    const res = userRegister('test@example.com', 'OldPassword123', 'John', 'Doe');
    expect(res.statusCode).toBe(200);
    token = res.body.token;
  });

  describe('valid cases', () => {
    test('successful password update', () => {
      const res = userUpdatePassword(token, 'OldPassword123', 'NewPassword456');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});

      // Verify that the new password works for login
      const loginRes = userLogin('test@example.com', 'NewPassword456');
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty('token');
    });
  });

  describe('invalid cases', () => {
    test('invalid token', () => {
      const res = userUpdatePassword('invalid_token', 'OldPassword123', 'NewPassword456');
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('missing token', () => {
      const res = userUpdatePassword('', 'OldPassword123', 'NewPassword456');
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('incorrect old password', () => {
      const res = userUpdatePassword(token, 'WrongOldPassword', 'NewPassword456');
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('new password same as old password', () => {
      const res = userUpdatePassword(token, 'OldPassword123', 'OldPassword123');
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('new password has been used before', () => {
      const res = userUpdatePassword(token, 'OldPassword123', 'NewPassword456');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});

      const res2 = userUpdatePassword(token, 'NewPassword456', 'OldPassword123');
      expect(res2.statusCode).toBe(400);
      expect(res2.body).toStrictEqual(ERROR);
    });

    test.each(invalidPasswords)('new password is invalid: %s', password => {
      const res = userUpdatePassword(token, 'OldPassword123', password);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
  });
});

/// /////////////////////////////////////////////////////////////
// Test for /v1/admin/auth/login
/// /////////////////////////////////////////////////////////////
describe('POST /v1/admin/auth/login', () => {
  let token: string;
  beforeEach(() => {
    const res = userRegister('goodemail@gmail.com', 'GlenPassword123', 'Glen', 'Quagmire');
    token = res.body.token;
  });

  describe('invalid cases', () => {
    test('Email does not exist', () => {
      const res = userLogin('petergriffin@gmail.com', 'PumpkinEater123');
      expect(res.body).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Password is not correct for the given email', () => {
      const res = userLogin('goodemail@email.com', 'Ifogortmypassword123');
      expect(res.body).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });
  });

  describe('valid cases', () => {
    test('successful login with correct id', () => {
      const res = userLogin('goodemail@gmail.com', 'GlenPassword123');
      expect(res.body.token).toStrictEqual(expect.any(String));
      expect(res.statusCode).toStrictEqual(200);
    });

    test('different user return different id', () => {
      const res1 = userLogin('goodemail@gmail.com', 'GlenPassword123');
      userRegister('peter@gmail.com', 'PumpkinEater123', 'peter', 'griffin');
      const res2 = userLogin('peter@gmail.com', 'PumpkinEater123');
      expect(res1.body).not.toStrictEqual(res2.body);
    });
  });
});

describe('GET /v1/admin/user/details', () => {
  // Valid cases:
  describe('adminUserDetails valid cases', () => {
    test('numFailedPasswordsSinceLastLogin increments correctly', () => {
      const registerRes = userRegister('wick@example.com', 'JohnWick123', 'John', 'Wick');
      expect(registerRes.statusCode).toBe(200);
      const user = registerRes.body;
      const token = user.token;
      userLogin('wick@example.com', 'JohnWick123');
      userLogin('wick@example.com', 'JohnWick12');
      userLogin('wick@example.com', 'JohnWick1234');
      const detailsRes = userGetDetails(token);

      expect(detailsRes.statusCode).toBe(200);
      const details = detailsRes.body;
      expect(details).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'John Wick',
          email: 'wick@example.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 2,
        },
      });
    });

    test('reset numFailedPasswordsSinceLastLogin', () => {
      const registerRes = userRegister('lucy@example.com', 'Lucy12356', 'Lucy', 'David');
      const user = registerRes.body;
      const token = user.token;

      userLogin('lucy@example.com', 'Lucy123567');
      userLogin('lucy@example.com', 'Lucy123567');
      userLogin('lucy@example.com', 'Lucy12356');

      const detailsRes = userGetDetails(token);
      expect(detailsRes.statusCode).toBe(200);
      const details = detailsRes.body;
      expect(details).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Lucy David',
          email: 'lucy@example.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        },
      });
    });

    test('valid user details', () => {
      const registerRes = userRegister('artoria@example.com', 'Artoria123', 'Artoria', 'Pendragon');
      const user = registerRes.body;
      const token = user.token;
      userLogin('artoria@example.com', 'Artoria123');

      const detailsRes = userGetDetails(token);
      expect(detailsRes.statusCode).toBe(200);
      const details = detailsRes.body;
      expect(details).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Artoria Pendragon',
          email: 'artoria@example.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        },
      });
    });
  });

  // Error cases:
  describe('adminUserDetails error cases', () => {
    test('User ID does not exist', () => {
      userRegister('test@example.com', 'TestPassword123', 'Test', 'User');
      const token = '11111';
      const detailsRes = userGetDetails(token);
      expect(detailsRes.statusCode).toBe(401);
      expect(detailsRes.body).toStrictEqual(ERROR);
    });
  });
});

/// /////////////////////////////////////////////////////////////
// Test for /v1/admin/user/details
/// /////////////////////////////////////////////////////////////

describe('PUT /v1/admin/user/details', () => {
  let token: string;
  beforeEach(() => {
    // Register a user to get the token
    const registerRes = userRegister('handsomejim@example.com', 'ValidPass123', 'Jim', 'Hu');
    expect(registerRes.statusCode).toBe(200);
    token = registerRes.body.token;
  });
  describe('valid case', () => {
    test('successful update of user details', () => {
      const res = userUpdateDetails(token, 'newemail@example.com', 'Johnny', 'Smith');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
    });
  });

  describe('check the token', () => {
    test('error for invalid token', () => {
      const res = userUpdateDetails('invalid_token', 'testuser@example.com', 'Johnny', 'Smith');
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('error for empty token', () => {
      const res = userUpdateDetails('', 'newemail@example.com', 'Johnny', 'Smith');
      expect(res.statusCode).toBe(401); // Expect 401 for missing token
      expect(res.body).toStrictEqual(ERROR);
    });
  });

  describe('Invalid email cases and used email', () => {
    test.each(invalidEmails)('error for invalid email: %s', invalidEmail => {
      const res = userUpdateDetails(token, invalidEmail, 'Johnny', 'Smith');
      expect(res.statusCode).toBe(400); // Expect 400 for invalid email
      expect(res.body).toStrictEqual(ERROR);
    });

    test('error for used email', () => {
      // Register another user
      userRegister('otheruser@example.com', 'ValidPass123', 'Jane', 'Doe');

      // Attempt to update with the same email
      const res = userUpdateDetails(token, 'otheruser@example.com', 'Johnny', 'Smith');
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
  });

  describe('Invalid first name cases', () => {
    test.each(invalidNames)('error for invalid first name: %s', invalidName => {
      const res = userUpdateDetails(token, 'validemail@example.com', invalidName, 'Smith');
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
  });

  describe('Invalid last name cases', () => {
    test.each(invalidNames)('error for invalid last name: %s', invalidName => {
      const res = userUpdateDetails(token, 'validemail@example.com', 'Johnny', invalidName);
      expect(res.statusCode).toBe(400); // Expect 400 for invalid name
      expect(res.body).toStrictEqual(ERROR);
    });
  });
});
