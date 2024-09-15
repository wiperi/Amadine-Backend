import {
  adminQuizCreate,
  adminQuizInfo,
  adminQuizNameUpdate,
}from '../src/quiz';
import { clear } from '../src/other';
import { adminAuthRegister } from '../src/auth';
import { getData } from '../src/dataStore';
import { notStrictEqual } from 'assert';
let authUser;
const ERROR = { error: expect.any(String) };
beforeEach(() => {
  clear();
  authUser = adminAuthRegister('fdhsjk@gmail.com', 'Password123', 'Tommy', 'Smith');
});
///////////////////////////////////////////////////////////////////
///test for adminQuizCreate
///////////////////////////////////////////////////////////////////
// AuthUserId is not a valid user.
// Name contains invalid characters. Valid characters are alphanumeric and spaces.
// Name is either less than 3 characters long or more than 30 characters long.
// Name is already used by the current logged in user for another quiz.
// Description is more than 100 characters in length (note: empty strings are OK).
describe('adminQuizCreate()', () => {
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

/////////////////////////////////////////////////////////////////////////
///test for adminQuizNameUpdate
/////////////////////////////////////////////////////////////////////////
// invalid cases:
//   AuthUserId is not a valid user
//   Quiz Id does not refer to a valid quiz
//   Quiz Id does not refer to a quiz that this user owns
//   Name contains invalid characters. (not alphanumeric and spaces)
//   Name < 3 characters or > 30 characters
//   Name is already used by the current logged in user for another quiz
// valid cases:
//   has the correct return type
//   successful change the quiz name
//   successful change the last edited time
describe('adminQuizNameUpdate', () => {
  beforeEach(() => {
    const owner  = adminAuthRegister('peter@gmail.com', 'PumpkinEater123', 'Peter', 'Griffin');
    const quiz = adminQuizCreate(owner.authUserId, 'Name', 'Description');
  });

  describe('invalid input', () => {
    test('authUserId is not a valid user', () => {
      expect(adminQuizNameUpdate(0, 0, 'newName')).toStrictEqual(ERROR);
    });

    test('quiz id does not refer to a valid quiz', () => {
      expect(adminQuizNameUpdate(authUser.authUserId, 0, 'newName')).toStrictEqual(ERROR);
    });

    test('quiz id does not refer to a quiz that this user owns', () => {
      expect(adminQuizNameUpdate(authUser.adminUserId, quiz.quizId, 'newName')).toStrictEqual(ERROR);
    });

    test('name contains invalid characters', () => {
      expect(adminQuizNameUpdate(owner.authUserId, quiz.quizId, 'مرحبا')).toStrictEqual(ERROR);
    });

    test('name less than 3 characters or more than 30 characters', () => {
      expect(adminQuizNameUpdate(owner.authUserId, quiz.quizId, 'n')).toStrictEqual(ERROR);
      expect(adminQuizNameUpdate(owner.authUserId, quiz.quizId, 'morethanthirtycharsmorethanthirty')).toStrictEqual(ERROR);
    });

    test('name is already used by the current logged in user for another quiz', () => {
      const myQuiz = adminQuizCreate(authUser.adminUserId, 'myQuizName', 'myDescription');
      expect(adminQuizNameUpdate(authUser.adminUserId, myQuiz.quizId, 'Name')).toStrictEqual(ERROR);
    });
  });

  describe('valid input', () => {
    test('has correct return type', () => {
      expect(adminQuizNameUpdate(owner.authUserId, quiz.quizId, 'speedRound')).toStrictEqual({});
    });

    test('successful update the quiz name', () => {
      adminQuizNameUpdate(owner.authUserId, quiz.quizId, 'speedRound');
      expect(adminQuizInfo(owner.authUserId, quiz.quizId)).toStrictEqual({ quizId: quiz.quizId, name: 'speedRound', timeCreated: quiz.timeCreated, timeLastEdited: expect.any(Number), description: 'Description' })
    });

    test('successful update the last edited time', () => {
      adminQuizNameUpdate(owner.authUserId, quiz.quizId, 'speedRound');
      expect(adminQuizInfo(owner.authUserId, quiz.quizId)).toStrictEqual({ quizId: quiz.quizId, name: expect.any(String), timeCreated: quiz.timeCreated, timeLastEdited: notStrictEqual(quiz.timeCreated), description: 'Description' })
    })
  });
});