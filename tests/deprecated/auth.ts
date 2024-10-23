// @ts-nocheck
// jest.ignore
import * as auth from '../../src/services/auth';
import { clear } from '../../src/utils/other';

/////////////////////////////////////////////////////////////////////
// Example
/////////////////////////////////////////////////////////////////////

// describe('{FUNCTION_NAME} ie.adminUserLogin', () => {
//   test('should return an object', () => {});
//   test('...', () => {});
//   test('...', () => {});

//   describe('invalid input', () => {
//     test('...', () => {});
//     test('...', () => {});
//   });
// });

/////////////////////////////////////////////////////////////////////
// Test Cases
/////////////////////////////////////////////////////////////////////

beforeEach(() => {
  clear();
});

describe('clear()', () => {
  it('should return empty object', () => {
    expect(clear()).toStrictEqual({});
  });
});

const ERROR = { error: expect.any(String) };

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

describe('adminAuthRegister()', () => {
  const CORRECT = { authUserId: expect.any(Number) };

  const validInputs = ['goodemail@gmail.com', 'GoodPassword123', 'Tommy', 'Smith'];

  // Helper function for testing different inputs on one parameter
  function runTestsForOneParam(groupName, inputData, paramIndex, expectOutput) {
    describe(groupName, () => {
      test.each(inputData)('%s', data => {
        let inputs = [...validInputs];
        inputs[paramIndex] = data;
        expect(auth.adminAuthRegister(...inputs)).toStrictEqual(expectOutput);
      });
    });
  }

  test('Email is used', () => {
    expect(auth.adminAuthRegister(...validInputs)).toStrictEqual(CORRECT);
    expect(auth.adminAuthRegister(...validInputs)).toStrictEqual(ERROR);
  });

  runTestsForOneParam('Invalid emails', invalidEmails, 0, ERROR);
  runTestsForOneParam('Valid emails', validEmails, 0, CORRECT);

  runTestsForOneParam('Invalid passwords', invalidPasswords, 1, ERROR);
  runTestsForOneParam('Valid passwords', validPasswords, 1, CORRECT);

  runTestsForOneParam('Invalid first names', invalidNames, 2, ERROR);
  runTestsForOneParam('Valid first names', validNames, 2, CORRECT);

  runTestsForOneParam('Invalid last names', invalidNames, 3, ERROR);
  runTestsForOneParam('Valid last names', validNames, 3, CORRECT);
});

////////////////////////////////////////////////////////////////////
// Test for adminAuthLogin
////////////////////////////////////////////////////////////////////

describe('adminAuthLogin()', () => {
  // Error cases:
  //  there are 2 error cases for adminAuthLogin
  //    Email address does not exist
  //    Password is not correct for the given email
  describe('adminAuthLogin error cases', () => {
    test('Email does not exist', () => {
      const user1 = auth.adminAuthRegister(
        'petter@example.com',
        'PumpkinEater123',
        'Petter',
        'Griffin',
      );
      const user2 = auth.adminAuthRegister(
        'quagmire@example.com',
        'GiggityQuagmire123',
        'Glenn',
        'Quagmire',
      );
      const user3 = auth.adminAuthRegister(
        'swason@example.com',
        'JoeSwansonPassword123',
        'Joe',
        'Swanson',
      );
      const login = auth.adminAuthLogin('pumpkin@example.com', 'PumpkinEater123');
      expect(login).toStrictEqual(ERROR);
    });

    test('Password is not correct for the given email', () => {
      const user = auth.adminAuthRegister(
        'petter@example.com',
        'PumpkinEater123',
        'Petter',
        'Griffin',
      );
      const login = auth.adminAuthLogin('peter@example.com', 'IFogotMyPassword');
      expect(login).toStrictEqual(ERROR);
    });
  });

  // Valid cases:
  //    Correct user with correct id
  //    same email address, same password, return same id
  //    different email address, different password, return different id
  describe('adminAuthLogin valid cases', () => {
    test('Correct id', () => {
      const user = auth.adminAuthRegister('user@example.com', 'GoodPassword123', 'Tommy', 'Junior');
      const login = auth.adminAuthLogin('user@example.com', 'GoodPassword123');
      expect(login.authUserId).toStrictEqual(user.authUserId);
    });

    test('Same user return same id', () => {
      const user = auth.adminAuthRegister('user@example.com', 'GoodPassword123', 'Mason', 'Jones');
      const login1 = auth.adminAuthLogin('user@example.com', 'GoodPassword123');
      const login2 = auth.adminAuthLogin('user@example.com', 'GoodPassword123');
      expect(login1.authUserId).toStrictEqual(login2.authUserId);
    });

    test('Different user return different id', () => {
      const user1 = auth.adminAuthRegister('anna@example.com', 'AnnaPassword345', 'Anna', 'Lean');
      const user2 = auth.adminAuthRegister('kim@example.com', 'KimPassword345', 'Kim', 'Smith');
      const login1 = auth.adminAuthLogin('anna@example.com', 'AnnaPassword345');
      const login2 = auth.adminAuthLogin('kim@example.com', 'KimPassword345');
      expect(login1.authUserId).toStrictEqual(user1.authUserId);
      expect(login2.authUserId).toStrictEqual(user2.authUserId);
      expect(login1.authUserId).not.toStrictEqual(login2.authUserId);
    });
  });
});

