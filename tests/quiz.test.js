import {
  adminQuizCreate,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizList,
  adminQuizRemove,
} from '../src/quiz';
import { clear } from '../src/other';
import { adminAuthRegister } from '../src/auth';
import { getData } from '../src/dataStore';
import { notStrictEqual } from 'assert';
import { findQuizById } from '../src/helper';

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
    test('Name is already used by the current logged in user for another quiz', () => {
      adminQuizCreate(authUser.authUserId, 'Name', 'Description');
      expect(adminQuizCreate(authUser.authUserId, 'Name', 'Description')).toStrictEqual(ERROR);
    });
    test('Description is more than 100 characters in length', () => {
      expect(adminQuizCreate(authUser.authUserId, 'Name', 'Description'.repeat(10))).toStrictEqual(ERROR);
    });
  });
  describe('has a return type', () => {
    test('should return a number', () => {
      expect(adminQuizCreate(authUser.authUserId, 'Name', 'Description')).toEqual({ quizId: expect.any(Number) });
    });
  });
  describe('valid input', () => {
    test('should add a quiz to the data store', () => {
      const quiz = adminQuizCreate(authUser.authUserId, 'Name', 'Description');
      expect(adminQuizInfo(authUser.authUserId, quiz.quizId)).toEqual({ quizId: quiz.quizId, name: 'Name', timeCreated: expect.any(Number), timeLastEdited: expect.any(Number), description: 'Description' });
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
      expect(adminQuizInfo(authUser.authUserId, quiz.quizId)).toEqual({ quizId: expect.any(Number), name: expect.any(String), timeCreated: expect.any(Number), timeLastEdited: expect.any(Number), description: expect.any(String) });
    });
  });

  describe('valid input', () => {
    test('should return the correct information', () => {
      const quiz = adminQuizCreate(authUser.authUserId, 'Name', 'Description');
      expect(adminQuizInfo(authUser.authUserId, quiz.quizId)).toEqual({ quizId: quiz.quizId, name: 'Name', timeCreated: expect.any(Number), timeLastEdited: expect.any(Number), description: 'Description' });
    });
  });
});

/////////////////////////////////////////////////////////////////////
// adminQuizList()
/////////////////////////////////////////////////////////////////////

