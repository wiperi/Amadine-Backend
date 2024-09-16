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
  isUserQuiz,
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
export function adminQuizDescriptionUpdate(authUserId, quizId, description) {
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
export function adminQuizInfo(authUserId, quizId) {
  if (!isValidUserId(authUserId)) {
    return { error: ERROR_MESSAGES.UID_NOT_EXIST };
  }
  if (!isValidQuizId(quizId)) {
    return { error: ERROR_MESSAGES.INVALID_QUIZ_ID };
  }
  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    return { error: ERROR_MESSAGES.NOT_AUTHORIZED };
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
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of quiz.
 * @param {string} name - name of Quiz which should be updated.
 * @returns {} - An empty object. 
 */
export function adminQuizNameUpdate(authUserId, quizId, name) {
  return {};
}



/**
 * Creates a new quiz if the provided user ID, name, and description are valid.
 *
 * @param {string} authUserId - The ID of the authenticated user creating the quiz.
 * @param {string} name - The name of the quiz.
 * @param {string} description - The description of the quiz.
 * @returns {Object} An object containing either the new quiz ID or an error message.
 * @returns {Object} return.error - An error message if the user ID, name, or description is invalid.
 * @returns {number} return.quizId - The ID of the newly created quiz if successful.
 */
export function adminQuizCreate(authUserId, name, description) {
  if (!isValidUserId(authUserId)) {
    return { error: ERROR_MESSAGES.UID_NOT_EXIST };
  }
  if (!isValidQuizName(name)) {
    return { error: ERROR_MESSAGES.INVALID_NAME };
  }
  if (!isValidQuizDescription(description)) {
    return { error: ERROR_MESSAGES.INVALID_DESCRIPTION };
  }
  const quizId = getNewID();
  getData().quizzes.push(new Quiz(authUserId, quizId, name, description));
  return {
    quizId: quizId
  };
}

/**
 * Retrieves a list of quizzes created by a specific authenticated user, 
 * if the user ID is valid. The quizzes are returned with their IDs and names.
 *
 * @param {string} authUserId - The authenticated user's ID to filter the quizzes.
 * 
 * @returns {Object} - Returns an object containing either the list of quizzes or an error message.
 * @returns {Object[]} [quizzes] - An array of quizzes created by the authenticated user, 
 * each object containing the quiz ID and quiz name.
 * @returns {string} quizzes[].quizId - The unique identifier of the quiz.
 * @returns {string} quizzes[].name - The name of the quiz.
 * @returns {Object} [error] - Returns an error object if the user ID is not valid.
 * @returns {string} error.message - The specific error message.
 * 
 * @example
 * // Example usage:
 * const result = adminQuizList('123412341234');
 * if (result.error) {
 *   console.log(result.error.message); // Handle error
 * } else {
 *   console.log(result.quizzes); // List of quizzes
 * }
 */
export function adminQuizList(authUserId) {

  if (!isValidUserId(authUserId)) {
    return { error: ERROR_MESSAGES.UID_NOT_EXIST };
  }

  // filter quizzes by authUserId, then map to correct format
  const quizzes = getData().quizzes.filter(quiz => quiz.authUserId === authUserId).map(quiz => {
    return {
      quizId: quiz.quizId,
      name: quiz.name
    };
  });

  return { quizzes: quizzes };
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