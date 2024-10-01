import { getData, User, UserSession, setData, EmptyObject, HttpError } from './dataStore';
import { ERROR_MESSAGES } from './errors';
import {
  getNewID,
  isUnusedEmail,
  isValidEmail,
  isValidPassword,
  isValidUserId,
  isValidUserName,
} from './helper';
import jwt from 'jsonwebtoken';
import config from './config.json';
import { Request, Response, NextFunction } from 'express';

export function authorizeToken(req: Request, res: Response, next: NextFunction) {
  // Authorization white list
  const whiteList = ['/v1/admin/auth/register', '/v1/admin/auth/login', '/v1/clear'];
  if (whiteList.includes(req.url)) {
    next();
    return;
  }

  // Get token from request
  let token: string;

  if (req.url.includes('v1')) {
    // For GET and DELETE, get token from query params
    if (req.method === 'GET' || req.method === 'DELETE') {
      token = req.query.token as string;
    }
    // For POST and PUT, get token from body
    if (req.method === 'POST' || req.method === 'PUT') {
      token = req.body.token as string;
    }
  }

  if (req.url.includes('v2')) {
    // Get token from header.token
    token = req.header('token') as string;
  }

  if (!token) {
    return res.status(401).json({ error: ERROR_MESSAGES.MISSING_TOKEN });
  }

  // Check if token is valid
  const userSession = getData().userSessions.find((session) => session.token === token);
  if (!userSession) {
    return res.status(401).json({ error: ERROR_MESSAGES.INVALID_TOKEN });
  }

  // Set authUserId in request
  req.body.authUserId = userSession.authUserId;

  next();
}

/**
 * Register a user with an email, password, and names,
 * then returns their authUserId value.
 */
export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): { token: string } {
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

  data.users.push(new User(userId, email, password, nameFirst, nameLast));

  const token = jwt.sign({ userId }, config.jwtSecretKey);

  data.userSessions.push(new UserSession(getNewID('user session'), userId, token));

  setData(data);

  return { token };
}

/**
 * Given a registered user's email and password
 * returns their authUserId value.
 */
export function adminAuthLogin(email: string, password: string): { token: string } {
  const data = getData();

  if (!email || !password) {
    throw new HttpError(400, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
  }

  const user = data.users.find(user => user.email === email);

  if (!user) {
    throw new HttpError(400, ERROR_MESSAGES.EMAIL_NOT_EXIST);
  }

  if (user.password !== password) {
    user.numFailedPasswordsSinceLastLogin++;
    throw new HttpError(400, ERROR_MESSAGES.WRONG_PASSWORD);
  }

  user.numFailedPasswordsSinceLastLogin = 0;
  user.numSuccessfulLogins++;

  const token = jwt.sign({ userId: user.userId }, config.jwtSecretKey);

  data.userSessions.push(new UserSession(getNewID('user session'), user.userId, token));

  setData(data);

  return { token };
}

/**
 * Updates the details of an admin user.
 */
export function adminUserDetailsUpdate(authUserId: number, email: string, nameFirst: string, nameLast: string): EmptyObject {

  if (!isValidEmail(email)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_EMAIL_FORMAT);
  }

  const data = getData();
  const user = data.users.find((user) => user.userId === authUserId);

  const emailUsedByOthers = data.users.find(user => user.email === email && user.userId !== authUserId);

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
  }
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
    }
  };
}

/**
 * Updates the password for an admin user.
 */
export function adminUserPasswordUpdate(authUserId: number, oldPassword: string, newPassword: string): EmptyObject {
  if (!authUserId || !oldPassword || !newPassword) {
    throw new HttpError(400, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
  }

  if (!isValidUserId(authUserId)) {
    throw new HttpError(400, ERROR_MESSAGES.UID_NOT_EXIST);
  }

  const user = getData().users.find(user => user.userId === authUserId);

  if (!user) {
    throw new HttpError(400, ERROR_MESSAGES.UID_NOT_EXIST);
  }

  if (oldPassword !== user.password) {
    throw new HttpError(400, ERROR_MESSAGES.WRONG_OLD_PASSWORD);
  }

  if (oldPassword === newPassword) {
    throw new HttpError(400, ERROR_MESSAGES.NEW_PASSWORD_SAME_AS_OLD);
  }

  if (user.oldPasswords.includes(newPassword)) {
    throw new HttpError(400, ERROR_MESSAGES.PASSWORD_ALREADY_USED);
  }

  if (!isValidPassword(newPassword)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_PASSWORD);
  }

  user.oldPasswords.push(oldPassword);
  user.password = newPassword;

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
