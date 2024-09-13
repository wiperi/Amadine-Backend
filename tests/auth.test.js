import * as auth from "../src/auth.js";
import { clear } from "../src/other.js";

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

const validInputs = ['goodemail@gmail.com', 'GoodPassword123', 'Tommy', 'Smith'];

describe('adminAuthRegister', () => {

  const CORRECT = { authUserId: expect.any(Number) };

  // Helper function for testing invalid input cases
  function runTestsForOneParam(testGroup, inputData, paramIndex, expectOutput) {
    describe(testGroup, () => {
      test.each(inputData)('%s', (data) => {
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

 describe('adminAuthLogin', () => {
  // Error cases:
  //  there are 2 error cases for adminAuthLogin
  //    Email address does not exist
  //    Password is not correct for the given email
  describe('adminAuthLogin error cases', () => {
    test('Email does not exist', () => {
      const user1 = auth.adminAuthRegister('petter@example.com', 'PumpkinEater123', 'Petter', 'Griffin');
      const user2 = auth.adminAuthRegister('quagmire@example.com', 'GiggityQuagmire123', 'Glenn', 'Quagmire');
      const user3 = auth.adminAuthRegister('swason@example.com', 'JoeSwansonPassword123', 'Joe', 'Swanson');
      const login = auth.adminAuthLogin('pumpkin@example.com', 'PumpkinEater123');
      expect(login).toStrictEqual(ERROR);
    });

    test('Password is not correct for the given email', () => {
      const user = auth.adminAuthRegister('petter@example.com', 'PumpkinEater123', 'Petter', 'Griffin');
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