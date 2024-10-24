import {
  userLogout,
  userGetDetails,
  userUpdateDetails,
  userUpdatePassword,
} from './helpers';
import { clear ,userRegister, userLogin } from '../v1/helpers';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clear();
});

afterAll(() => {
  clear();
});

describe('POST /v2/admin/auth/logout', () => {
  let token: string;
  beforeEach(() => {
    // Register a user and get the token
    const res = userRegister('test@example.com', 'ValidPass123', 'John', 'Doe');
    expect(res.statusCode).toBe(200);
    token = res.body.token;
  });
  describe('valid cases', () => {
    test('successful logout', async () => {
      const res = userLogout(token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({});

      // Verify that the token is no longer valid
      // - Since jet generation is based on time, we need to wait for a second to ensure the new token is different to old one
      await new Promise(resolve => setTimeout(resolve, 1000));
      const loginRes = userLogin('test@example.com', 'ValidPass123');
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty('token');
      expect(loginRes.body.token).not.toBe(token);
    });
  });
});

describe('GET /v2/admin/user/details', () => {
  test('valid case', () => {
    const registerRes = userRegister('wick@example.com', 'JohnWick123', 'John', 'Wick');
    expect(registerRes.statusCode).toBe(200);
    const user = registerRes.body;
    const token = user.token;
    userLogin('wick@example.com', 'JohnWick123');
    userLogin('wick@example.com', 'JohnWick12');
    userLogin('wick@example.com', 'JohnWick1234');
    const detailsRes = userGetDetails(token);

    expect(detailsRes.statusCode).toBe(200);
    const details = detailsRes.body;
    expect(details).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'John Wick',
        email: 'wick@example.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 2,
      },
    });
  });
});

describe('PUT /v2/admin/user/details', () => {
  let token: string;
  beforeEach(() => {
    // Register a user to get the token
    const registerRes = userRegister('handsomejim@example.com', 'ValidPass123', 'Jim', 'Hu');
    expect(registerRes.statusCode).toBe(200);
    token = registerRes.body.token;
  });
  describe('valid case', () => {
    test('successful update of user details', () => {
      const res = userUpdateDetails(token, 'newemail@example.com', 'Johnny', 'Smith');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
    });
  });
});

describe('PUT /v2/admin/user/password', () => {
  let token: string;
  beforeEach(() => {
    const res = userRegister('test@example.com', 'OldPassword123', 'John', 'Doe');
    expect(res.statusCode).toBe(200);
    token = res.body.token;
  });

  describe('valid cases', () => {
    test('successful password update', () => {
      const res = userUpdatePassword(token, 'OldPassword123', 'NewPassword456');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});

      const loginRes = userLogin('test@example.com', 'NewPassword456');
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty('token');
    });
  });
});