describe('adminQuizList()', () => {

  describe('invalid input', () => {
    test('authUserId is not a valid user', () => {
      expect(adminQuizList(authUser.authUserId + 1)).toStrictEqual(ERROR);
    });
  });

  test('correct return type', () => {
    const quiz = adminQuizCreate(authUser.authUserId, 'Quiz1', 'Description1');
    expect(adminQuizList(authUser.authUserId)).toStrictEqual({
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
      const quiz1 = adminQuizCreate(authUser.authUserId, 'Quiz1', 'Description1');
      const quiz2 = adminQuizCreate(authUser.authUserId, 'Quiz2', 'Description2');
      const quizList = adminQuizList(authUser.authUserId);
      expect(quizList.quizzes).toEqual(expect.arrayContaining([
        { quizId: quiz1.quizId, name: 'Quiz1' },
        { quizId: quiz2.quizId, name: 'Quiz2' }
      ]));
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
  let owner, quiz;
  beforeEach(() => {
    owner  = adminAuthRegister('peter@gmail.com', 'PumpkinEater123', 'Peter', 'Griffin');
    quiz = adminQuizCreate(owner.authUserId, 'Name', 'Description');
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
      expect(adminQuizInfo(owner.authUserId, quiz.quizId)).toStrictEqual({ quizId: quiz.quizId, name: 'speedRound', timeCreated: expect.any(Number), timeLastEdited: expect.any(Number), description: 'Description' });
    });

    test('wait 1 second before successful update the last edited time', () => {

      // mocking the time to be in the future
      const NOW = '2200-05-03T08:00:00.000Z';
      const mockDateNow = jest.spyOn(global.Date, 'now').mockImplementation(() => new Date(NOW).getTime());
      
      adminQuizNameUpdate(owner.authUserId, quiz.quizId, 'speedRound');
      const testQuiz = findQuizById(quiz.quizId);
      expect(testQuiz.timeLastEdited).not.toEqual(testQuiz.timeCreated);

      mockDateNow.mockRestore();
    });
  });
});

///////////////////////////////////////////////////////////////////
  ///test for adminQuizDescriptionUpdate
  ///////////////////////////////////////////////////////////////////
  describe('adminQuizDescriptionUpdate()', () => {
    describe('invalid input', () => {
      test('AuthUserId is not a valid user', () => {
        expect(adminQuizDescriptionUpdate(0, 0, 'Description')).toStrictEqual(ERROR);
      });
      test('Quiz ID does not refer to a valid quiz', () => {
        expect(adminQuizDescriptionUpdate(authUser.authUserId, 0, 'Description')).toStrictEqual(ERROR);
      });
      test('Quiz ID does not refer to a quiz that this user owns', () => {
        const quiz = adminQuizCreate(authUser.authUserId, 'Name', 'Description');
        const user = adminAuthRegister('artoria@example.com', 'Artoria123', 'Artoria', 'Pendragon');
        expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId, 'New Description')).toStrictEqual(ERROR);
      });
      test('Description is more than 100 characters in length', () => {
        const quiz = adminQuizCreate(authUser.authUserId, 'Name', 'Description');
        expect(adminQuizDescriptionUpdate(authUser.authUserId, quiz.quizId, 'Description'.repeat(10))).toStrictEqual(ERROR);
      });
    });
  
    describe('valid input', () => {
      test('should update the description of the quiz', () => {
        const quiz = adminQuizCreate(authUser.authUserId, 'Fate', 'Description');
        adminQuizDescriptionUpdate(authUser.authUserId, quiz.quizId, 'New Description');
        expect(adminQuizInfo(authUser.authUserId, quiz.quizId)).toEqual({ quizId: quiz.quizId, name: 'Fate', timeCreated: expect.any(Number), timeLastEdited: expect.any(Number), description: 'New Description'});
      });
      test ('timeLastEdited should be updated', () => {
        const authUser = adminAuthRegister('validuser@example.com', 'ValidPass123', 'Valid', 'User');
        const quiz = adminQuizCreate(authUser.authUserId, 'Fate', 'Description');
        const NOW = '2200-05-03T08:00:00.000Z';
        const mockDateNow = jest.spyOn(global.Date, 'now').mockImplementation(() => new Date(NOW).getTime());

        adminQuizDescriptionUpdate(authUser.authUserId, quiz.quizId, 'New Description');
        const testQuiz = findQuizById(quiz.quizId);
        expect(testQuiz.timeLastEdited).not.toEqual(testQuiz.timeCreated);

        mockDateNow.mockRestore();
      });
    });
  });

/////////////////////////////////////////////////////////////////////////
///test for adminQuizRemove
/////////////////////////////////////////////////////////////////////////

describe('adminQuizRemove()', () => {

  describe('invalid input', () => {
    test('AuthUserId is not a valid user', () => {
      const quiz = adminQuizCreate(authUser.authUserId, 'Remove', 'Description');
      expect(adminQuizRemove(0, quiz.quizId)).toStrictEqual(ERROR);
    });

    test('QuizId is not a valid quiz', () => {
      expect(adminQuizRemove(authUser.authUserId, 1234)).toStrictEqual(ERROR);
    });

    test('QuizId does not belong to the current user', () => {
      const anotherUser = adminAuthRegister('anotheruser@gmail.com', 'Anothepassword123', 'First', 'Last');
      const anotherUserQuiz = adminQuizCreate(anotherUser.authUserId, 'Anotherquiz', 'Description');
      expect(adminQuizRemove(authUser.authUserId, anotherUserQuiz.quizId)).toStrictEqual(ERROR);
    });
  });

  describe('valid input', () => {
    test('should successfully remove a quiz by the owner', () => {
      const quiz = adminQuizCreate(authUser.authUserId, 'Remove', 'Description');
      const result = adminQuizRemove(authUser.authUserId, quiz.quizId);
      
      expect(result).toEqual({});
      
      const quizInfo = adminQuizInfo(authUser.authUserId, quiz.quizId);
      expect(quizInfo.active).toBeFalsy();
    });

    test('should not list removed quiz in adminQuizList', () => {
      const quiz1 = adminQuizCreate(authUser.authUserId, 'Quiz1', 'Description1');
      const quiz2 = adminQuizCreate(authUser.authUserId, 'Quiz2', 'Description2');
    
      adminQuizRemove(authUser.authUserId, quiz1.quizId);
      const quizList = adminQuizList(authUser.authUserId);
      const expectedQuizList = [
        { quizId: quiz2.quizId, name: 'Quiz2' }
      ];
    
      expect(quizList.quizzes).toEqual(expectedQuizList);
    });
  });
});