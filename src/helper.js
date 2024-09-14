
import { getData } from "./dataStore.js";
import isEmail from 'validator/lib/isEmail.js';

/**
 * Generates a random 12-digit ID that is not already in use.
 *
 * @returns {number} A random 12-digit number.
 */
export function getNewID() {
  let id =  Math.floor((Math.random() * (9 * Math.pow(10, 11))) + Math.pow(10, 11));
  const data = getData();
  while (data.users.some(user => user.userId === id) || data.quizzes.some(quiz => quiz.quizId === id)) {
    id =  Math.floor((Math.random() * (9 * Math.pow(10, 11))) + Math.pow(10, 11));
  }
  return id;
}

/**
 * validate password, password must be at least 8 characters long
 * and contain at least one number and one letter
 * @param {string} password
 * @returns {boolean}
 */
export function isValidPassword(password) {
  const numberRequirement = /[0-9]/.test(password);
  const letterRequirement = /[a-zA-Z]/.test(password);

  return (password.length >= 8 && numberRequirement && letterRequirement);  
}

/**
 * Check the email, the email must follow the format
 * and one email can not use twice
 * and the string of email can not be empty
 * @param {string} email - The email of user
 * @returns {boolean} - Return true if email is correct
 */
export function isValidEmail(email) {
  return isEmail(email) && getData().users.every(user => user.email !== email);
}

/**
 * check the format and length of the userName
 * Name need more than 1 characters and less than 21 characters
 * Name cannot contains characters other than lowercase letters, 
 * uppercase letters, spaces, hyphens, or apostrophes
 * 
 * @param {string} userName - the name of user
 * @returns {boolean} - return true if userName is correct
 */
export function isValidUserName(userName) {
  const nameRegex = /^[a-zA-Z\s'-]+$/;

  if (userName.length < 2 || userName.length > 20) {
    return false;
  }

  if (!nameRegex.test(userName)) {
    return false;
  }

  return true;
}

/**
 * check if the provided quiz name is in a valid format
 * invalid cases:
 *  1. contain not alphanumeric or spaces
 *  2. < 3 or > 30 characters
 *  3. already used by current logged in user for another quiz
 * 
 * @param {string} quizName 
 * @returns {boolean} - return whether quiz name is valid
 */
export function isValidQuizName(quizName) {
  // regex for alphanumeric and spaces
  const regex = /^[a-z0-9\s]+$/i;
  if (!regex.test(quizName)) {
    return false;
  }

  if (quizName.length < 3 || quizName.length > 30) {
    return false;
  }

  const quizList = getData().quizzes;
  if (quizList.some((quiz) => quiz.name === quizName && quiz.active === true)){
    return false;
  }

  return true;
}

/**
 * check if the provided quiz description is valid
 * invalid cases:
 *  1. quiz description is more than 100 characters in length
 * 
 * @param {string} quizDescription 
 * @returns {boolean} - return whether quiz description is valid
 */
export function isValidQuizDescription(quizDescription) {
  return quizDescription.length <= 100;
}


/**
 * Checks if the given user ID is valid by verifying its presence in the user list.
 *
 * @param {number} id - The user ID to validate.
 * @returns {boolean} - Returns true if the user ID is found in the user list, otherwise false.
 */
export function isValidUserId(id) {
  let userList = getData().users;
  return userList.some((user) => user.userId === id);
}


/**
 * 
 * @param {number} userId 
 * @returns {object} - user object
 */
export function findUserById(userId) {
  return getData().users.find(user => user.userId === userId);
}

/**
 * Checks if the provided quizId is valid.
 *
 * @param {number} quizId - The ID of the quiz to validate.
 * @returns {boolean} - Returns true if the quizId refers to a active quiz, otherwise false.
 */
export function isValidQuizId(quizId) {
  let quizList = getData().quizzes;
  return quizList.some((quiz) => quiz.quizId === quizId && quiz.active);
}


/**
 * Checks if a quiz with the given quizId is owned by the user with the given authUserId and is active.
 *
 * @param {string} quizId - The ID of the quiz to check.
 * @param {string} authUserId - The ID of the user to check ownership against.
 * @returns {boolean} - Returns true if the quiz is owned by the user and is active, otherwise false.
 */
export function isQuizIdOwnedByUser(quizId, authUserId) {
  let quizList = getData().quizzes;
  return quizList.some((quiz) => quiz.quizId === quizId && quiz.authUserId === authUserId && quiz.active);
}
