import { getData, User } from './dataStore';
import { ERROR_MESSAGES } from './errors';
import {
  getNewID,
  isUnusedEmail,
  isValidEmail,
  isValidPassword,
  isValidUserId,
  isValidUserName,
} from './helper';

/**
 * Register a user with an email, password, and names, 
 * then returns their authUserId value.
 */
export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): { authUserId: number } | { error: string } {
  const data = getData();

  if (!isValidEmail(email)) {
    return { error: ERROR_MESSAGES.INVALID_EMAIL_FORMAT };
  }

  if (!isUnusedEmail(email)) {
    return { error: ERROR_MESSAGES.USED_EMAIL };
  }

  if (!isValidUserName(nameFirst) || !isValidUserName(nameLast)) {
    return { error: ERROR_MESSAGES.INVALID_NAME };
  }

  if (!isValidPassword(password)) {
    return { error: ERROR_MESSAGES.INVALID_PASSWORD };
  }

  const userId = getNewID();
  data.users.push(new User(userId, email, password, nameFirst, nameLast));

  return { authUserId: userId };
}

/**
 * Given a registered user's email and password 
 * returns their authUserId value.
 */
export function adminAuthLogin(email: string, password: string): { authUserId: number } | { error: string } {
  const data = getData();

  const user = data.users.find(user => user.email === email);

  if (!user) {
    return { error: ERROR_MESSAGES.EMAIL_NOT_EXIST };
  }

  if (user.password !== password) {
    user.numFailedPasswordsSinceLastLogin++;
    return { error: ERROR_MESSAGES.WRONG_PASSWORD };
  }

  user.numFailedPasswordsSinceLastLogin = 0;
  user.numSuccessfulLogins++;

  return { authUserId: user.userId };
}

/**
 * Updates the details of an admin user.
 */
export function adminUserDetailsUpdate(authUserId: number, email: string, nameFirst: string, nameLast: string): {} | { error: string } {
  if (!isValidUserId(authUserId)) {
    return { error: ERROR_MESSAGES.UID_NOT_EXIST };
  }
  
  if (!isValidEmail(email)) {
    return { error: ERROR_MESSAGES.INVALID_EMAIL_FORMAT };
  }

  const data = getData();
  const user = data.users.find((user) => user.userId === authUserId);
  
  if (!user) {
    return { error: ERROR_MESSAGES.UID_NOT_EXIST };
  }

  const emailUsedByOthers = data.users.find(user => user.email === email && user.userId !== authUserId);

  if (emailUsedByOthers) {
    return { error: ERROR_MESSAGES.USED_EMAIL };
  }

  if (!isValidUserName(nameFirst) || !isValidUserName(nameLast)) {
    return { error: ERROR_MESSAGES.INVALID_NAME };
  }

  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;

  return {};
}

/**
 * Given an admin user's authUserId, return details about the user.
 * "name" is the first and last name concatenated 
 * with a single space between them.
 */
export function adminUserDetails(authUserId: number): { user: {
  userId: number;
  name: string;
  email: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}} | { error: string } {
  const data = getData();
  const user = data.users.find(user => user.userId === authUserId);
  if (!user) {
    return { error: ERROR_MESSAGES.UID_NOT_EXIST };
  }

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
export function adminUserPasswordUpdate(authUserId: number, oldPassword: string, newPassword: string): {} | { error: string } {
  if (!isValidUserId(authUserId)) {
    return { error: ERROR_MESSAGES.UID_NOT_EXIST };
  }

  const user = getData().users.find(user => user.userId === authUserId);

  if (!user) {
    return { error: ERROR_MESSAGES.UID_NOT_EXIST };
  }

  if (oldPassword !== user.password) {
    return { error: ERROR_MESSAGES.WRONG_OLD_PASSWORD };
  }

  if (oldPassword === newPassword) {
    return { error: ERROR_MESSAGES.NEW_PASSWORD_SAME_AS_OLD };
  }

  if (user.oldPasswords.includes(newPassword)) {
    return { error: ERROR_MESSAGES.PASSWORD_ALREADY_USED };
  }

  if (!isValidPassword(newPassword)) {
    return { error: ERROR_MESSAGES.INVALID_PASSWORD };
  }

  user.oldPasswords.push(oldPassword);
  user.password = newPassword;

  return {};
}