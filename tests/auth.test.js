import { run } from "jest";
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

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clear();
});

const invalidNames = [
  'a', 'a'.repeat(21), 'Tommy1', 'Tommy!', 'Tommy@', 'Tommy#', 'Tommy$',
  'Tommy,', 'Tommy.', 'Tommy?', 'Tommy<', 'Tommy>', 'Tommy/', 'Tommy\\',
  '你好', '김철수', 'Алексей', '😊', '<script>alert("XSS")</script>'
];

const validNames = [
  'Tommy', 'Tommy-Junior', 'Tommy\'Junior', 'Tommy Junior',
  'Tommy' + ' '.repeat(10) + 'Junior', 'aa', 'a'.repeat(20), '---', '\'\'\'', '   '
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

const validSample = {
  testName: 'first user',
  input: ['goodemail@gmail.com', 'GoodPassword123', 'Tommy', 'Smith'],
  output: { authUserId: expect.any(Number) },
};


describe.only('adminAuthRegister', () => {
  
  const CORRECT = { authUserId: expect.any(Number) };
  
  // Helper function for testing invalid input cases
  function runTestsForOneParam(testGroup, inputData, paramIndex, expectOutput) {
    describe(testGroup, () => {
      test.each(inputData)('%s', (data) => {
        let inputs = [...validSample.input];
        inputs[paramIndex] = data;
        expect(auth.adminAuthRegister(...inputs)).toStrictEqual(expectOutput);
      });
    });
  }

  describe('Valid input', () => {
    test.each(validSample)('$testName', (sample) => {
      expect(auth.adminAuthRegister(...sample.input)).toStrictEqual(sample.output);
    });
  });

  test('Email is already used', () => {
    auth.adminAuthRegister(...validSample.input);
    expect(auth.adminAuthRegister(...validSample.input)).toStrictEqual(ERROR);
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