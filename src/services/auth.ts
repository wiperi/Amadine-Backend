import { getData, setData } from '@/dataStore';
import { HttpError } from '@/utils/HttpError';
import { User, UserSession } from '@/models/Classes';
import { EmptyObject } from '@/models/Types';
import { ERROR_MESSAGES } from '@/utils/errors';
import {
  getNewID,
  isUnusedEmail,
  isValidEmail,
  isValidPassword,
  isValidUserName,
} from '@/utils/helper';
import jwt from 'jsonwebtoken';
import config from '@/config';
import { Request, Response, NextFunction } from 'express';
import { hash, hashCompare } from '@/utils/helper';

export function authorizeToken(req: Request, res: Response, next: NextFunction) {
  // Authorization white list
  const whiteList = [
    '/v1/admin/auth/register',
    '/v1/admin/auth/login',
    '/v1/clear',
    '/v1/player/join',
    '/v1/player/:playerId/question/:questionposition',
    '/v1/player/:playerId/chat',
  ];
  const isWhitelisted = whiteList.some(path => {
    const regexPath = path.replace(/:[^\s/]+/g, '([\\w-]+)');
    return new RegExp(`^${regexPath}$`).test(req.path);
  });

  if (isWhitelisted) {
    next();
    return;
  }

  // Get token from request
  let token: string | undefined;

  if (!(token = req.header('token'))) {
    // For GET and DELETE, get token from query params
    if (req.method === 'GET' || req.method === 'DELETE') {
      token = req.query.token as string;
    }
    // For POST and PUT, get token from body
    if (req.method === 'POST' || req.method === 'PUT') {
      token = req.body.token as string;
    }
  }

  if (!token) {
    return next(new HttpError(401, ERROR_MESSAGES.MISSING_TOKEN));
  }

  // Check if token is valid
  const userSession = getData().userSessions.find(session => session.token === token);
  if (!userSession) {
    return next(new HttpError(401, ERROR_MESSAGES.INVALID_TOKEN));
  }

  // Set authUserId in request
  req.body.authUserId = userSession.authUserId;

  next();
}

/**
 * Register a user with an email, password, and names,
 * then returns their authUserId value.
 */
export async function adminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): Promise<{ token: string }> {
  const data = getData();

  if (!email || !password || !nameFirst || !nameLast) {
    throw new HttpError(400, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
  }

  if (!isValidEmail(email)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_EMAIL_FORMAT);
  }

  if (!isUnusedEmail(email)) {
    throw new HttpError(400, ERROR_MESSAGES.USED_EMAIL);
  }

  if (!isValidUserName(nameFirst) || !isValidUserName(nameLast)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_NAME);
  }

  if (!isValidPassword(password)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_PASSWORD);
  }

  const userId = getNewID('user');

  const hashedPassword = await hash(password);

  data.users.push(new User(userId, email, hashedPassword, nameFirst, nameLast));

  const token = jwt.sign({ payload: Math.random() }, config.jwtSecretKey);

  data.userSessions.push(new UserSession(getNewID('user session'), userId, token));

  setData(data);

  return { token };
}

/**
 * Given a registered user's email and password
 * returns their authUserId value.
 */
export async function adminAuthLogin(email: string, password: string): Promise<{ token: string }> {
  const data = getData();

  if (!email || !password) {
    throw new HttpError(400, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
  }

  const user = data.users.find(user => user.email === email);

  if (!user) {
    throw new HttpError(400, ERROR_MESSAGES.EMAIL_NOT_EXIST);
  }

  if (!(await hashCompare(password, user.password))) {
    user.numFailedPasswordsSinceLastLogin++;
    throw new HttpError(400, ERROR_MESSAGES.WRONG_PASSWORD);
  }

  user.numFailedPasswordsSinceLastLogin = 0;
  user.numSuccessfulLogins++;

  const token = jwt.sign({ payload: Math.random() }, config.jwtSecretKey);

  data.userSessions.push(new UserSession(getNewID('user session'), user.userId, token));

  setData(data);

  return { token };
}

/**
 * Updates the details of an admin user.
 */
export function adminUserDetailsUpdate(
  authUserId: number,
  email: string,
  nameFirst: string,
  nameLast: string
): EmptyObject {
  if (!isValidEmail(email)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_EMAIL_FORMAT);
  }

  const data = getData();
  const user = data.users.find(user => user.userId === authUserId);

  const emailUsedByOthers = data.users.find(
    user => user.email === email && user.userId !== authUserId
  );

  if (emailUsedByOthers) {
    throw new HttpError(400, ERROR_MESSAGES.USED_EMAIL);
  }

  if (!isValidUserName(nameFirst) || !isValidUserName(nameLast)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_NAME);
  }

  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  setData(data);
  return {};
}

/**
 * Given an admin user's authUserId, return details about the user.
 * "name" is the first and last name concatenated
 * with a single space between them.
 */
export function adminUserDetails(authUserId: number): {
  user: {
    userId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  };
} {
  const data = getData();
  const user = data.users.find(user => user.userId === authUserId);

  return {
    user: {
      userId: user.userId,
      name: `${user.nameFirst} ${user.nameLast}`,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    },
  };
}

/**
 * Updates the password for an admin user.
 */
export async function adminUserPasswordUpdate(
  authUserId: number,
  oldPassword: string,
  newPassword: string
): Promise<EmptyObject> {
  if (!authUserId || !oldPassword || !newPassword) {
    throw new HttpError(400, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
  }

  const user = getData().users.find(user => user.userId === authUserId);

  if (!user) {
    throw new HttpError(400, ERROR_MESSAGES.UID_NOT_EXIST);
  }

  if (!(await hashCompare(oldPassword, user.password))) {
    throw new HttpError(400, ERROR_MESSAGES.WRONG_OLD_PASSWORD);
  }

  if (oldPassword === newPassword) {
    throw new HttpError(400, ERROR_MESSAGES.NEW_PASSWORD_SAME_AS_OLD);
  }

  if (user.oldPasswords.some(async password => await hashCompare(newPassword, password))) {
    throw new HttpError(400, ERROR_MESSAGES.PASSWORD_ALREADY_USED);
  }

  if (!isValidPassword(newPassword)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_PASSWORD);
  }

  user.oldPasswords.push(user.password);
  user.password = await hash(newPassword);

  setData();

  return {};
}

export function adminAuthLogout(token: string): EmptyObject {
  // token is guaranteed to be valid by the time this function is called
  const { userSessions } = getData();
  for (let i = 0; i < userSessions.length; i++) {
    if (userSessions[i].token === token) {
      userSessions.splice(i);
      break;
    }
  }

  setData();

  return {};
}
