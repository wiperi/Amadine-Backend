import { getData, Quiz, User } from './dataStore.js';
import { ERROR_MESSAGES } from './errors.js';
import {
  getNewID,
  isValidEmail,
  isValidPassword,
  isValidUserId,
  isValidUserName,
} from './helper.js';

/**
 * Register a user with an email, password, and names, 
 * then returns their authUserId value.
 * 
 * @param {string} email - The email address of a user
 * @param {string} password - The password of a user
 * @param {string} nameFirst - The first name of a user
 * @param {string} nameLast - The last name of a user
 * @returns {{ authUserId }} - Object with authUserId value
 */
export function adminAuthRegister(email, password, nameFirst, nameLast) {

  const data = getData();

  if (!isValidEmail(email)) {
    return { error: ERROR_MESSAGES.INVALID_EMAIL };
  }

  if (!isValidUserName(nameFirst) || !isValidUserName(nameLast)) {
    return { error: ERROR_MESSAGES.INVALID_NAME };
  }

  if (!isValidPassword(password)) {
    return { error: ERROR_MESSAGES.INVALID_PASSWORD };
  }

  const userId = getNewID();
  data.user.push(new User(userId, email, password, nameFirst, nameLast));

  return { authUserId: userId };
}


/**
 * Given a registered user's email and password 
 * returns their authUserId value.
 * 
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {{ authUserId }} - Object with authUserId value
 */
export function adminAuthLogin(email, password) {
  const data = getData();

  const user = data.user.find(user => user.email === email);

  // error case 1:
  //  email address does not exist
  if (!user) {
    return { error: ERROR_MESSAGES.EMAIL_NOT_EXIST };
  }

  // error case 2:
  //  password is not correct for the given email
  if (user.password !== password) {

    user.numFailedPasswordsSinceLastLogin++;

    return { error: ERROR_MESSAGES.WRONG_PASSWORD };
  }

  // successful login
  user.numFailedPasswordsSinceLastLogin = 0;
  user.numSuccessfulLogins++;

  return { authUserId: user.userId };
}

/**
 * Updates the details of an admin user.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {string} email - The email address of the admin user.
 * @param {string} nameFirst - The first name of the admin user.
 * @param {string} nameLast - The last name of the admin user.
 * @returns {Object} - An empty object.
 */
export function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
  return {}
}

/**
 * Given an admin user's authUserId, return details about the user.
 * "name" is the first and last name concatenated 
 * with a single space between them.
 * 
 * @param {number} authUserId - User's Id
 * @returns {Object} - Object with userId, name, email, times of successful logins
 *                     times of failed passwords since last login
 */
export function adminUserDetails(authUserId) {
  const data = getData();
  const user = data.user.find(user => user.userId === authUserId);
  if (!user) {
    return { error: ERROR_MESSAGES.UID_NOT_EXIST };
  }

  return {
    user:
    {
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
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {string} oldPassword - The old password of the admin user.
 * @param {string} newPassword - The new password for the admin user.
 * @returns {Object} - An empty object.
 */
export function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {

  if (!isValidUserId(authUserId)) {
    return { error: ERROR_MESSAGES.UID_NOT_EXIST };
  }

  const user = getData().user.find(user => user.userId === authUserId);

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

  return {}
}