describe('adminUserPasswordUpdate()', () => {
  let user;
  beforeEach(() => {
    user = auth.adminAuthRegister('Goodemail@gmail.com', 'GoodPassword123', 'Tommy', 'Smith');
  });

  test('normal case', () => {
    const res = auth.adminUserPasswordUpdate(user.authUserId, 'GoodPassword123', 'NewPassword123');
    expect(res).toStrictEqual({});
    expect(auth.adminAuthLogin('Goodemail@gmail.com', 'GoodPassword123')).toStrictEqual(ERROR);
    expect(auth.adminAuthLogin('Goodemail@gmail.com', 'NewPassword123')).toStrictEqual({
      authUserId: user.authUserId,
    });
  });

  test('authUserId does not exist', () => {
    clear();
    const res = auth.adminUserPasswordUpdate(42, 'GoodPassword123', 'NewPassword123');
    expect(res).toStrictEqual(ERROR);
  });

  test('wrong old password', () => {
    const res = auth.adminUserPasswordUpdate(
      user.authUserId,
      'WrongOldPassword123',
      'NewPassword123',
    );
    expect(res).toStrictEqual(ERROR);
  });

  test('new password and old password are the same', () => {
    const res = auth.adminUserPasswordUpdate(user.authUserId, 'GoodPassword123', 'GoodPassword123');
    expect(res).toStrictEqual(ERROR);
  });

  describe('New password is used', () => {
    test('using first previous password', () => {
      const res = auth.adminUserPasswordUpdate(
        user.authUserId,
        'GoodPassword123',
        'NewPassword123',
      );
      expect(res).toStrictEqual({});
      const res2 = auth.adminUserPasswordUpdate(
        user.authUserId,
        'NewPassword123',
        'GoodPassword123',
      );
      expect(res2).toStrictEqual(ERROR);
    });

    test('using second previous password', () => {
      const res = auth.adminUserPasswordUpdate(user.authUserId, 'GoodPassword123', 'NewPassword1');
      expect(res).toStrictEqual({});
      const res2 = auth.adminUserPasswordUpdate(user.authUserId, 'NewPassword1', 'NewPassword2');
      expect(res2).toStrictEqual({});
      const res3 = auth.adminUserPasswordUpdate(user.authUserId, 'NewPassword2', 'GoodPassword123');
      expect(res3).toStrictEqual(ERROR);
    });
  });

  describe('Invalid new password format', () => {
    test.each(invalidPasswords)('%s', password => {
      const res = auth.adminUserPasswordUpdate(user.authUserId, 'GoodPassword123', password);
      expect(res).toStrictEqual(ERROR);
    });
  });
});

