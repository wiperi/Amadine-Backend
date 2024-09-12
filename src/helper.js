import { getData, setData } from "./dataStore.js";
import { ERROR_MESSAGES } from "./errors.js";
import isEmail from 'validator/lib/isEmail.js';


export function getNewID() {
  return 42;
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

export function isValidUserName(userName) {
  return false;
}

export function isValidQuizName(quizName) {
  return false;
}

export function isValidQuizDescription(quizDescription) {
  return false;
}


