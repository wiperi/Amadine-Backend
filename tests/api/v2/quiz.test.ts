import {
    quizGetList,
    quizGetDetails,
    quizCreate,
    quizDelete,
    quizTransfer,
  } from './helpers';
  
import {
    userRegister,
    clear
} from '../v1/helpers';

const ERROR = { error: expect.any(String) };

let token: string;
beforeEach(() => {
clear();
// Register a user and get the token
const res = userRegister('test@example.com', 'ValidPass123', 'John', 'Doe');
expect(res.statusCode).toBe(200);
token = res.body.token;
});

afterAll(() => {
clear();
});

// test for quiz info
describe('GET /v1/admin/quiz/:quizId', () => {
  describe('valid cases', () => {
    test('successful quiz retrieval', () => {
      const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
      expect(createQuizRes.statusCode).toBe(200);
      const { quizId } = createQuizRes.body;
      const res = quizGetDetails(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        quizId,
        name: 'Test Quiz',
        description: 'A test quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        numQuestions: 0,
        questions: [],
        duration: 0,
      });
    });
  });
  describe('invalid cases', () => {
      test('invalid token', () => {
        const res = quizGetDetails('invalid_token', 1);
        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual(ERROR);
      });
      test('missing token', () => {
        const res = quizGetDetails('', 1);
        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual(ERROR);
      });
      test('invalid quiz ID', () => {
        const res = quizGetDetails(token, 0);
        expect(res.statusCode).toBe(403);
        expect(res.body).toStrictEqual(ERROR);
      });
  
      test('user is not the owner of th quiz', () => {
        const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
        expect(createQuizRes.statusCode).toBe(200);
        const { quizId } = createQuizRes.body;
        const createUserRes = userRegister('testfds@example.com', 'ValidPass123', 'cheong', 'Zhang');
        expect(createUserRes.statusCode).toBe(200);
        token = createUserRes.body.token;
        const res = quizGetDetails(token, quizId);
        expect(res.statusCode).toBe(403);
      });
      test('nonexistent quiz ID', () => {
        const res = quizGetDetails(token, 1);
        expect(res.statusCode).toBe(403);
        expect(res.body).toStrictEqual(ERROR);
      });
    });
});


// test for quiz remove
 describe('DELETE /v1/admin/quiz/:quizid', () => {
  let quizId: number;

  beforeEach(() => {
    // Create a quiz before each test in this suite
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;
  });

  describe('valid cases', () => {
    test('successful quiz removal', () => {
      const res = quizDelete(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});

      // Verify the quiz is deleted using getQuizList from apihelpertest
      const resList = quizGetList(token);
      expect(resList.statusCode).toBe(200);
      expect(resList.body.quizzes).not.toContainEqual(expect.objectContaining({ quizId }));
    });
  });

  describe('invalid cases', () => {
    test('invalid token', () => {
      // Try deleting the quiz with an invalid token
      const res = quizDelete('invalid_token', quizId);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('quiz ID does not exist', () => {
      // Try deleting a non-existent quiz ID
      const res = quizDelete(token, 999999); // Non-existent quiz ID
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('user is not the owner of the quiz', () => {
      // Register another user and attempt to delete the quiz created by the original user
      const userRes = userRegister('peter@example.com', 'ValidPass123', 'Peter', 'Griffin');
      expect(userRes.statusCode).toBe(200);
      const newToken = userRes.body.token;

      // Attempt to delete with the new user's token
      const res = quizDelete(newToken, quizId);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });
  });
}); 

// test for quiz transfer
describe('POST /v1/admin/quiz/:quizid/transfer', () => {
  let quizId: number;

  beforeEach(() => {
    // Create a quiz before each test
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId; // Store quizId for reuse
  });

  describe('valid cases', () => {
    test('successfully transfer quiz to another user', () => {
      // Register another user to transfer the quiz to
      const newUserRes = userRegister('newuser@example.com', 'ValidPass123', 'Jane', 'Smith');
      expect(newUserRes.statusCode).toBe(200);

      // Transfer the quiz to the new user
      const transferRes = quizTransfer(token, quizId, 'newuser@example.com');
      expect(transferRes.statusCode).toBe(200);
      expect(transferRes.body).toStrictEqual({});

      // Verify the new owner by checking quiz details
      const newToken = newUserRes.body.token;
      const quizDetails = quizGetDetails(newToken, quizId);
      expect(quizDetails.statusCode).toBe(200);
      expect(quizDetails.body.authUserId).toBe(newUserRes.body.userId);
    });
  });

  describe('invalid cases', () => {
    test('invalid token', () => {
      const transferRes = quizTransfer('invalid_token', quizId, 'newuser@example.com');
      expect(transferRes.statusCode).toBe(401);
      expect(transferRes.body).toStrictEqual(ERROR);
    });

    test('missing token', () => {
      const transferRes = quizTransfer('', quizId, 'newuser@example.com');
      expect(transferRes.statusCode).toBe(401);
      expect(transferRes.body).toStrictEqual(ERROR);
    });

    test('user does not exist', () => {
      const transferRes = quizTransfer(token, quizId, 'nonexistent@example.com');
      expect(transferRes.statusCode).toBe(400);
      expect(transferRes.body).toStrictEqual(ERROR);
    });

    test('transferring to self', () => {
      const transferRes = quizTransfer(token, quizId, 'test@example.com');
      expect(transferRes.statusCode).toBe(400);
      expect(transferRes.body).toStrictEqual(ERROR);
    });

    test('user is not the owner of the quiz', () => {
      const newUserRes = userRegister('random@example.com', 'ValidPass123', 'Random', 'User');
      expect(newUserRes.statusCode).toBe(200);

      const newToken = newUserRes.body.token;
      const transferRes = quizTransfer(newToken, quizId, 'newuser@example.com');
      expect(transferRes.statusCode).toBe(403);
      expect(transferRes.body).toStrictEqual(ERROR);
    });
  
    test('quiz does not exist', () => {
      const transferRes = quizTransfer(token, 999999, 'newuser@example.com');
      expect(transferRes.statusCode).toBe(403);
      expect(transferRes.body).toStrictEqual(ERROR);
    });

    test('target user already has a quiz with the same name', () => {
        // Register the target user
        const newUserRes = userRegister('newuser@example.com', 'ValidPass123', 'Jane', 'Smith');
        expect(newUserRes.statusCode).toBe(200);
        const newToken = newUserRes.body.token;
  
        // Create a quiz for the target user with the same name
        const targetQuizRes = quizCreate(newToken, 'Test Quiz', 'Target user quiz with same name');
        expect(targetQuizRes.statusCode).toBe(200);
  
        const transferRes = quizTransfer(token, quizId, 'newuser@example.com');
        expect(transferRes.statusCode).toBe(400);
        expect(transferRes.body).toStrictEqual(ERROR);
      });
    });
});