// test for adminUserDetails
describe('adminUserDetails', () => {
  // Valid cases:
  describe('adminUserDetails valid cases', () => {
    test('numFailedPasswordsSinceLastLogin increments correctly', () => {
      const user = auth.adminAuthRegister('wick@example.com', 'JohnWick123', 'John', 'Wick');
      auth.adminAuthLogin('wick@example.com', 'JohnWick123');
      auth.adminAuthLogin('wick@example.com', 'JohnWick12');
      auth.adminAuthLogin('wick@example.com', 'JohnWick1234');
      const details = auth.adminUserDetails(user.authUserId);
      expect(details).toStrictEqual({
        user: {
          userId: user.authUserId,
          name: 'John Wick',
          email: 'wick@example.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 2,
        },
      });
    });

    test('reset numFailedPasswordsSinceLastLogin', () => {
      const user = auth.adminAuthRegister('lucy@example.com', 'Lucy12356', 'Lucy', 'David');
      auth.adminAuthLogin('lucy@example.com', 'Lucy1234567');
      auth.adminAuthLogin('lucy@example.com', 'Lucy1234567');
      auth.adminAuthLogin('lucy@example.com', 'Lucy12356');
      const details = auth.adminUserDetails(user.authUserId);
      expect(details).toStrictEqual({
        user: {
          userId: user.authUserId,
          name: 'Lucy David',
          email: 'lucy@example.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        },
      });
    });

    test('valid user details', () => {
      const user = auth.adminAuthRegister(
        'artoria@example.com',
        'Artoria123',
        'Artoria',
        'Pendragon',
      );
      auth.adminAuthLogin('artoria@example.com', 'Artoria123');
      const details = auth.adminUserDetails(user.authUserId);
      expect(details).toStrictEqual({
        user: {
          userId: user.authUserId,
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
      const user1 = auth.adminAuthRegister('wick@example.com', 'JohnWick123', 'John', 'Wick');
      const user2 = auth.adminAuthRegister('lucy@example.com', 'Lucy123', 'Lucy', 'David');
      const user3 = auth.adminAuthRegister(
        'artoria@example.com',
        'Artoria123',
        'Artoria',
        'Pendragon',
      );
      const details = auth.adminUserDetails(123);
      expect(details).toStrictEqual(ERROR);
    });

    test('User ID is not a not a number', () => {
      const details = auth.adminUserDetails(' ');
      expect(details).toStrictEqual(ERROR);
    });
  });
});

// Test for adminUserDetailsUpdate
describe('adminUserDetailsUpdate', () => {
  let user;
  beforeEach(() => {
    clear();
    user = auth.adminAuthRegister('updateuser@example.com', 'UpdatePassword123', 'Update', 'User');
  });

  describe('valid cases', () => {
    test('change all details', () => {
      const result = auth.adminUserDetailsUpdate(
        user.authUserId,
        'newemail@test.com',
        'Newfirst',
        'Newlast',
      );
      expect(result).toStrictEqual({});
      const updatedUserDetail = auth.adminUserDetails(user.authUserId);
      expect(updatedUserDetail).toStrictEqual({
        user: {
          userId: user.authUserId,
          name: 'Newfirst Newlast',
          email: 'newemail@test.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0,
        },
      });
    });

    test('same email, different name', () => {
      const result = auth.adminUserDetailsUpdate(
        user.authUserId,
        'updateuser@example.com',
        'Newfirst',
        'Newlast',
      );
      expect(result).toStrictEqual({});
      const updatedUserDetail = auth.adminUserDetails(user.authUserId);
      expect(updatedUserDetail).toStrictEqual({
        user: {
          userId: user.authUserId,
          name: 'Newfirst Newlast',
          email: 'updateuser@example.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0,
        },
      });
    });
  });

  describe('error cases', () => {
    test('User ID does not exist', () => {
      const result = auth.adminUserDetailsUpdate(123, 'newemail@test.com', 'Newfirst', 'Newlast');
      expect(result).toStrictEqual(ERROR);
    });

    test('Invaild email format', () => {
      const result = auth.adminUserDetailsUpdate(user.authUserId, 'Invalid', 'Newfirst', 'Newlast');
      expect(result).toStrictEqual(ERROR);
    });

    test('Email is used by other', () => {
      auth.adminAuthRegister('Otheremial@test.com', 'OtherPassword12345', 'Firsr', 'Last');
      const result = auth.adminUserDetailsUpdate(
        user.authUserId,
        'Otheremial@test.com',
        'Newfirst',
        'Newlast',
      );
      expect(result).toStrictEqual(ERROR);
    });

    test('Invaild first name', () => {
      const result = auth.adminUserDetailsUpdate(
        user.authUserId,
        'Otheremial@test.com',
        'Newfirst1',
        'Newlast',
      );
      expect(result).toStrictEqual(ERROR);
    });

    test('Invaild last name', () => {
      const result = auth.adminUserDetailsUpdate(
        user.authUserId,
        'Otheremial@test.com',
        'Newfirst',
        'Newlast1',
      );
      expect(result).toStrictEqual(ERROR);
    });
  });
});
