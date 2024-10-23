import {
  userRegister,
  userLogin,
  quizGetList,
  quizGetDetails,
  quizCreate,
  quizDelete,
  quizUpdateDescription,
  quizGetTrash,
  quizRestore,
  clear,
  quizRequestNameUpdate,
  trashEmpty,
  quizTransfer,
  quizUpdateThumbnail,
} from './helpers';

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
/*
 This is test for AQL
 */
describe('GET /v1/admin/quiz/list', () => {
  describe('valid cases', () => {
    test('successful quiz list retrieval with no quizzes', () => {
      const res = quizGetList(token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({ quizzes: [] });
    });

    test('successful quiz list retrieval with quizzes', () => {
      // Create a quiz
      const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
      expect(createQuizRes.statusCode).toBe(200);
      const { quizId } = createQuizRes.body;
      const res = quizGetList(token);
      expect(res.statusCode).toBe(200);
      const body = res.body;
      expect(body).toHaveProperty('quizzes');
      expect(Array.isArray(body.quizzes)).toBe(true);
      expect(body.quizzes.length).toBe(1);
      expect(body.quizzes[0]).toStrictEqual({
        quizId,
        name: 'Test Quiz',
      });
    });
  });

  describe('invalid cases', () => {
    test('invalid token', () => {
      const res = quizGetList('invalid_token');
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('missing token', () => {
      const res = quizGetList('');
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });
  });
});
/*
 This is test for AQC
 */
describe('POST /v1/admin/quiz', () => {
  describe('valid cases', () => {
    test('successful quiz creation', () => {
      const res = quizCreate(token, 'Test Quiz', 'A test quiz');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('quizId');
    });
    test('successful quiz creation with empty description', () => {
      const res = quizCreate(token, 'Test Quiz', '');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('quizId');
    });
    test('two different user can create same quiz', () => {
      const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
      expect(createQuizRes.statusCode).toBe(200);
      const { quizId: quizId1 } = createQuizRes.body;
      const createUserRes = userRegister('admin@unsw.edu.au', 'ValidPass123', 'Admin', 'User');
      expect(createUserRes.statusCode).toBe(200);
      const token2 = createUserRes.body.token;
      const res = quizCreate(token2, 'Test Quiz', 'A test quiz');
      const { quizId: quizId2 } = res.body;
      expect(res.statusCode).toBe(200);
    });
  });
  describe('invalid cases', () => {
    test('invalid token', () => {
      const res = quizCreate('invalid_token', 'Test Quiz', 'A test quiz');
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('short name', () => {
      const res = quizCreate(token, 'a', 'A test quiz');
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('long name', () => {
      const res = quizCreate(token, 'a'.repeat(31), 'A test quiz');
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('repeated name', () => {
      const res = quizCreate(token, 'Test Quiz', 'A test quiz');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('quizId');
      const res2 = quizCreate(token, 'Test Quiz', 'A test quiz');
      expect(res2.statusCode).toBe(400);
      expect(res2.body).toStrictEqual(ERROR);
    });
  });
});
/*
 This is test for AQI
 */
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
/*
 This is test for AQNU
 */
describe('PUT /v1/admin/quiz/{quizid}/name', () => {
  let quizId: number;
  beforeEach(() => {
    // create a quiz
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;
  });

  describe('invalid cases', () => {
    test('name contains invalid characters', () => {
      const res = quizRequestNameUpdate(quizId, token, 'Алексей');
      expect(res).toStrictEqual(400);
    });

    test('name less than 3 characters', () => {
      const res = quizRequestNameUpdate(quizId, token, 'ha');
      expect(res).toStrictEqual(400);
    });

    test('name is more than 30 characters', () => {
      const res = quizRequestNameUpdate(quizId, token, 'morethanthirtycharsmorethanthirty');
      expect(res).toStrictEqual(400);
    });

    test('name is already used by the current logged in user for another quiz', () => {
      const createQuizRes1 = quizCreate(
        token,
        'My Test Name',
        'Do not have the same name as mine!'
      );
      expect(createQuizRes1.statusCode).toStrictEqual(200);
      const res = quizRequestNameUpdate(quizId, token, 'My Test Name');
      expect(res).toStrictEqual(400);
    });

    test('userId is empty', () => {
      const res = quizRequestNameUpdate(quizId, '', 'newName');
      expect(res).toStrictEqual(401);
    });

    test('userId does not refer to a valid logged in user session', () => {
      const res = quizRequestNameUpdate(quizId, 'invalidToken', 'newName');
      expect(res).toStrictEqual(401);
    });

    test('user is not a owner of the quiz', () => {
      const userRes = userRegister('peter@example.com', 'PumpkinEater123', 'Peter', 'Griffin');
      expect(userRes.statusCode).toBe(200);
      const token1 = userRes.body.token;

      const res = quizRequestNameUpdate(quizId, token1, 'newName');
      expect(res).toStrictEqual(403);
    });

    test('quizId does not exist', () => {
      const res = quizRequestNameUpdate(0, token, 'newName');
      expect(res).toStrictEqual(403);
    });
  });

  describe('valid cases', () => {
    test('has correct return type', () => {
      const res = quizRequestNameUpdate(quizId, token, 'myName');
      expect(res).toStrictEqual({});
    });

    test('successful update the quiz name', () => {
      quizRequestNameUpdate(quizId, token, 'newName');
      const res = quizGetDetails(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        quizId,
        name: 'newName',
        description: 'A test quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        numQuestions: 0,
        questions: [],
        duration: 0,
      });
    });

    test('successful update last edit time', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      quizRequestNameUpdate(quizId, token, 'newName');
      const res = quizGetDetails(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body.timeLastEdited).not.toStrictEqual(res.body.timeCreated);
    });
  });
});

/*
 This is test for AQNU
 */
describe('PUT /v1/admin/quiz/:quizId/description', () => {
  let quizId: number;
  beforeEach(() => {
    const createQuizRes = quizCreate(token, 'Fate', 'Description');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;
  });

  describe('valid cases', () => {
    test('should update the description of the quiz', () => {
      const res = quizUpdateDescription(token, quizId, 'An updated test quiz');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
      const res1 = quizGetDetails(token, quizId);
      expect(res1.statusCode).toBe(200);
      expect(res1.body).toStrictEqual({
        quizId,
        name: 'Fate',
        description: 'An updated test quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        numQuestions: 0,
        questions: [],
        duration: 0,
      });
    });
    test('successful update last edit time', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = quizUpdateDescription(token, quizId, 'An updated test quiz');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
      const res1 = quizGetDetails(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res1.body.timeLastEdited).not.toStrictEqual(res1.body.timeCreated);
    });
  });

  describe('invalid cases', () => {
    test('invalid_token', () => {
      const res = quizUpdateDescription('invalid_token', quizId, 'An updated test quiz');

      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('invalid quiz ID', () => {
      const res = quizUpdateDescription(token, 0, 'An updated test quiz');
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('Description is more than 100 characters in length', () => {
      const res = quizUpdateDescription(token, quizId, 'Description'.repeat(10));
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('user is not the owner of th quiz', () => {
      const createUserRes = userRegister('wick@example.com', 'JohnWick123', 'John', 'Wick');
      expect(createUserRes.statusCode).toBe(200);
      token = createUserRes.body.token;
      const res = quizUpdateDescription(token, quizId, 'An updated test quiz');
      expect(res.statusCode).toBe(403);
    });
  });
});
/*
 This is test for AQR
 */
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

/*
 This is test for AQRe
 */
describe('POST /v1/admin/quiz/:quizId/restore', () => {
  let quizId: number;
  beforeEach(() => {
    const createQuizRes = quizCreate(token, 'Fate', 'Description');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;
  });
  describe('valid cases', () => {
    test('should restore quiz', () => {
      quizDelete(token, quizId);
      const res = quizRestore(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
      const res1 = quizGetDetails(token, quizId);
      expect(res1.statusCode).toBe(200);
      expect(res1.body).toStrictEqual({
        quizId,
        name: 'Fate',
        description: 'Description',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        numQuestions: 0,
        questions: [],
        duration: 0,
      });
    });
    test('successful update last edit time', async () => {
      quizDelete(token, quizId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = quizRestore(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
      const res1 = quizGetDetails(token, quizId);
      expect(res.statusCode).toBe(200);
      expect(res1.body.timeLastEdited).not.toStrictEqual(res1.body.timeCreated);
    });
  });
  describe('invalid cases', () => {
    test('invalid_token', () => {
      const res = quizRestore('invalid_token', quizId);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('invalid quiz ID', () => {
      const res = quizRestore(token, 0);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('user is not the owner of th quiz', () => {
      const createUserRes = userRegister('wick@example.com', 'JohnWick123', 'John', 'Wick');
      expect(createUserRes.statusCode).toBe(200);
      token = createUserRes.body.token;
      const res = quizRestore(token, quizId);
      expect(res.statusCode).toBe(403);
    });
    test('quiz is not in trash', () => {
      const res = quizRestore(token, quizId);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('quiz name of the restored quiz is already used by the current logged in user for another quiz', () => {
      quizDelete(token, quizId);
      const createQuizRes = quizCreate(token, 'Fate', 'Are you my master?');
      expect(createQuizRes.statusCode).toBe(200);
      const res = quizRestore(token, quizId);
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
  });
});

//////////////////////////////////////////////////////////
///////////this is test DELETE /v1/admin/quiz/trash/empty
///////////////////////////////////////////////////////////
describe('DELETE /v1/admin/quiz/trash/empty', () => {
  let quizId1: number;
  let quizId2: number;
  beforeEach(() => {
    // Create a quiz before each test in this suite
    let createQuizRes = quizCreate(token, 'Test Quiz1', 'A test quiz1');
    expect(createQuizRes.statusCode).toBe(200);
    quizId1 = createQuizRes.body.quizId;

    createQuizRes = quizCreate(token, 'Test Quiz2', 'A test quiz2');
    expect(createQuizRes.statusCode).toBe(200);
    quizId2 = createQuizRes.body.quizId;

    // Delete the quiz
    const deleteQuizRes = quizDelete(token, quizId1);
    expect(deleteQuizRes.statusCode).toBe(200);
  });

  describe('valid cases', () => {
    test('successful empty trash', () => {
      const quizIdsParam = JSON.stringify([quizId1]);
      const emptyRes = trashEmpty(token, quizIdsParam);
      expect(emptyRes.statusCode).toBe(200);
      expect(emptyRes.body).toStrictEqual({});
      const AdminQuizTrashViewRes = quizGetTrash(token);
      expect(AdminQuizTrashViewRes.statusCode).toBe(200);
      expect(AdminQuizTrashViewRes.body).toStrictEqual({ quizzes: [] });
    });
    test('successful empty trash with multiple quizzes', () => {
      quizDelete(token, quizId2);
      const quizIdsParam = JSON.stringify([quizId1, quizId2]);
      const emptyRes = trashEmpty(token, quizIdsParam);
      expect(emptyRes.statusCode).toBe(200);
      expect(emptyRes.body).toStrictEqual({});
      expect(quizGetTrash(token).body).toStrictEqual({ quizzes: [] });
    });
  });

  describe('invalid cases', () => {
    test('invalid token', () => {
      const quizIdsParam = JSON.stringify([quizId1]);
      const emptyRes = trashEmpty('invalid_token', quizIdsParam);
      expect(emptyRes.statusCode).toBe(401);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });

    test('missing token', () => {
      const emptyRes = trashEmpty('', JSON.stringify([quizId1]));
      expect(emptyRes.statusCode).toBe(401);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });

    test('quiz ID does not exist', () => {
      const emptyRes = trashEmpty(token, JSON.stringify([999999]));
      expect(emptyRes.statusCode).toBe(403);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });

    test('user is not the owner of the quiz', () => {
      // Register another user
      const resRegister = userRegister('nice@unsw.edu.au', 'ValidPass123', 'Cheong', 'Zhang');
      const otherToken = resRegister.body.token;
      expect(resRegister.statusCode).toBe(200);
      const emptyRes = trashEmpty(otherToken, JSON.stringify([quizId1]));
      expect(emptyRes.statusCode).toBe(403);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });
    test('Quiz is not in the trash', () => {
      const emptyRes = trashEmpty(token, JSON.stringify([quizId2]));
      expect(emptyRes.statusCode).toBe(400);
      expect(emptyRes.body).toStrictEqual(ERROR);
    });
  });
});
/////////////////////////////////////////////////
// Test for adminQuizTrashView //////////////////
/////////////////////////////////////////////////
describe('GET /v1/admin/quiz/trash', () => {
  let quizId: number;
  beforeEach(() => {
    const res = quizCreate(token, 'Test quiz', 'description for test quiz');
    expect(res.statusCode).toStrictEqual(200);
    quizId = res.body.quizId;
  });

  describe('invalid cases', () => {
    test('token is empty', () => {
      const res = quizGetTrash('');
      expect(res.statusCode).toStrictEqual(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('token does not refer to valid logged in user session', () => {
      const res = quizGetTrash('invalid token');
      expect(res.statusCode).toStrictEqual(401);
      expect(res.body).toStrictEqual(ERROR);
    });
  });

  describe('valid cases', () => {
    beforeEach(() => {
      const loginRes = userLogin('test@example.com', 'ValidPass123');
      expect(loginRes.statusCode).toStrictEqual(200);
    });

    test('success view trash for user with 0 quiz in trash', () => {
      const res = quizGetTrash(token);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual({ quizzes: [] });
    });

    test('success view trash for user with 1 quiz in trash', () => {
      const deleteRes = quizDelete(token, quizId);
      expect(deleteRes.statusCode).toStrictEqual(200);
      const res = quizGetTrash(token);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual({
        quizzes: [
          {
            quizId: quizId,
            name: 'Test quiz',
          },
        ],
      });
    });

    test('success view trash for user with multiple quizzes in trash', () => {
      const createQuizRes = quizCreate(token, 'family guy', 'what is the dog name');
      expect(createQuizRes.statusCode).toStrictEqual(200);
      const quizId1 = createQuizRes.body.quizId;
      const deleteRes1 = quizDelete(token, quizId);
      expect(deleteRes1.statusCode).toStrictEqual(200);
      const deleteRes2 = quizDelete(token, quizId1);
      expect(deleteRes2.statusCode).toStrictEqual(200);
      const res = quizGetTrash(token);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual({
        quizzes: [
          {
            quizId: quizId,
            name: 'Test quiz',
          },
          {
            quizId: quizId1,
            name: 'family guy',
          },
        ],
      });
    });

    test('success view trash when there is multiple user', () => {
      const registerRes = userRegister('peter@gmail.com', 'PumkinEater123', 'Peter', 'Griffin');
      expect(registerRes.statusCode).toBe(200);
      const deleteRes = quizDelete(token, quizId);
      expect(deleteRes.statusCode).toStrictEqual(200);
      const res = quizGetTrash(token);
      expect(res.statusCode).toStrictEqual(200);
      expect(res.body).toStrictEqual({
        quizzes: [
          {
            quizId: quizId,
            name: 'Test quiz',
          },
        ],
      });
    });
  });
});

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

///////////////////////////////////////////////
// Test for adminQuizThumbnail ////////////////
///////////////////////////////////////////////
describe('PUT /v1/admin/quiz/:quizId/thumbnail', () => {
  let quizId: number;
  beforeEach(() => {
    // create a quiz
    const createQuizRes = quizCreate(token, 'Test Quiz', 'A test quiz');
    expect(createQuizRes.statusCode).toBe(200);
    quizId = createQuizRes.body.quizId;
  });

  describe('invalid cases', () => {
    test('invalid url', () => {
      const res1 = quizUpdateThumbnail(token, quizId, 'https://teachyourselfcs.com');
      expect(res1.statusCode).toBe(400);
      expect(res1.body).toStrictEqual(ERROR);

      const res2 = quizUpdateThumbnail(token, quizId, 'webcms3.cse.unsw.edu.au/DPST1093/24C3');
      expect(res1.statusCode).toBe(400);
      expect(res1.body).toStrictEqual(ERROR);
    });

    test('token is empty', () => {
      const res = quizUpdateThumbnail('', quizId, 'http://google.com/some/image/path.jpg');
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('token does not refer to valid logged in user session', () => {
      const res = quizUpdateThumbnail('invalidToken', quizId, 'http://google.com/some/image/path.jpg');
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('user is not an owner of the quiz', () => {
      const registerRes = userRegister('peter@gmail.com', 'PumpkinEater123', 'Peter', 'Griffin');
      expect(registerRes.statusCode).toBe(200);
      const token1 = registerRes.body.token;
      const res = quizUpdateThumbnail(token1, quizId, 'http://google.com/some/image/path.jpg');
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('quiz does not exist', () => {
      const res = quizUpdateThumbnail(token, 0, 'http://google.com/some/image/path.jpg');
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });
  });

  describe('valid cases', () => {
    test('has correct return type', () => {
      const res = quizUpdateThumbnail(token, quizId, 'http://google.com/some/image/path.jpg');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
    });

    test('time last edited time updated', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = quizUpdateThumbnail(token, quizId, 'http://google.com/some/image/path.jpg');
      expect(res.statusCode).toBe(200);
      const infoRes = quizGetDetails(token, quizId);
      expect(infoRes.statusCode).toBe(200);
      expect(infoRes.body.timeLastEdited).not.toStrictEqual(infoRes.body.timeCreated);
    });

    test('success update url', async () => {
      const beforeInfoRes = quizGetDetails(token, quizId);
      expect(beforeInfoRes.statusCode).toBe(200);

      await new Promise(resolve => setTimeout(resolve, 50)); // set time out incase file overwritting
      const res = quizUpdateThumbnail(token, quizId, 'http://google.com/some/image/path.jpg');
      expect(res.statusCode).toBe(200);

      const afterInfoRes = quizGetDetails(token, quizId);
      expect(afterInfoRes.statusCode).toBe(200);
      expect(afterInfoRes.body.thumbnailUrl).not.toStrictEqual(beforeInfoRes.body.thumbnailUrl);
    });
  });
});
