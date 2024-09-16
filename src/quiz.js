import { adminAuthRegister } from './auth.js';
import { getData, Quiz, User } from './dataStore.js';
import { ERROR_MESSAGES } from './errors.js';
import {
  getNewID,
  isValidEmail,
  isValidPassword,
  isValidUserId,
  isValidUserName,
  isQuizIdOwnedByUser,
  isValidQuizId,
  findQuizById,
} from './helper.js';
import { isValidQuizName, isValidQuizDescription } from './helper.js';

/**
 * Update the description of the relevant quiz.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of quiz.
 * @param {string} description - The description of the quiz.
 * @returns {Object} - An empty object.
 */
export function adminQuizDescriptionUpdate (authUserId, quizId, description) {
  return {};
}

/**
 * Get all of the relevant information about the current quiz.
 * 
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of quiz.
 * @returns {Object} - Object with quizId, name, timeCreated,
 *                     timeLastEdited and description
 */
export function adminQuizInfo(authUserId, quizId){
  if(!isValidUserId(authUserId)){
    return {error: ERROR_MESSAGES.UID_NOT_EXIST};
  }
  if(!isValidQuizId(quizId)){
    return {error: ERROR_MESSAGES.INVALID_QUIZ_ID};
  }
  if(!isQuizIdOwnedByUser(quizId, authUserId)){
    return {error: ERROR_MESSAGES.NOT_AUTHORIZED};
  }
  const quiz = getData().quizzes.find(quiz => quiz.quizId === quizId);
  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description
  };
}

/**
 * Update the name of the relevant quiz.
 *  error cases:
 *    1. authUserId is not a valid user
 *    2. quizId does not refer to a valid quiz
 *    3. quizId does not refer to a quiz that this user owns
 *    4. name contains invalid characters.
 *    5. name length < 3 or > 30
 *    6. name is already used by the current logged in user for another quiz
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of quiz.
 * @param {string} name - name of Quiz which should be updated.
 * @returns {} - An empty object. 
 */
export function adminQuizNameUpdate(authUserId, quizId, name){
  if (!isValidUserId(authUserId)) {
    return { error: ERROR_MESSAGES.UID_NOT_EXIST };
  }

  if (!isValidQuizId(quizId)) {
    return { error: ERROR_MESSAGES.INVALID_QUIZ_ID };
  }

  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    return { error: ERROR_MESSAGES.NOT_AUTHORIZED };
  }

  if (!isValidQuizName(name)) {
    return { error: ERROR_MESSAGES.INVALID_NAME };
  }

  let quiz = findQuizById(quizId);  
  quiz.name = name;
  quiz.timeLastEdited = Date.now();

  return {};
}

/**
 * 
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {string} name - name of Quiz which should be updated.
 * @param {string} description - The ID of the authenticated user.
 * @returns 
 */
export function adminQuizCreate (authUserId, name, description) {
  if(!isValidUserId(authUserId)){
    return {error: ERROR_MESSAGES.UID_NOT_EXIST};
  }
  if(!isValidQuizName(name)){
    return {error: ERROR_MESSAGES.INVALID_NAME};
  }
  if(!isValidQuizDescription(description)){
    return {error: ERROR_MESSAGES.INVALID_DESCRIPTION};
  }
  const quizId = getNewID();
  getData().quizzes.push(new Quiz(authUserId, quizId, name, description));
  return {
    quizId: quizId
  };
}

/**
 * Retrieves the quiz list for an admin user.
 * 
 * @param {number} authUserId - The ID of the authenticated user.
 * @property {Array} quizzes - The array of quizzes.
 * @property {number} quizzes.quizId - The ID of the quiz.
 * @property {string} quizzes.name - The name of the quiz.
 * @returns {Object} - An object containing the list of quizzes.
 */
export function adminQuizList(authUserId) {
  return { quizzes: [{ quizId: 1, name: 'My Quiz', }] }
}

/**
 * 
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of quiz.
 * @returns 
 */
export function adminQuizRemove(authUserId, quizId) {
  return {};
}