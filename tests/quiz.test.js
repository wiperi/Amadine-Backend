import * as quiz from '../src/quiz';
import { clear } from '../src/other';
import * as auth from '../src/auth';
import { adminAuthRegister } from '../src/auth';
import { getData } from '../src/dataStore';
///////////////////////////////////////////////////////////////////
///test for adminQuizCreate
///////////////////////////////////////////////////////////////////
let authUser;
const ERROR = { error: expect.any(String) };
beforeEach(() => {
  clear();
  authUser = adminAuthRegister('fdhsjk@gmail.com', 'Password123', 'Tommy', 'Smith');
});
// AuthUserId is not a valid user.
// Name contains invalid characters. Valid characters are alphanumeric and spaces.
// Name is either less than 3 characters long or more than 30 characters long.
// Name is already used by the current logged in user for another quiz.
// Description is more than 100 characters in length (note: empty strings are OK).
describe('adminQuizCreate()', () => {
  describe('invalid input', () => {
    test('AuthUserId is not a valid user', () => {
      expect(quiz.adminQuizCreate(0, 'Name', 'Description')).toStrictEqual(ERROR);
    });

    test('Name contains invalid characters', () => {
      expect(quiz.adminQuizCreate(authUser.authUserId, 'Name!', 'Description')).toStrictEqual(ERROR);
    });
    test('Name is less than 3 characters long', () => {
      expect(quiz.adminQuizCreate(authUser.authUserId, 'Na', 'Description')).toStrictEqual(ERROR);
    });
    test('Name is more than 30 characters long', () => {
      expect(quiz.adminQuizCreate(authUser.authUserId, 'Name'.repeat(10), 'Description')).toStrictEqual(ERROR);
    });
    test('Name is already used by the current logged in user for another quiz', () => {
      quiz.adminQuizCreate(authUser.authUserId, 'Name', 'Description');
      expect(quiz.adminQuizCreate(authUser.authUserId, 'Name', 'Description')).toStrictEqual(ERROR);
    });
    test('Description is more than 100 characters in length', () => {
      expect(quiz.adminQuizCreate(authUser.authUserId, 'Name', 'Description'.repeat(10))).toStrictEqual(ERROR);
    });
  });
  describe('has a return type', () => {
    test('should return a number', () => {
      expect(quiz.adminQuizCreate(authUser.authUserId, 'Name', 'Description')).toEqual({ quizId: expect.any(Number)});
    });
  });
  describe('valid input', () => {
    test.todo('Use adminQuizInfo to check if the quiz was created');
  })
});
