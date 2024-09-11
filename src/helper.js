import { getData, setData } from "./dataStore.js";
import { ERROR_MESSAGES } from "./errors.js";
import isEmail from 'validator/lib/isEmail.js';

/**
 * Generates a random 12-digit ID that is not already in use.
 *
 * @returns {number} A random 12-digit number.
 */
export function getNewID() {
  let id =  Math.floor((Math.random() * (9 * Math.pow(10, 11))) + Math.pow(10, 11));
  while (getData().UserMap.has(id) || getData().QuizMap.has(id)) {
    id =  Math.floor((Math.random() * (9 * Math.pow(10, 11))) + Math.pow(10, 11));
  }
  return id;
}

export function invalidPassword(password) {
  return false
}

export function invalidEmail(email) {
  return false;
}

export function invalidUserName(userName) {
  return false;
}

export function invalidQuizName(quizName) {
  return false;
}

export function invalidQuizDescription(quizDescription) {
  return false;
}


