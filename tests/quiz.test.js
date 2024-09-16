import {
  adminQuizCreate,
  adminQuizInfo,
}from '../src/quiz';
import { clear } from '../src/other';
import { adminAuthRegister } from '../src/auth';

const ERROR = { error: expect.any(String) };

let authUser;
beforeEach(() => {
  clear();
  authUser = adminAuthRegister('fdhsjk@gmail.com', 'Password123', 'Tommy', 'Smith');
});

///////////////////////////////////////////////////////////////////
///test for adminQuizCreate
///////////////////////////////////////////////////////////////////

describe('adminQuizCreate()', () => {

  // AuthUserId is not a valid user.
  // Name contains invalid characters. Valid characters are alphanumeric and spaces.
  // Name is either less than 3 characters long or more than 30 characters long.
  // Name is already used by the current logged in user for another quiz.
  // Description is more than 100 characters in length (note: empty strings are OK).

  describe('invalid input', () => {
    test('AuthUserId is not a valid user', () => {
      expect(adminQuizCreate(0, 'Name', 'Description')).toStrictEqual(ERROR);
    });

    test('Name contains invalid characters', () => {
      expect(adminQuizCreate(authUser.authUserId, 'Name!', 'Description')).toStrictEqual(ERROR);
    });
    test('Name is less than 3 characters long', () => {
      expect(adminQuizCreate(authUser.authUserId, 'Na', 'Description')).toStrictEqual(ERROR);
    });
    test('Name is more than 30 characters long', () => {
      expect(adminQuizCreate(authUser.authUserId, 'Name'.repeat(10), 'Description')).toStrictEqual(ERROR);
    });
    test('Name is already used by the current logged in user for another quiz' ,() => {
      adminQuizCreate(authUser.authUserId, 'Name', 'Description');
      expect(adminQuizCreate(authUser.authUserId, 'Name', 'Description')).toStrictEqual(ERROR);
    });
    test('Description is more than 100 characters in length', () => {
      expect(adminQuizCreate(authUser.authUserId, 'Name', 'Description'.repeat(10))).toStrictEqual(ERROR);
    });
  });
  describe('has a return type', () => {
    test('should return a number', () => {
      expect(adminQuizCreate(authUser.authUserId, 'Name', 'Description')).toEqual({ quizId: expect.any(Number)});
    });
  });
  describe('valid input', () => {
    test('should add a quiz to the data store', () => {
      const quiz = adminQuizCreate(authUser.authUserId, 'Name', 'Description');
      expect(adminQuizInfo(authUser.authUserId, quiz.quizId)).toEqual({ quizId: quiz.quizId, name: 'Name', timeCreated: expect.any(Number), timeLastEdited: expect.any(Number), description: 'Description'});
    });
  })
});

///////////////////////////////////////////////////////////////////
///test for adminQuizInfo
///////////////////////////////////////////////////////////////////

describe('adminQuizInfo()', () => {
  
  describe('invalid input', () => {
    test('AuthUserId is not a valid user', () => {
      expect(adminQuizInfo(0, 0)).toStrictEqual(ERROR);
    });

    test('QuizId is not a valid quiz', () => {
      expect(adminQuizInfo(authUser.authUserId, 0)).toStrictEqual(ERROR);
    });
  });

  describe('has a correct return type', () => {
    test('should return an object', () => {
      const quiz = adminQuizCreate(authUser.authUserId, 'Name', 'Description');
      expect(adminQuizInfo(authUser.authUserId, quiz.quizId)).toEqual({ quizId: expect.any(Number), name: expect.any(String), timeCreated: expect.any(Number), timeLastEdited: expect.any(Number), description: expect.any(String)});
    });
  });

  describe('valid input', () => {
    test('should return the correct information', () => {
      const quiz = adminQuizCreate(authUser.authUserId, 'Name', 'Description');
      expect(adminQuizInfo(authUser.authUserId, quiz.quizId)).toEqual({ quizId: quiz.quizId, name: 'Name', timeCreated: expect.any(Number), timeLastEdited: expect.any(Number), description: 'Description'});
    });
  });
});