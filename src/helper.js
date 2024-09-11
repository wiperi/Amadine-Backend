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

export function invalidPassword(password) {
  if(password.length < 8){
    return true;
  }
  const numberRequirement = /[0-9]/.test(password);
  const letterRequirement = /[a-zA-Z]/.test(password);
  return !(numberRequirement && letterRequirement);
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


