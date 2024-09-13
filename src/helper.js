import { getData, setData } from "./dataStore.js";
import { ERROR_MESSAGES } from "../src/errors.js";
import isEmail from 'validator/lib/isEmail.js';

/**
 * Generates a random 12-digit ID that is not already in use.
 *
 * @returns {number} A random 12-digit number.
 */
export function getNewID() {
  let id =  Math.floor((Math.random() * (9 * Math.pow(10, 11))) + Math.pow(10, 11));
  const data = getData();
  while (data.user.some(user => user.userId === id) || data.quiz.some(quiz => quiz.quizId === id)) {
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

export function isValidEmail(email) {
  return false;
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

export function isValidQuizName(quizName) {
  return false;
}

export function isValidQuizDescription(quizDescription) {
  return false;
}

/**
 * Checks if the given user ID is valid by verifying its presence in the user list.
 *
 * @param {number} id - The user ID to validate.
 * @returns {boolean} - Returns true if the user ID is found in the user list, otherwise false.
 */
export function isValidUserId(id) {
  let userList = getData().user;
  return userList.some((user) => user.userId === id);
}

/**
 * Checks if the provided quizId is valid for the user.
 *
 * @param {string} quizId - The ID of the quiz to validate.
 * @param {string} authUserId - The ID of the quiz author.
 * @returns {boolean} - Returns true if the quizId refers to a valid quiz and owned by the users, otherwise false.
 */
export function isValidQuizId(quizId, authUserId) {
  let quizList = getData().quiz;
  return quizList.some((quiz) => quiz.quizId === quizId && quiz.authUserId === authUserId);
}

