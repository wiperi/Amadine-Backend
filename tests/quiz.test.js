import {
  adminQuizCreate,
  adminQuizInfo,
  adminQuizList,
} from '../src/quiz';
import { clear } from '../src/other';
import { adminAuthRegister } from '../src/auth';

const ERROR = { error: expect.any(String) };

let user;
beforeEach(() => {
  clear();
  user = adminAuthRegister('fdhsjk@gmail.com', 'Password123', 'Tommy', 'Smith');
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
      expect(adminQuizCreate(user.authUserId, 'Name!', 'Description')).toStrictEqual(ERROR);
    });
    test('Name is less than 3 characters long', () => {
      expect(adminQuizCreate(user.authUserId, 'Na', 'Description')).toStrictEqual(ERROR);
    });
    test('Name is more than 30 characters long', () => {
      expect(adminQuizCreate(user.authUserId, 'Name'.repeat(10), 'Description')).toStrictEqual(ERROR);
    });
    test('Name is already used by the current logged in user for another quiz', () => {
      adminQuizCreate(user.authUserId, 'Name', 'Description');
      expect(adminQuizCreate(user.authUserId, 'Name', 'Description')).toStrictEqual(ERROR);
    });
    test('Description is more than 100 characters in length', () => {
      expect(adminQuizCreate(user.authUserId, 'Name', 'Description'.repeat(10))).toStrictEqual(ERROR);
    });
  });
  describe('has a return type', () => {
    test('should return a number', () => {
      expect(adminQuizCreate(user.authUserId, 'Name', 'Description')).toEqual({ quizId: expect.any(Number) });
    });
  });
  describe('valid input', () => {
    test('should add a quiz to the data store', () => {
      const quiz = adminQuizCreate(user.authUserId, 'Name', 'Description');
      expect(adminQuizInfo(user.authUserId, quiz.quizId)).toEqual({ quizId: quiz.quizId, name: 'Name', timeCreated: expect.any(Number), timeLastEdited: expect.any(Number), description: 'Description' });
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
      expect(adminQuizInfo(user.authUserId, 0)).toStrictEqual(ERROR);
    });
  });

  describe('has a correct return type', () => {
    test('should return an object', () => {
      const quiz = adminQuizCreate(user.authUserId, 'Name', 'Description');
      expect(adminQuizInfo(user.authUserId, quiz.quizId)).toEqual({ quizId: expect.any(Number), name: expect.any(String), timeCreated: expect.any(Number), timeLastEdited: expect.any(Number), description: expect.any(String) });
    });
  });

  describe('valid input', () => {
    test('should return the correct information', () => {
      const quiz = adminQuizCreate(user.authUserId, 'Name', 'Description');
      expect(adminQuizInfo(user.authUserId, quiz.quizId)).toEqual({ quizId: quiz.quizId, name: 'Name', timeCreated: expect.any(Number), timeLastEdited: expect.any(Number), description: 'Description' });
    });
  });
});

/////////////////////////////////////////////////////////////////////
// adminQuizList()
/////////////////////////////////////////////////////////////////////

describe('adminQuizList()', () => {

  describe('invalid input', () => {
    test('authUserId is not a valid user', () => {
      expect(adminQuizList(user.authUserId + 1)).toStrictEqual(ERROR);
    });
  });

  test('correct return type', () => {
    const quiz = adminQuizCreate(user.authUserId, 'Quiz1', 'Description1');
    expect(adminQuizList(user.authUserId)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz.quizId,
          name: 'Quiz1'
        }
      ]
    });
  });

  describe('valid input', () => {
    test('should return the correct list of quizzes', () => {
      const quiz1 = adminQuizCreate(user.authUserId, 'Quiz1', 'Description1');
      const quiz2 = adminQuizCreate(user.authUserId, 'Quiz2', 'Description2');
      const quizList = adminQuizList(user.authUserId);
      expect(quizList.quizzes).toEqual(expect.arrayContaining([
        { quizId: quiz1.quizId, name: 'Quiz1' },
        { quizId: quiz2.quizId, name: 'Quiz2' }
      ]));
    });
  });
});